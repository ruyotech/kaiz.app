/**
 * biometricStore.ts - Face ID / Biometric Authentication Store
 * 
 * Manages biometric authentication state and preferences:
 * - Checks if device supports biometrics (Face ID, Touch ID, Fingerprint)
 * - Checks if biometrics are enrolled on the device
 * - Persists user preference for enabling/disabling biometric login
 * - Stores the last authenticated user email for biometric login
 * 
 * Flow:
 * 1. User enables Face ID in Settings -> we verify biometrics are available
 * 2. User authenticates with Face ID to confirm they want to enable it
 * 3. We save their email so we know who to log in on biometric success
 * 4. On login screen, if Face ID is enabled, show the Face ID button
 * 5. User taps Face ID button -> authenticate -> auto-login
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform, Alert, Linking } from 'react-native';

// ============================================================================
// Types
// ============================================================================

/**
 * Biometric authentication types supported by the device
 */
export type BiometricType = 'face-id' | 'touch-id' | 'fingerprint' | 'iris' | 'none';

/**
 * Result of checking biometric hardware and enrollment
 */
export interface BiometricCapability {
    /** Whether the device has biometric hardware */
    isHardwareAvailable: boolean;
    /** Whether biometrics are enrolled (Face ID set up, etc.) */
    isEnrolled: boolean;
    /** The type of biometric available */
    type: BiometricType;
    /** Human-readable name for UI display */
    displayName: string;
    /** Icon name for display */
    iconName: string;
}

/**
 * Biometric store state
 */
interface BiometricState {
    /** Whether biometric login is enabled by the user */
    isBiometricEnabled: boolean;
    
    /** Email of the user who enabled biometric login */
    enrolledEmail: string | null;
    
    /** Cached biometric capability info (refreshed on check) */
    capability: BiometricCapability | null;
    
    /** Whether we're currently checking biometric status */
    isChecking: boolean;
    
    /** Last error message */
    error: string | null;
    
    // Actions
    
    /** Check device biometric capabilities */
    checkBiometricCapability: () => Promise<BiometricCapability>;
    
    /** Enable biometric login (requires authentication to confirm) */
    enableBiometric: (email: string) => Promise<boolean>;
    
    /** Disable biometric login */
    disableBiometric: () => void;
    
    /** Authenticate using biometrics */
    authenticateWithBiometric: () => Promise<boolean>;
    
    /** Clear all biometric data (for logout) */
    clearBiometricData: () => void;
    
    /** Reset store to initial state */
    reset: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the type of biometric available on the device
 */
async function getBiometricType(): Promise<BiometricType> {
    try {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            return Platform.OS === 'ios' ? 'face-id' : 'face-id';
        }
        if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            return Platform.OS === 'ios' ? 'touch-id' : 'fingerprint';
        }
        if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            return 'iris';
        }
        
        return 'none';
    } catch (error) {
        console.error('❌ Error getting biometric type:', error);
        return 'none';
    }
}

/**
 * Get display name for biometric type
 */
function getBiometricDisplayName(type: BiometricType): string {
    switch (type) {
        case 'face-id':
            return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
        case 'touch-id':
            return 'Touch ID';
        case 'fingerprint':
            return 'Fingerprint';
        case 'iris':
            return 'Iris Scanner';
        default:
            return 'Biometric';
    }
}

/**
 * Get icon name for biometric type (MaterialCommunityIcons)
 */
function getBiometricIconName(type: BiometricType): string {
    switch (type) {
        case 'face-id':
            return 'face-recognition';
        case 'touch-id':
        case 'fingerprint':
            return 'fingerprint';
        case 'iris':
            return 'eye-outline';
        default:
            return 'shield-lock-outline';
    }
}

/**
 * Show alert to guide user to Settings when biometrics aren't enrolled
 */
function showEnrollmentAlert(type: BiometricType): void {
    const displayName = getBiometricDisplayName(type);
    
    Alert.alert(
        `${displayName} Not Set Up`,
        `Please set up ${displayName} in your device Settings to use this feature.`,
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Open Settings',
                onPress: () => {
                    // Open device settings
                    if (Platform.OS === 'ios') {
                        Linking.openURL('App-Prefs:FACEID_PASSCODE');
                    } else {
                        Linking.openSettings();
                    }
                },
            },
        ]
    );
}

// ============================================================================
// Store
// ============================================================================

export const useBiometricStore = create<BiometricState>()(
    persist(
        (set, get) => ({
            // Initial state
            isBiometricEnabled: false,
            enrolledEmail: null,
            capability: null,
            isChecking: false,
            error: null,

            /**
             * Check device biometric capabilities
             * Call this to see if Face ID/Touch ID is available
             */
            checkBiometricCapability: async () => {
                set({ isChecking: true, error: null });
                
                try {
                    console.log('🔐 Checking biometric capability...');
                    
                    // Check if hardware is available
                    const isHardwareAvailable = await LocalAuthentication.hasHardwareAsync();
                    console.log(`   Hardware available: ${isHardwareAvailable}`);
                    
                    // Check if biometrics are enrolled
                    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
                    console.log(`   Enrolled: ${isEnrolled}`);
                    
                    // Get the type of biometric
                    const type = await getBiometricType();
                    console.log(`   Type: ${type}`);
                    
                    const capability: BiometricCapability = {
                        isHardwareAvailable,
                        isEnrolled,
                        type,
                        displayName: getBiometricDisplayName(type),
                        iconName: getBiometricIconName(type),
                    };
                    
                    set({ capability, isChecking: false });
                    console.log('✅ Biometric capability check complete');
                    
                    return capability;
                } catch (error) {
                    console.error('❌ Error checking biometric capability:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    set({ isChecking: false, error: errorMessage });
                    
                    // Return default capability on error
                    const defaultCapability: BiometricCapability = {
                        isHardwareAvailable: false,
                        isEnrolled: false,
                        type: 'none',
                        displayName: 'Biometric',
                        iconName: 'shield-lock-outline',
                    };
                    
                    return defaultCapability;
                }
            },

            /**
             * Enable biometric login
             * Requires successful authentication to confirm the user wants to enable it
             * 
             * @param email - The email of the user enabling biometric login
             * @returns true if successfully enabled, false otherwise
             */
            enableBiometric: async (email: string) => {
                set({ isChecking: true, error: null });
                
                try {
                    console.log('🔐 Enabling biometric login...');
                    
                    // First, check capability
                    const capability = await get().checkBiometricCapability();
                    
                    // Check if hardware is available
                    if (!capability.isHardwareAvailable) {
                        Alert.alert(
                            'Not Available',
                            `${capability.displayName} is not available on this device.`,
                            [{ text: 'OK' }]
                        );
                        set({ isChecking: false });
                        return false;
                    }
                    
                    // Check if biometrics are enrolled
                    if (!capability.isEnrolled) {
                        showEnrollmentAlert(capability.type);
                        set({ isChecking: false });
                        return false;
                    }
                    
                    // Authenticate to confirm user wants to enable
                    console.log('🔐 Requesting authentication to enable biometric login...');
                    
                    const result = await LocalAuthentication.authenticateAsync({
                        promptMessage: `Enable ${capability.displayName} login`,
                        fallbackLabel: 'Use Passcode',
                        disableDeviceFallback: false,
                        cancelLabel: 'Cancel',
                    });
                    
                    if (result.success) {
                        console.log('✅ Biometric login enabled successfully');
                        set({
                            isBiometricEnabled: true,
                            enrolledEmail: email,
                            isChecking: false,
                        });
                        return true;
                    } else {
                        console.log('❌ Biometric authentication cancelled or failed:', result.error);
                        
                        // Handle specific errors
                        if (result.error === 'user_cancel') {
                            // User cancelled, no need to show alert
                        } else if (result.error === 'lockout') {
                            Alert.alert(
                                'Locked Out',
                                'Too many failed attempts. Please try again later or use your passcode.',
                                [{ text: 'OK' }]
                            );
                        } else if (result.error === 'not_enrolled') {
                            showEnrollmentAlert(capability.type);
                        }
                        
                        set({ isChecking: false });
                        return false;
                    }
                } catch (error) {
                    console.error('❌ Error enabling biometric:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    set({ isChecking: false, error: errorMessage });
                    
                    Alert.alert(
                        'Error',
                        'Failed to enable biometric login. Please try again.',
                        [{ text: 'OK' }]
                    );
                    
                    return false;
                }
            },

            /**
             * Disable biometric login
             */
            disableBiometric: () => {
                console.log('🔐 Disabling biometric login');
                set({
                    isBiometricEnabled: false,
                    enrolledEmail: null,
                });
            },

            /**
             * Authenticate using biometrics
             * Used on the login screen to authenticate the user
             * 
             * @returns true if authentication succeeded, false otherwise
             */
            authenticateWithBiometric: async () => {
                const { isBiometricEnabled, capability, enrolledEmail } = get();
                
                set({ isChecking: true, error: null });
                
                try {
                    console.log('🔐 Authenticating with biometric...');
                    
                    // Check if biometric is enabled
                    if (!isBiometricEnabled || !enrolledEmail) {
                        console.log('❌ Biometric login not enabled');
                        set({ isChecking: false });
                        return false;
                    }
                    
                    // Refresh capability if not cached
                    const currentCapability = capability || await get().checkBiometricCapability();
                    
                    // Check if still available
                    if (!currentCapability.isHardwareAvailable || !currentCapability.isEnrolled) {
                        console.log('❌ Biometric no longer available');
                        // Disable biometric since it's no longer available
                        get().disableBiometric();
                        set({ isChecking: false });
                        return false;
                    }
                    
                    // Perform authentication
                    const result = await LocalAuthentication.authenticateAsync({
                        promptMessage: `Login to Kaiz LifeOS`,
                        fallbackLabel: 'Use Password',
                        disableDeviceFallback: false,
                        cancelLabel: 'Cancel',
                    });
                    
                    set({ isChecking: false });
                    
                    if (result.success) {
                        console.log('✅ Biometric authentication successful');
                        return true;
                    } else {
                        console.log('❌ Biometric authentication failed:', result.error);
                        
                        // Handle specific errors
                        if (result.error === 'lockout') {
                            Alert.alert(
                                'Locked Out',
                                'Too many failed attempts. Please try again later or use your password.',
                                [{ text: 'OK' }]
                            );
                        }
                        
                        return false;
                    }
                } catch (error) {
                    console.error('❌ Error during biometric authentication:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    set({ isChecking: false, error: errorMessage });
                    return false;
                }
            },

            /**
             * Clear biometric data (call on logout)
             */
            clearBiometricData: () => {
                console.log('🔐 Clearing biometric data');
                set({
                    isBiometricEnabled: false,
                    enrolledEmail: null,
                    capability: null,
                });
            },

            /**
             * Reset store to initial state
             */
            reset: () => {
                set({
                    isBiometricEnabled: false,
                    enrolledEmail: null,
                    capability: null,
                    isChecking: false,
                    error: null,
                });
            },
        }),
        {
            name: 'biometric-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // Only persist these fields
            partialize: (state) => ({
                isBiometricEnabled: state.isBiometricEnabled,
                enrolledEmail: state.enrolledEmail,
            }),
        }
    )
);

export default useBiometricStore;
