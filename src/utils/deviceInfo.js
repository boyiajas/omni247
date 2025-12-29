import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export const getDeviceInfo = async () => {
    try {
        const [
            deviceId,
            brand,
            model,
            systemVersion,
            appVersion,
            deviceName,
        ] = await Promise.all([
            DeviceInfo.getUniqueId(),
            DeviceInfo.getBrand(),
            DeviceInfo.getModel(),
            DeviceInfo.getSystemVersion(),
            DeviceInfo.getVersion(),
            DeviceInfo.getDeviceName(),
        ]);

        // Note: IMEI can only be retrieved on Android with special permissions
        // For iOS, we'll use the device ID as a fallback
        let imei = null;
        if (Platform.OS === 'android') {
            try {
                // This requires READ_PHONE_STATE permission
                // imei = await DeviceInfo.getImei();
                // For now, we'll skip IMEI to avoid permission issues
                imei = null;
            } catch (error) {
                console.log('Could not retrieve IMEI:', error);
            }
        }

        return {
            device_uuid: deviceId,
            device_type: Platform.OS,
            device_name: deviceName || `${brand} ${model}`,
            device_model: `${brand} ${model}`,
            imei: imei,
            os_version: `${Platform.OS} ${systemVersion}`,
            app_version: appVersion,
        };
    } catch (error) {
        console.error('Error getting device info:', error);
        return {
            device_uuid: 'unknown',
            device_type: Platform.OS,
            device_name: 'Unknown Device',
            device_model: 'Unknown',
            imei: null,
            os_version: Platform.OS,
            app_version: '1.0.0',
        };
    }
};
