import { logger } from '../utils/logger';
/**
 * calendarSyncService.ts - External Calendar Sync Service for Kaiz 
 * 
 * Handles read-only calendar synchronization with Apple, Google, and Microsoft.
 * This service NEVER writes to user calendars - it only reads event data.
 * 
 * Privacy Notice: "Read-only. We never write to your calendars."
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import { Platform, Alert } from 'react-native';

// Lazy imports for native modules - prevents crash in Expo Go
let Calendar: typeof import('expo-calendar') | null = null;
let AuthSession: typeof import('expo-auth-session') | null = null;
let WebBrowser: typeof import('expo-web-browser') | null = null;
let SecureStore: typeof import('expo-secure-store') | null = null;

// Try to load native modules, fail gracefully if not available
const loadNativeModules = async () => {
    try {
        if (!Calendar) {
            Calendar = await import('expo-calendar');
        }
        if (!AuthSession) {
            AuthSession = await import('expo-auth-session');
        }
        if (!WebBrowser) {
            WebBrowser = await import('expo-web-browser');
        }
        if (!SecureStore) {
            SecureStore = await import('expo-secure-store');
        }
        return true;
    } catch (error) {
        logger.warn('Native calendar modules not available. Calendar sync requires a development build.');
        return false;
    }
};

// Check if native modules are available
const isNativeModuleAvailable = async (): Promise<boolean> => {
    try {
        await loadNativeModules();
        return Calendar !== null;
    } catch {
        return false;
    }
};
import {
    useCalendarSyncStore,
    type CalendarProvider,
    type ExternalCalendar,
    type ExternalEvent,
    type ProviderConnection,
    type ProviderAccount,
} from '../store/calendarSyncStore';

// ============================================================================
// Constants
// ============================================================================

// OAuth Client IDs
// Google Calendar OAuth credentials
const GOOGLE_CLIENT_ID_IOS = '213334506754-k9e7o51nhk43ns35lt9qraut5poidn5j.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_ANDROID = '213334506754-vu4rs22355b10v3j6gp2ogu4qfhhfbhi.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_WEB = '213334506754-5aiv5miv5nm3gm321d9im7d8201f5038.apps.googleusercontent.com';

// Microsoft Calendar OAuth credentials
// Azure Portal App Registration: Kaiz 
// Tenant: ruyotech.com (Directory ID: 39ea8666-ccb0-480d-b319-70005a9b1dd6)
const MICROSOFT_CLIENT_ID = '4bce3d72-b5b4-4d33-bb4f-a16eb0dd8f3e';

// Check if OAuth is configured
const isGoogleConfigured = () => GOOGLE_CLIENT_ID_WEB.length > 10;
const isMicrosoftConfigured = () => MICROSOFT_CLIENT_ID.length > 10;

// Secure store keys - now support multi-account with email suffix
const getSecureStoreKey = (baseKey: string, accountEmail?: string) => {
    const suffix = accountEmail ? `_${accountEmail.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    const key = `${baseKey}${suffix}`;
    logger.log(`[calendarSyncService] getSecureStoreKey: baseKey=${baseKey}, email=${accountEmail}, result=${key}`);
    return key;
};

const SECURE_STORE_KEYS = {
    GOOGLE_ACCESS_TOKEN: 'kaiz_google_calendar_access_token',
    GOOGLE_REFRESH_TOKEN: 'kaiz_google_calendar_refresh_token',
    GOOGLE_TOKEN_EXPIRY: 'kaiz_google_calendar_token_expiry',
    MICROSOFT_ACCESS_TOKEN: 'kaiz_microsoft_calendar_access_token',
    MICROSOFT_REFRESH_TOKEN: 'kaiz_microsoft_calendar_refresh_token',
    MICROSOFT_TOKEN_EXPIRY: 'kaiz_microsoft_calendar_token_expiry',
};

// API endpoints
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const MICROSOFT_GRAPH_API = 'https://graph.microsoft.com/v1.0';

// ============================================================================
// Auth Discovery Documents
// ============================================================================

const googleDiscovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const microsoftDiscovery = {
    authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    revocationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout',
};

// Initialize web browser auth session (lazy)
const initWebBrowser = async () => {
    await loadNativeModules();
    WebBrowser?.maybeCompleteAuthSession();
};

// ============================================================================
// Service Class
// ============================================================================

class CalendarSyncService {
    private static instance: CalendarSyncService;
    private initialized = false;
    
    private constructor() {}
    
    static getInstance(): CalendarSyncService {
        if (!CalendarSyncService.instance) {
            CalendarSyncService.instance = new CalendarSyncService();
        }
        return CalendarSyncService.instance;
    }

    /**
     * Initialize native modules
     */
    async init(): Promise<boolean> {
        if (this.initialized) return true;
        const loaded = await loadNativeModules();
        if (loaded) {
            await initWebBrowser();
            this.initialized = true;
        }
        return loaded;
    }

    /**
     * Check if calendar sync is available (native build required)
     */
    async isAvailable(): Promise<boolean> {
        return isNativeModuleAvailable();
    }
    
    // ========================================================================
    // Apple Calendar (Native)
    // ========================================================================
    
    /**
     * Request permission for Apple Calendar (native calendars)
     */
    async requestAppleCalendarPermission(): Promise<boolean> {
        try {
            await this.init();
            if (!Calendar) return false;
            const { status } = await Calendar.requestCalendarPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            logger.error('Error requesting Apple Calendar permission:', error);
            return false;
        }
    }
    
    /**
     * Check Apple Calendar permission status
     */
    async checkAppleCalendarPermission(): Promise<boolean> {
        try {
            await this.init();
            if (!Calendar) return false;
            const { status } = await Calendar.getCalendarPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            logger.error('Error checking Apple Calendar permission:', error);
            return false;
        }
    }
    
    /**
     * Connect to Apple Calendar (native device calendars)
     */
    async connectAppleCalendar(): Promise<{
        success: boolean;
        calendars?: ExternalCalendar[];
        error?: string;
    }> {
        try {
            await this.init();
            if (!Calendar) {
                return {
                    success: false,
                    error: 'Calendar sync requires a development build. Please run npx expo prebuild.',
                };
            }

            const hasPermission = await this.requestAppleCalendarPermission();
            
            if (!hasPermission) {
                return {
                    success: false,
                    error: 'Calendar permission denied. Please enable it in Settings.',
                };
            }
            
            // Fetch all calendars from device
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            
            logger.log(`[calendarSyncService] Found ${calendars.length} Apple calendars`);
            calendars.forEach((cal, i) => {
                logger.log(`[calendarSyncService] Calendar ${i}: "${cal.title}" (id: ${cal.id}, primary: ${cal.isPrimary})`);
            });
            
            const externalCalendars: ExternalCalendar[] = calendars.map((cal) => ({
                id: cal.id,
                name: cal.title,
                color: cal.color || '#6B7280',
                provider: 'apple' as CalendarProvider,
                isSelected: true, // Auto-select ALL calendars by default
                isPrimary: cal.isPrimary || false,
                accessLevel: cal.allowsModifications ? 'owner' : 'read',
            }));
            
            return {
                success: true,
                calendars: externalCalendars,
            };
        } catch (error) {
            logger.error('Error connecting Apple Calendar:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
    
    /**
     * Fetch events from Apple Calendar
     */
    async fetchAppleCalendarEvents(
        calendarIds: string[],
        startDate: Date,
        endDate: Date
    ): Promise<ExternalEvent[]> {
        try {
            await this.init();
            if (!Calendar) {
                logger.log('[calendarSyncService] Calendar module not available');
                return [];
            }
            
            logger.log(`[calendarSyncService] Fetching Apple events for calendars:`, calendarIds);
            logger.log(`[calendarSyncService] Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
            
            const events = await Calendar.getEventsAsync(
                calendarIds,
                startDate,
                endDate
            );
            
            logger.log(`[calendarSyncService] Raw Apple Calendar events:`, events.length);
            events.forEach((e, i) => {
                logger.log(`[calendarSyncService] Event ${i}: "${e.title}" from ${e.startDate} to ${e.endDate}`);
            });
            
            const mappedEvents = events.map((event) => ({
                id: `apple_${event.id}`,
                calendarId: event.calendarId,
                provider: 'apple' as CalendarProvider,
                title: event.title || 'Untitled Event',
                startDate: new Date(event.startDate).toISOString(),
                endDate: new Date(event.endDate).toISOString(),
                isAllDay: event.allDay || false,
                location: event.location || undefined,
                notes: event.notes || undefined,
                recurrence: event.recurrenceRule ? JSON.stringify(event.recurrenceRule) : undefined,
            }));
            
            logger.log(`[calendarSyncService] Mapped events:`, mappedEvents);
            return mappedEvents;
        } catch (error) {
            logger.error('Error fetching Apple Calendar events:', error);
            return [];
        }
    }
    
    // ========================================================================
    // Google Calendar (OAuth)
    // ========================================================================
    
    /**
     * Get Google OAuth request
     */
    private getGoogleAuthRequest() {
        if (!AuthSession) return null;
        
        // Use platform-specific client IDs
        const clientId = Platform.select({
            ios: GOOGLE_CLIENT_ID_IOS,
            android: GOOGLE_CLIENT_ID_ANDROID,
            default: GOOGLE_CLIENT_ID_WEB,
        })!;
        
        // For iOS, use the reversed client ID as the redirect URI scheme
        // This is Google's required format for native iOS OAuth
        let redirectUri: string;
        if (Platform.OS === 'ios') {
            // Format: com.googleusercontent.apps.{CLIENT_ID_PREFIX}:/oauth2callback
            const clientIdPrefix = GOOGLE_CLIENT_ID_IOS.split('.apps.googleusercontent.com')[0];
            redirectUri = `com.googleusercontent.apps.${clientIdPrefix}:/oauth2callback`;
        } else {
            redirectUri = AuthSession.makeRedirectUri({
                scheme: 'kaizapp',
                path: 'oauth/google',
            });
        }
        
        logger.log('[calendarSyncService] Google OAuth redirect URI:', redirectUri);
        logger.log('[calendarSyncService] Google OAuth client ID:', clientId);
        
        return new AuthSession.AuthRequest({
            clientId,
            scopes: ['https://www.googleapis.com/auth/calendar.readonly', 'email', 'profile'],
            redirectUri,
            responseType: AuthSession.ResponseType.Code,
            usePKCE: true,
            // Force consent screen to ensure all scopes are granted
            extraParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        });
    }
    
    /**
     * Connect to Google Calendar via OAuth
     */
    async connectGoogleCalendar(): Promise<{
        success: boolean;
        accountEmail?: string;
        accountName?: string;
        calendars?: ExternalCalendar[];
        error?: string;
    }> {
        try {
            // Check if Google OAuth is configured
            if (!isGoogleConfigured()) {
                return {
                    success: false,
                    error: 'Google Calendar integration coming soon. OAuth credentials need to be configured.',
                };
            }
            
            await this.init();
            if (!AuthSession) {
                return {
                    success: false,
                    error: 'Calendar sync requires a development build. Please run npx expo prebuild.',
                };
            }

            const request = this.getGoogleAuthRequest();
            if (!request) {
                return { success: false, error: 'Failed to create auth request' };
            }
            
            const result = await request.promptAsync(googleDiscovery);
            
            if (result.type !== 'success' || !result.params.code) {
                return {
                    success: false,
                    error: result.type === 'cancel' ? 'Authorization cancelled' : 'Authorization failed',
                };
            }
            
            // Exchange code for tokens
            // Use the same redirect URI and client ID as the auth request
            const clientId = Platform.select({
                ios: GOOGLE_CLIENT_ID_IOS,
                android: GOOGLE_CLIENT_ID_ANDROID,
                default: GOOGLE_CLIENT_ID_WEB,
            })!;
            
            let redirectUri: string;
            if (Platform.OS === 'ios') {
                const clientIdPrefix = GOOGLE_CLIENT_ID_IOS.split('.apps.googleusercontent.com')[0];
                redirectUri = `com.googleusercontent.apps.${clientIdPrefix}:/oauth2callback`;
            } else {
                redirectUri = AuthSession.makeRedirectUri({
                    scheme: 'kaizapp',
                    path: 'oauth/google',
                });
            }
            
            const tokenResult = await AuthSession.exchangeCodeAsync(
                {
                    clientId,
                    code: result.params.code,
                    redirectUri,
                    extraParams: {
                        code_verifier: request.codeVerifier!,
                    },
                },
                googleDiscovery
            );
            
            // Fetch user info first so we know the email
            const userInfo = await this.fetchGoogleUserInfo(tokenResult.accessToken);
            
            // Store tokens securely (keyed by email for multi-account support)
            await this.storeGoogleTokens(
                tokenResult.accessToken,
                tokenResult.refreshToken || '',
                tokenResult.expiresIn,
                userInfo?.email
            );
            
            // Fetch calendars
            const calendars = await this.fetchGoogleCalendars(tokenResult.accessToken);
            
            // Tag calendars with account ID
            const taggedCalendars = calendars.map(cal => ({
                ...cal,
                accountId: userInfo?.email,
            }));
            
            return {
                success: true,
                accountEmail: userInfo?.email,
                accountName: userInfo?.name,
                calendars: taggedCalendars,
            };
        } catch (error) {
            logger.error('Error connecting Google Calendar:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
    
    /**
     * Store Google tokens securely (multi-account support)
     */
    private async storeGoogleTokens(
        accessToken: string,
        refreshToken: string,
        expiresIn?: number,
        accountEmail?: string
    ): Promise<void> {
        if (!SecureStore) return;
        const accessKey = getSecureStoreKey(SECURE_STORE_KEYS.GOOGLE_ACCESS_TOKEN, accountEmail);
        const refreshKey = getSecureStoreKey(SECURE_STORE_KEYS.GOOGLE_REFRESH_TOKEN, accountEmail);
        const expiryKey = getSecureStoreKey(SECURE_STORE_KEYS.GOOGLE_TOKEN_EXPIRY, accountEmail);
        
        await SecureStore.setItemAsync(accessKey, accessToken);
        if (refreshToken) {
            await SecureStore.setItemAsync(refreshKey, refreshToken);
        }
        if (expiresIn) {
            const expiryDate = new Date(Date.now() + expiresIn * 1000).toISOString();
            await SecureStore.setItemAsync(expiryKey, expiryDate);
        }
    }
    
    /**
     * Get stored Google access token, refreshing if needed (multi-account support)
     */
    async getGoogleAccessToken(accountEmail?: string): Promise<string | null> {
        try {
            await this.init();
            if (!SecureStore) return null;
            
            const accessKey = getSecureStoreKey(SECURE_STORE_KEYS.GOOGLE_ACCESS_TOKEN, accountEmail);
            const expiryKey = getSecureStoreKey(SECURE_STORE_KEYS.GOOGLE_TOKEN_EXPIRY, accountEmail);
            
            const accessToken = await SecureStore.getItemAsync(accessKey);
            const expiryStr = await SecureStore.getItemAsync(expiryKey);
            
            if (!accessToken) return null;
            
            // Check if token is expired
            if (expiryStr) {
                const expiry = new Date(expiryStr);
                if (expiry <= new Date()) {
                    // Token expired, try to refresh
                    return await this.refreshGoogleToken(accountEmail);
                }
            }
            
            return accessToken;
        } catch (error) {
            logger.error('Error getting Google access token:', error);
            return null;
        }
    }
    
    /**
     * Refresh Google access token (multi-account support)
     */
    private async refreshGoogleToken(accountEmail?: string): Promise<string | null> {
        try {
            if (!SecureStore || !AuthSession) return null;
            
            const refreshKey = getSecureStoreKey(SECURE_STORE_KEYS.GOOGLE_REFRESH_TOKEN, accountEmail);
            const refreshToken = await SecureStore.getItemAsync(refreshKey);
            if (!refreshToken) return null;
            
            const result = await AuthSession.refreshAsync(
                {
                    clientId: Platform.select({
                        ios: GOOGLE_CLIENT_ID_IOS,
                        android: GOOGLE_CLIENT_ID_ANDROID,
                        default: GOOGLE_CLIENT_ID_IOS,
                    }),
                    refreshToken,
                },
                googleDiscovery
            );
            
            await this.storeGoogleTokens(
                result.accessToken,
                result.refreshToken || refreshToken,
                result.expiresIn,
                accountEmail
            );
            
            return result.accessToken;
        } catch (error) {
            logger.error('Error refreshing Google token:', error);
            return null;
        }
    }
    
    /**
     * Fetch Google user info
     */
    private async fetchGoogleUserInfo(
        accessToken: string
    ): Promise<{ email: string; name: string } | null> {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            
            if (!response.ok) return null;
            
            const data = await response.json();
            return { email: data.email, name: data.name };
        } catch (error) {
            logger.error('Error fetching Google user info:', error);
            return null;
        }
    }
    
    /**
     * Fetch Google calendars
     */
    async fetchGoogleCalendars(accessToken?: string): Promise<ExternalCalendar[]> {
        try {
            const token = accessToken || (await this.getGoogleAccessToken());
            if (!token) return [];
            
            const response = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (!response.ok) {
                logger.error('[calendarSyncService] Google Calendar API error:', response.status, await response.text());
                return [];
            }
            
            const data = await response.json();
            
            logger.log(`[calendarSyncService] Found ${data.items?.length || 0} Google calendars`);
            
            return (data.items || []).map((cal: any) => ({
                id: cal.id,
                name: cal.summary || cal.id,
                color: cal.backgroundColor || '#4285F4',
                provider: 'google' as CalendarProvider,
                isSelected: true, // Auto-select ALL calendars by default
                isPrimary: cal.primary || false,
                accessLevel: cal.accessRole === 'owner' ? 'owner' : 'read',
            }));
        } catch (error) {
            logger.error('Error fetching Google calendars:', error);
            return [];
        }
    }
    
    /**
     * Fetch events from Google Calendar (multi-account support)
     */
    async fetchGoogleCalendarEvents(
        calendarIds: string[],
        startDate: Date,
        endDate: Date,
        accountEmail?: string
    ): Promise<ExternalEvent[]> {
        try {
            const accessToken = await this.getGoogleAccessToken(accountEmail);
            if (!accessToken) return [];
            
            const allEvents: ExternalEvent[] = [];
            
            for (const calendarId of calendarIds) {
                const params = new URLSearchParams({
                    timeMin: startDate.toISOString(),
                    timeMax: endDate.toISOString(),
                    singleEvents: 'true',
                    orderBy: 'startTime',
                    maxResults: '250',
                });
                
                const response = await fetch(
                    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                
                if (!response.ok) continue;
                
                const data = await response.json();
                
                const events = (data.items || []).map((event: any) => ({
                    id: `google_${event.id}`,
                    calendarId,
                    provider: 'google' as CalendarProvider,
                    title: event.summary || 'Untitled Event',
                    startDate: event.start?.dateTime || event.start?.date,
                    endDate: event.end?.dateTime || event.end?.date,
                    isAllDay: !!event.start?.date && !event.start?.dateTime,
                    location: event.location,
                    notes: event.description,
                    recurrence: event.recurrence?.join('\n'),
                    accountId: accountEmail,
                    accountEmail,
                }));
                
                allEvents.push(...events);
            }
            
            return allEvents;
        } catch (error) {
            logger.error('Error fetching Google Calendar events:', error);
            return [];
        }
    }
    
    /**
     * Disconnect Google Calendar (multi-account support)
     */
    async disconnectGoogleCalendar(accountEmail?: string): Promise<void> {
        try {
            await this.init();
            if (!SecureStore) return;
            
            const accessKey = getSecureStoreKey(SECURE_STORE_KEYS.GOOGLE_ACCESS_TOKEN, accountEmail);
            const refreshKey = getSecureStoreKey(SECURE_STORE_KEYS.GOOGLE_REFRESH_TOKEN, accountEmail);
            const expiryKey = getSecureStoreKey(SECURE_STORE_KEYS.GOOGLE_TOKEN_EXPIRY, accountEmail);
            
            const accessToken = await SecureStore.getItemAsync(accessKey);
            
            // Revoke token if exists
            if (accessToken && AuthSession) {
                try {
                    await AuthSession.revokeAsync(
                        { token: accessToken },
                        googleDiscovery
                    );
                } catch (e) {
                    logger.warn('Failed to revoke Google token:', e);
                }
            }
            
            // Clear stored tokens
            await SecureStore.deleteItemAsync(accessKey);
            await SecureStore.deleteItemAsync(refreshKey);
            await SecureStore.deleteItemAsync(expiryKey);
        } catch (error) {
            logger.error('Error disconnecting Google Calendar:', error);
        }
    }
    
    // ========================================================================
    // Microsoft Calendar (OAuth)
    // ========================================================================
    
    /**
     * Get Microsoft OAuth request
     */
    private getMicrosoftAuthRequest() {
        if (!AuthSession) return null;
        const redirectUri = AuthSession.makeRedirectUri({
            scheme: 'kaizapp',
            path: 'oauth/microsoft',
        });
        
        return new AuthSession.AuthRequest({
            clientId: MICROSOFT_CLIENT_ID,
            scopes: ['Calendars.Read', 'User.Read', 'offline_access'],
            redirectUri,
            responseType: AuthSession.ResponseType.Code,
            usePKCE: true,
        });
    }
    
    /**
     * Connect to Microsoft Calendar via OAuth
     */
    async connectMicrosoftCalendar(): Promise<{
        success: boolean;
        accountEmail?: string;
        accountName?: string;
        calendars?: ExternalCalendar[];
        error?: string;
    }> {
        try {
            // Check if Microsoft OAuth is configured
            if (!isMicrosoftConfigured()) {
                return {
                    success: false,
                    error: 'Microsoft Calendar integration coming soon. OAuth credentials need to be configured.',
                };
            }
            
            await this.init();
            if (!AuthSession) {
                return {
                    success: false,
                    error: 'Calendar integration requires a development build',
                };
            }
            
            const request = this.getMicrosoftAuthRequest();
            if (!request) {
                return {
                    success: false,
                    error: 'Failed to create auth request',
                };
            }
            
            const result = await request.promptAsync(microsoftDiscovery);
            
            if (result.type !== 'success' || !result.params.code) {
                return {
                    success: false,
                    error: result.type === 'cancel' ? 'Authorization cancelled' : 'Authorization failed',
                };
            }
            
            // Exchange code for tokens
            const tokenResult = await AuthSession.exchangeCodeAsync(
                {
                    clientId: MICROSOFT_CLIENT_ID,
                    code: result.params.code,
                    redirectUri: AuthSession.makeRedirectUri({
                        scheme: 'kaizapp',
                        path: 'oauth/microsoft',
                    }),
                    extraParams: {
                        code_verifier: request.codeVerifier!,
                    },
                },
                microsoftDiscovery
            );
            
            // Fetch user info first so we know the email
            const userInfo = await this.fetchMicrosoftUserInfo(tokenResult.accessToken);
            
            // Store tokens securely (keyed by email for multi-account support)
            await this.storeMicrosoftTokens(
                tokenResult.accessToken,
                tokenResult.refreshToken || '',
                tokenResult.expiresIn,
                userInfo?.email
            );
            
            // Fetch calendars
            const calendars = await this.fetchMicrosoftCalendars(tokenResult.accessToken);
            
            return {
                success: true,
                accountEmail: userInfo?.email,
                accountName: userInfo?.name,
                calendars,
            };
        } catch (error) {
            logger.error('Error connecting Microsoft Calendar:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
    
    /**
     * Store Microsoft tokens securely (multi-account support)
     */
    private async storeMicrosoftTokens(
        accessToken: string,
        refreshToken: string,
        expiresIn?: number,
        accountEmail?: string
    ): Promise<void> {
        if (!SecureStore) return;
        
        logger.log(`[calendarSyncService] storeMicrosoftTokens called with email:`, accountEmail);
        
        const accessKey = getSecureStoreKey(SECURE_STORE_KEYS.MICROSOFT_ACCESS_TOKEN, accountEmail);
        const refreshKey = getSecureStoreKey(SECURE_STORE_KEYS.MICROSOFT_REFRESH_TOKEN, accountEmail);
        const expiryKey = getSecureStoreKey(SECURE_STORE_KEYS.MICROSOFT_TOKEN_EXPIRY, accountEmail);
        
        await SecureStore.setItemAsync(accessKey, accessToken);
        if (refreshToken) {
            await SecureStore.setItemAsync(refreshKey, refreshToken);
        }
        if (expiresIn) {
            const expiryDate = new Date(Date.now() + expiresIn * 1000).toISOString();
            await SecureStore.setItemAsync(expiryKey, expiryDate);
        }
    }
    
    /**
     * Get stored Microsoft access token, refreshing if needed (multi-account support)
     */
    async getMicrosoftAccessToken(accountEmail?: string): Promise<string | null> {
        try {
            logger.log(`[calendarSyncService] getMicrosoftAccessToken called with email:`, accountEmail);
            await this.init();
            if (!SecureStore) {
                logger.log(`[calendarSyncService] SecureStore not available`);
                return null;
            }
            
            const accessKey = getSecureStoreKey(SECURE_STORE_KEYS.MICROSOFT_ACCESS_TOKEN, accountEmail);
            const expiryKey = getSecureStoreKey(SECURE_STORE_KEYS.MICROSOFT_TOKEN_EXPIRY, accountEmail);
            
            const accessToken = await SecureStore.getItemAsync(accessKey);
            const expiryStr = await SecureStore.getItemAsync(expiryKey);
            
            logger.log(`[calendarSyncService] Token found:`, accessToken ? 'yes (length=' + accessToken.length + ')' : 'no');
            logger.log(`[calendarSyncService] Expiry:`, expiryStr);
            
            if (!accessToken) {
                // Try without email suffix as fallback (for backwards compatibility)
                if (accountEmail) {
                    logger.log(`[calendarSyncService] Trying without email suffix as fallback`);
                    const fallbackKey = SECURE_STORE_KEYS.MICROSOFT_ACCESS_TOKEN;
                    const fallbackToken = await SecureStore.getItemAsync(fallbackKey);
                    if (fallbackToken) {
                        logger.log(`[calendarSyncService] Found token with fallback key`);
                        return fallbackToken;
                    }
                }
                return null;
            }
            
            // Check if token is expired
            if (expiryStr) {
                const expiry = new Date(expiryStr);
                if (expiry <= new Date()) {
                    // Token expired, try to refresh
                    return await this.refreshMicrosoftToken(accountEmail);
                }
            }
            
            return accessToken;
        } catch (error) {
            logger.error('Error getting Microsoft access token:', error);
            return null;
        }
    }
    
    /**
     * Refresh Microsoft access token (multi-account support)
     */
    private async refreshMicrosoftToken(accountEmail?: string): Promise<string | null> {
        try {
            if (!SecureStore || !AuthSession) return null;
            
            const refreshKey = getSecureStoreKey(SECURE_STORE_KEYS.MICROSOFT_REFRESH_TOKEN, accountEmail);
            const refreshToken = await SecureStore.getItemAsync(refreshKey);
            if (!refreshToken) return null;
            
            const result = await AuthSession.refreshAsync(
                {
                    clientId: MICROSOFT_CLIENT_ID,
                    refreshToken,
                },
                microsoftDiscovery
            );
            
            await this.storeMicrosoftTokens(
                result.accessToken,
                result.refreshToken || refreshToken,
                result.expiresIn,
                accountEmail
            );
            
            return result.accessToken;
        } catch (error) {
            logger.error('Error refreshing Microsoft token:', error);
            return null;
        }
    }
    
    /**
     * Fetch Microsoft user info
     */
    private async fetchMicrosoftUserInfo(
        accessToken: string
    ): Promise<{ email: string; name: string } | null> {
        try {
            const response = await fetch(`${MICROSOFT_GRAPH_API}/me`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            
            if (!response.ok) return null;
            
            const data = await response.json();
            return {
                email: data.mail || data.userPrincipalName,
                name: data.displayName,
            };
        } catch (error) {
            logger.error('Error fetching Microsoft user info:', error);
            return null;
        }
    }
    
    /**
     * Fetch Microsoft calendars (multi-account support)
     */
    async fetchMicrosoftCalendars(accessToken?: string, accountEmail?: string): Promise<ExternalCalendar[]> {
        try {
            const token = accessToken || (await this.getMicrosoftAccessToken(accountEmail));
            if (!token) return [];
            
            const response = await fetch(`${MICROSOFT_GRAPH_API}/me/calendars`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (!response.ok) {
                logger.error('[calendarSyncService] Microsoft Calendar API error:', response.status, await response.text());
                return [];
            }
            
            const data = await response.json();
            
            logger.log(`[calendarSyncService] Found ${data.value?.length || 0} Microsoft calendars`);
            
            return (data.value || []).map((cal: any) => ({
                id: cal.id,
                name: cal.name,
                color: cal.hexColor || '#0078D4',
                provider: 'microsoft' as CalendarProvider,
                isSelected: true, // Auto-select ALL calendars by default
                isPrimary: cal.isDefaultCalendar || false,
                accessLevel: cal.canEdit ? 'owner' : 'read',
            }));
        } catch (error) {
            logger.error('Error fetching Microsoft calendars:', error);
            return [];
        }
    }
    
    /**
     * Fetch events from Microsoft Calendar (multi-account support)
     */
    async fetchMicrosoftCalendarEvents(
        calendarIds: string[],
        startDate: Date,
        endDate: Date,
        accountEmail?: string
    ): Promise<ExternalEvent[]> {
        try {
            logger.log(`[calendarSyncService] fetchMicrosoftCalendarEvents called`);
            logger.log(`[calendarSyncService] calendarIds:`, calendarIds);
            logger.log(`[calendarSyncService] dateRange:`, startDate.toISOString(), 'to', endDate.toISOString());
            logger.log(`[calendarSyncService] accountEmail:`, accountEmail);
            
            const accessToken = await this.getMicrosoftAccessToken(accountEmail);
            logger.log(`[calendarSyncService] Got access token:`, accessToken ? 'yes' : 'no');
            if (!accessToken) return [];
            
            const allEvents: ExternalEvent[] = [];
            
            for (const calendarId of calendarIds) {
                const params = new URLSearchParams({
                    startDateTime: startDate.toISOString(),
                    endDateTime: endDate.toISOString(),
                    $select: 'id,subject,start,end,isAllDay,location,bodyPreview,recurrence',
                    $top: '250',
                });
                
                const response = await fetch(
                    `${MICROSOFT_GRAPH_API}/me/calendars/${calendarId}/calendarView?${params}`,
                    { 
                        headers: { 
                            Authorization: `Bearer ${accessToken}`,
                            // Request times in UTC for consistent handling across timezones
                            'Prefer': 'outlook.timezone="UTC"',
                        } 
                    }
                );
                
                if (!response.ok) {
                    logger.error('[calendarSyncService] Microsoft Calendar API error:', response.status, await response.text());
                    continue;
                }
                
                const data = await response.json();
                logger.log(`[calendarSyncService] Microsoft raw events for calendar ${calendarId}:`, JSON.stringify(data.value?.slice(0, 2)));
                
                const events = (data.value || []).map((event: any) => {
                    // Microsoft Graph returns dateTime without timezone, and timeZone separately
                    // We requested UTC timezone via Prefer header, so all times are in UTC
                    let startDate = event.start?.dateTime;
                    let endDate = event.end?.dateTime;
                    
                    // Remove fractional seconds (e.g., .0000000) first
                    if (startDate && startDate.includes('.')) {
                        startDate = startDate.split('.')[0];
                    }
                    if (endDate && endDate.includes('.')) {
                        endDate = endDate.split('.')[0];
                    }
                    
                    // Always append Z suffix since we requested UTC timezone from Microsoft Graph
                    // This ensures JavaScript Date parsing treats the time as UTC, not local time
                    if (startDate && !startDate.endsWith('Z')) {
                        startDate = startDate + 'Z';
                    }
                    if (endDate && !endDate.endsWith('Z')) {
                        endDate = endDate + 'Z';
                    }
                    
                    return {
                        id: `microsoft_${event.id}`,
                        calendarId,
                        provider: 'microsoft' as CalendarProvider,
                        title: event.subject || 'Untitled Event',
                        startDate,
                        endDate,
                        isAllDay: event.isAllDay || false,
                        location: event.location?.displayName,
                        notes: event.bodyPreview,
                        recurrence: event.recurrence ? JSON.stringify(event.recurrence) : undefined,
                        accountId: accountEmail,
                        accountEmail,
                    };
                });
                
                allEvents.push(...events);
            }
            
            logger.log(`[calendarSyncService] Total Microsoft events fetched:`, allEvents.length);
            logger.log(`[calendarSyncService] Microsoft events sample:`, JSON.stringify(allEvents.slice(0, 2)));
            
            return allEvents;
        } catch (error) {
            logger.error('Error fetching Microsoft Calendar events:', error);
            return [];
        }
    }
    
    /**
     * Disconnect Microsoft Calendar (multi-account support)
     */
    async disconnectMicrosoftCalendar(accountEmail?: string): Promise<void> {
        try {
            await this.init();
            if (!SecureStore) return;
            
            const accessKey = getSecureStoreKey(SECURE_STORE_KEYS.MICROSOFT_ACCESS_TOKEN, accountEmail);
            const refreshKey = getSecureStoreKey(SECURE_STORE_KEYS.MICROSOFT_REFRESH_TOKEN, accountEmail);
            const expiryKey = getSecureStoreKey(SECURE_STORE_KEYS.MICROSOFT_TOKEN_EXPIRY, accountEmail);
            
            const accessToken = await SecureStore.getItemAsync(accessKey);
            
            // Revoke token if exists
            if (accessToken && AuthSession) {
                try {
                    // Microsoft doesn't have a standard revocation endpoint like Google
                    // but we can try to sign out
                    logger.log('[calendarSyncService] Clearing Microsoft tokens for:', accountEmail || 'default');
                } catch (e) {
                    logger.warn('Failed to revoke Microsoft token:', e);
                }
            }
            
            // Clear stored tokens
            await SecureStore.deleteItemAsync(accessKey);
            await SecureStore.deleteItemAsync(refreshKey);
            await SecureStore.deleteItemAsync(expiryKey);
        } catch (error) {
            logger.error('Error disconnecting Microsoft Calendar:', error);
        }
    }
    
    // ========================================================================
    // Unified Sync Methods
    // ========================================================================
    
    /**
     * Connect to a calendar provider
     */
    async connectProvider(provider: CalendarProvider): Promise<{
        success: boolean;
        accountEmail?: string;
        accountName?: string;
        calendars?: ExternalCalendar[];
        error?: string;
    }> {
        switch (provider) {
            case 'apple':
                return this.connectAppleCalendar();
            case 'google':
                return this.connectGoogleCalendar();
            case 'microsoft':
                return this.connectMicrosoftCalendar();
            default:
                return { success: false, error: 'Unknown provider' };
        }
    }
    
    /**
     * Disconnect from a calendar provider (multi-account support)
     */
    async disconnectProvider(provider: CalendarProvider, accountEmail?: string): Promise<void> {
        switch (provider) {
            case 'apple':
                // Apple Calendar doesn't need disconnection, just clear from store
                break;
            case 'google':
                await this.disconnectGoogleCalendar(accountEmail);
                break;
            case 'microsoft':
                await this.disconnectMicrosoftCalendar(accountEmail);
                break;
        }
    }
    
    /**
     * Sync events from a provider (multi-account support)
     */
    async syncProviderEvents(
        provider: CalendarProvider,
        calendarIds: string[],
        syncRangeDays: number = 30,
        accountEmail?: string
    ): Promise<ExternalEvent[]> {
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + syncRangeDays);
        endDate.setHours(23, 59, 59, 999);
        
        switch (provider) {
            case 'apple':
                return this.fetchAppleCalendarEvents(calendarIds, startDate, endDate);
            case 'google':
                return this.fetchGoogleCalendarEvents(calendarIds, startDate, endDate, accountEmail);
            case 'microsoft':
                return this.fetchMicrosoftCalendarEvents(calendarIds, startDate, endDate, accountEmail);
            default:
                return [];
        }
    }
    
    /**
     * Sync all connected providers
     */
    async syncAllProviders(
        connections: Record<CalendarProvider, { status: string; calendars: ExternalCalendar[] }>,
        syncRangeDays: number = 30
    ): Promise<ExternalEvent[]> {
        const allEvents: ExternalEvent[] = [];
        const providers: CalendarProvider[] = ['apple', 'google', 'microsoft'];
        
        for (const provider of providers) {
            const connection = connections[provider];
            if (connection.status !== 'connected') continue;
            
            const selectedCalendarIds = connection.calendars
                .filter((cal) => cal.isSelected)
                .map((cal) => cal.id);
            
            if (selectedCalendarIds.length === 0) continue;
            
            const events = await this.syncProviderEvents(provider, selectedCalendarIds, syncRangeDays);
            allEvents.push(...events);
        }
        
        return allEvents;
    }
}

// Export singleton instance
export const calendarSyncService = CalendarSyncService.getInstance();
