/**
 * Device Information Utility
 * 
 * Collects non-sensitive device info for:
 * - Security: Detecting suspicious logins from new devices
 * - Analytics: Understanding user base
 * - Session management: Tracking active sessions per device
 * - Multi-platform support: Web, iOS, Android, Windows, Mac
 * 
 * PRIVACY COMPLIANCE (App Store & Play Store):
 * - NO advertising identifiers (IDFA/GAID) without consent
 * - NO hardware serial numbers
 * - NO SIM/IMEI data
 * - Only collects: device model, OS version, app version
 * - User can see their devices in account settings
 */

import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Client types for multi-platform support
export type ClientType = 'mobile-ios' | 'mobile-android' | 'web' | 'desktop-windows' | 'desktop-mac' | 'desktop-linux' | 'unknown';

export interface DeviceInfo {
    // Client identification
    clientType: ClientType;          // "mobile-ios", "web", "desktop-mac", etc.
    clientVersion: string | null;    // App/client version
    
    // Device identification (non-unique, privacy-safe)
    deviceName: string;              // e.g., "iPhone 15 Pro", "Chrome on Windows"
    deviceType: string;              // "phone", "tablet", "desktop", "unknown"
    brand: string | null;            // e.g., "Apple", "Google", "Samsung"
    modelName: string | null;        // e.g., "iPhone15,2", "Pixel 8"
    
    // Operating system
    osName: string;                  // "iOS", "Android", "Windows", "macOS", "Linux"
    osVersion: string | null;        // e.g., "17.0", "14", "11", "14.0"
    
    // App info
    appVersion: string | null;       // e.g., "1.0.0"
    buildNumber: string | null;      // e.g., "1", "42"
    
    // Runtime info
    isDevice: boolean;               // true if real device, false if simulator/emulator
    platform: string;                // "ios", "android", "web", "windows", "macos"
    
    // Session metadata
    userAgent?: string;              // For web clients
    screenResolution?: string;       // e.g., "1920x1080"
    timezone: string;                // e.g., "America/New_York"
    language: string;                // e.g., "en-US"
}

/**
 * Converts DeviceType enum to readable string
 */
function getDeviceTypeString(deviceType: Device.DeviceType | null): string {
    switch (deviceType) {
        case Device.DeviceType.PHONE:
            return 'phone';
        case Device.DeviceType.TABLET:
            return 'tablet';
        case Device.DeviceType.DESKTOP:
            return 'desktop';
        case Device.DeviceType.TV:
            return 'tv';
        default:
            return 'unknown';
    }
}

/**
 * Determine client type based on platform
 */
function getClientType(): ClientType {
    if (Platform.OS === 'ios') {
        return 'mobile-ios';
    } else if (Platform.OS === 'android') {
        return 'mobile-android';
    } else if (Platform.OS === 'web') {
        return 'web';
    } else if (Platform.OS === 'windows') {
        return 'desktop-windows';
    } else if (Platform.OS === 'macos') {
        return 'desktop-mac';
    }
    return 'unknown';
}

/**
 * Get device information
 * All data collected is non-sensitive and privacy-compliant
 * Works across mobile, web, and desktop platforms
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
    const deviceType = await Device.getDeviceTypeAsync();
    const clientType = getClientType();
    
    // Get timezone and language
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const language = Platform.OS === 'web' 
        ? (typeof navigator !== 'undefined' ? navigator.language : 'en')
        : (Device.osName === 'iOS' ? 'en' : 'en'); // expo-localization would be better here
    
    return {
        // Client info
        clientType,
        clientVersion: Application.nativeApplicationVersion || Constants.expoConfig?.version || null,
        
        // Device details
        deviceName: Device.deviceName || `${Device.brand || Platform.OS} Device`,
        deviceType: getDeviceTypeString(deviceType),
        brand: Device.brand,
        modelName: Device.modelName,
        
        // OS details
        osName: Device.osName || Platform.OS,
        osVersion: Device.osVersion,
        
        // App details
        appVersion: Application.nativeApplicationVersion,
        buildNumber: Application.nativeBuildVersion,
        
        // Runtime
        isDevice: Device.isDevice,
        platform: Platform.OS,
        
        // Session metadata
        timezone,
        language,
    };
}

/**
 * Get a human-readable device description for display
 * e.g., "iPhone 15 Pro (iOS 17.0)" or "Chrome on Windows 11"
 */
export function getDeviceDescription(info: DeviceInfo): string {
    const name = info.deviceName || info.modelName || 'Unknown Device';
    const os = info.osVersion ? `${info.osName} ${info.osVersion}` : info.osName;
    return `${name} (${os})`;
}

/**
 * Get a short device label for UI
 * e.g., "📱 iPhone" or "💻 Windows"
 */
export function getDeviceLabel(info: DeviceInfo): string {
    const icons: Record<ClientType, string> = {
        'mobile-ios': '📱',
        'mobile-android': '📱',
        'web': '🌐',
        'desktop-windows': '💻',
        'desktop-mac': '🖥️',
        'desktop-linux': '🐧',
        'unknown': '❓',
    };
    const icon = icons[info.clientType];
    const name = info.deviceName || info.brand || info.platform;
    return `${icon} ${name}`;
}

/**
 * Get device info as a JSON string for API requests
 * This is what gets sent to the backend
 */
export async function getDeviceInfoString(): Promise<string> {
    const info = await getDeviceInfo();
    return JSON.stringify({
        // Essential for session management
        clientType: info.clientType,
        clientVersion: info.clientVersion,
        
        // Device identification
        name: info.deviceName,
        type: info.deviceType,
        brand: info.brand,
        model: info.modelName,
        
        // OS info
        os: info.osName,
        osVersion: info.osVersion,
        
        // App info
        appVersion: info.appVersion,
        platform: info.platform,
        
        // Session context
        timezone: info.timezone,
        language: info.language,
    });
}

/**
 * Get a unique-ish identifier for this device installation
 * NOT a persistent device ID - changes on app reinstall
 * Used for session management, not tracking
 */
export async function getInstallationId(): Promise<string | null> {
    // This is the installation ID, not a device ID
    // It changes when the app is reinstalled
    // Safe for tracking sessions without tracking users across apps
    return Constants.installationId || null;
}

/**
 * Check if this is a new device for the user
 * Useful for security notifications
 */
export function isNewDevice(knownDevices: string[], currentDeviceInfo: string): boolean {
    // Parse current device
    try {
        const current = JSON.parse(currentDeviceInfo);
        const currentKey = `${current.clientType}-${current.brand}-${current.model}-${current.os}`;
        
        return !knownDevices.some(known => {
            try {
                const device = JSON.parse(known);
                const key = `${device.clientType}-${device.brand}-${device.model}-${device.os}`;
                return key === currentKey;
            } catch {
                return false;
            }
        });
    } catch {
        return true; // Assume new if can't parse
    }
}
