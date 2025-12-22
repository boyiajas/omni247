import { useState, useEffect } from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';

export const useBiometrics = () => {
    const [isAvailable, setIsAvailable] = useState(false);
    const [biometryType, setBiometryType] = useState(null);

    useEffect(() => {
        checkBiometricsAvailability();
    }, []);

    const checkBiometricsAvailability = async () => {
        try {
            const rnBiometrics = new ReactNativeBiometrics();
            const { available, biometryType: type } = await rnBiometrics.isSensorAvailable();

            setIsAvailable(available);
            setBiometryType(type);
        } catch (error) {
            console.error('Error checking biometrics:', error);
        }
    };

    const authenticate = async (promptMessage = 'Authenticate') => {
        try {
            const rnBiometrics = new ReactNativeBiometrics();
            const { success } = await rnBiometrics.simplePrompt({ promptMessage });

            return success;
        } catch (error) {
            console.error('Biometric authentication error:', error);
            return false;
        }
    };

    return {
        isAvailable,
        biometryType,
        authenticate,
    };
};
