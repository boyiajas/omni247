import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
    TouchableOpacity,
    PermissionsAndroid,
    Modal,
    TextInput,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { reportsAPI } from '../../services/api/reports';
import Geolocation from 'react-native-geolocation-service';
import GeocodingService from '../../services/location/GeocodingService';
import { colors, typography, spacing } from '../../theme';

const EditReportScreen = ({ navigation, route }) => {
    const paramReport = route.params?.report || null;
    const paramId = route.params?.reportId || paramReport?.id || '';
    const reportId = paramId ? paramId.toString().replace('api-', '') : '';

    const [title, setTitle] = useState(paramReport?.title || '');
    const [description, setDescription] = useState(paramReport?.description || '');
    const [location, setLocation] = useState({
        latitude: paramReport?.latitude ?? null,
        longitude: paramReport?.longitude ?? null,
        address: paramReport?.address || 'Tap to add location (optional)',
        provided: Boolean(paramReport?.latitude && paramReport?.longitude),
    });
    const [loading, setLoading] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [addressInput, setAddressInput] = useState('');
    const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    useEffect(() => {
        if (!paramReport && reportId) {
            loadReport();
        }
    }, [reportId, paramReport]);

    const loadReport = async () => {
        try {
            const response = await reportsAPI.getReportDetail(reportId);
            setTitle(response.data?.title || '');
            setDescription(response.data?.description || '');
            setLocation({
                latitude: response.data?.latitude ?? null,
                longitude: response.data?.longitude ?? null,
                address: response.data?.address || 'Tap to add location (optional)',
                provided: Boolean(response.data?.latitude && response.data?.longitude),
            });
        } catch (error) {
            Alert.alert('Error', 'Unable to load report details.');
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert('Missing info', 'Title and description are required.');
            return;
        }

        try {
            setLoading(true);
            const response = await reportsAPI.updateReport(reportId, {
                title: title.trim(),
                description: description.trim(),
                latitude: location?.latitude ?? null,
                longitude: location?.longitude ?? null,
                address: location?.address ?? null,
            });
            const updatedReport = response?.data || null;
            if (route.params?.onUpdated) {
                route.params.onUpdated(updatedReport);
            }
            Alert.alert('Success', 'Report updated successfully.');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to update report.');
        } finally {
            setLoading(false);
        }
    };

    async function ensureLocationPermission() {
        if (Platform.OS !== 'android') return true;

        const fine = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
        const coarse = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;

        const fineGranted = await PermissionsAndroid.check(fine);
        const coarseGranted = await PermissionsAndroid.check(coarse);
        if (fineGranted || coarseGranted) return true;

        const result = await PermissionsAndroid.requestMultiple([fine, coarse]);
        const fineResult = result[fine];
        const coarseResult = result[coarse];

        return (
            fineResult === PermissionsAndroid.RESULTS.GRANTED
            || coarseResult === PermissionsAndroid.RESULTS.GRANTED
        );
    }

    const handleLocationAction = () => {
        Alert.alert('Update Location', 'Choose how you want to set the location.', [
            { text: 'Use current location', onPress: () => handleAddLocation() },
            {
                text: 'Enter address',
                onPress: () => {
                    setAddressInput('');
                    setAddressModalVisible(true);
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleAddLocation = async () => {
        try {
            if (isFetchingLocation) return;
            setIsFetchingLocation(true);

            const ok = await ensureLocationPermission();
            if (!ok) {
                setIsFetchingLocation(false);
                Alert.alert('Location permission', 'Location permission was denied.');
                return;
            }

            Geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    setLocation({
                        latitude: lat,
                        longitude: lng,
                        address: 'Fetching address...',
                        provided: true,
                    });

                    const data = await GeocodingService.reverseGeocode(lat, lng);
                    const formatted = data?.formattedAddress || GeocodingService.formatAddress(data || {});
                    setLocation((prev) => ({
                        ...prev,
                        address: formatted || prev.address,
                        provided: true,
                    }));
                    setIsFetchingLocation(false);
                },
                () => {
                    setIsFetchingLocation(false);
                    Alert.alert('Location unavailable', 'Enable GPS/location or enter an address.');
                },
                {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 30000,
                }
            );
        } catch (error) {
            setIsFetchingLocation(false);
            Alert.alert('Location error', 'Could not fetch location.');
        }
    };

    const handleAddressSubmit = async () => {
        if (!addressInput.trim()) {
            Alert.alert('Missing address', 'Please enter an address.');
            return;
        }

        try {
            setIsGeocodingAddress(true);
            const data = await GeocodingService.geocode(addressInput.trim());
            if (data?.latitude && data?.longitude) {
                const formatted = data?.formattedAddress || GeocodingService.formatAddress(data || {});
                setLocation({
                    latitude: data.latitude,
                    longitude: data.longitude,
                    address: formatted || addressInput.trim(),
                    provided: true,
                });
                setAddressModalVisible(false);
            } else {
                Alert.alert('Not found', 'We could not find that address. Try another one.');
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to find that address right now.');
        } finally {
            setIsGeocodingAddress(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Edit Report</Text>
                <TouchableOpacity style={styles.locationRow} onPress={handleLocationAction}>
                    <Text style={styles.locationLabel}>Location</Text>
                    <Text style={styles.locationValue}>
                        {isFetchingLocation ? 'Getting location…' : (location?.address || 'Tap to add location')}
                    </Text>
                </TouchableOpacity>
                <Input
                    label="Title"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Brief title for the incident"
                    maxLength={100}
                />
                <Input
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Provide details about what happened..."
                    multiline
                    numberOfLines={6}
                />
                <View style={styles.actions}>
                    <Button
                        title="Cancel"
                        variant="outline"
                        onPress={() => navigation.goBack()}
                        style={styles.actionButton}
                    />
                    <Button
                        title="Save changes"
                        onPress={handleSave}
                        loading={loading}
                        disabled={loading}
                        style={styles.actionButton}
                    />
                </View>
            </ScrollView>

            <Modal
                transparent
                animationType="fade"
                visible={addressModalVisible}
                onRequestClose={() => setAddressModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.modalCard}
                    >
                        <Text style={styles.modalTitle}>Enter address</Text>
                        <TextInput
                            value={addressInput}
                            onChangeText={setAddressInput}
                            placeholder="Street, city, country"
                            placeholderTextColor={colors.textSecondary}
                            style={styles.modalInput}
                            autoCapitalize="words"
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancel]}
                                onPress={() => setAddressModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalConfirm]}
                                onPress={handleAddressSubmit}
                                disabled={isGeocodingAddress}
                            >
                                <Text style={styles.modalConfirmText}>
                                    {isGeocodingAddress ? 'Searching...' : 'Use address'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    content: {
        padding: spacing.xl,
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xl,
        fontFamily: typography.families.bold,
    },
    actions: {
        flexDirection: 'row',
        marginTop: spacing.lg,
    },
    actionButton: {
        flex: 1,
        marginRight: spacing.md,
    },
    locationRow: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    locationLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        fontFamily: typography.families.medium,
    },
    locationValue: {
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        fontFamily: typography.families.regular,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalCard: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: spacing.lg,
    },
    modalTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        color: colors.textPrimary,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: spacing.md,
    },
    modalButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 16,
        marginLeft: spacing.sm,
    },
    modalCancel: {
        backgroundColor: colors.background,
    },
    modalConfirm: {
        backgroundColor: colors.primary,
    },
    modalCancelText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    modalConfirmText: {
        fontSize: typography.sizes.sm,
        color: colors.white,
        fontWeight: typography.weights.medium,
    },
});

export default EditReportScreen;
