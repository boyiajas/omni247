import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
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
import { typography, spacing } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

const EditReportScreen = ({ navigation, route }) => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = useThemedStyles((palette) => ({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        content: {
            padding: spacing.xl,
        },
        title: {
            fontSize: typography.sizes.xxl,
            fontWeight: typography.weights.bold,
            color: palette.textPrimary,
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
            backgroundColor: palette.neutralLight,
            borderRadius: 12,
            padding: spacing.md,
            marginBottom: spacing.lg,
        },
        locationLabel: {
            fontSize: typography.sizes.sm,
            color: palette.textSecondary,
            marginBottom: spacing.xs,
            fontFamily: typography.families.medium,
        },
        locationValue: {
            fontSize: typography.sizes.md,
            color: palette.textPrimary,
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
            backgroundColor: palette.white,
            borderRadius: 16,
            padding: spacing.lg,
        },
        modalTitle: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold,
            color: palette.textPrimary,
            marginBottom: spacing.md,
        },
        modalInput: {
            borderWidth: 1,
            borderColor: palette.border,
            borderRadius: 12,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            color: palette.textPrimary,
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
            backgroundColor: palette.neutralLight,
        },
        modalConfirm: {
            backgroundColor: palette.primary,
        },
        modalCancelText: {
            fontSize: typography.sizes.sm,
            color: palette.textSecondary,
        },
        modalConfirmText: {
            fontSize: typography.sizes.sm,
            color: palette.white,
            fontWeight: typography.weights.medium,
        },
    }));
    const paramReport = route.params?.report || null;
    const paramId = route.params?.reportId || paramReport?.id || '';
    const reportId = paramId ? paramId.toString().replace('api-', '') : '';

    const [title, setTitle] = useState(paramReport?.title || '');
    const [description, setDescription] = useState(paramReport?.description || '');
    const [location, setLocation] = useState({
        latitude: paramReport?.latitude ?? null,
        longitude: paramReport?.longitude ?? null,
        address: paramReport?.address || t('reportFlow.addLocationOptional'),
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
                address: response.data?.address || t('reportFlow.addLocationOptional'),
                provided: Boolean(response.data?.latitude && response.data?.longitude),
            });
        } catch (error) {
            Alert.alert(t('reportFlow.addressErrorTitle'), t('reportEdit.loadError'));
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert(t('reportFlow.addressMissingTitle'), t('reportEdit.missingFields'));
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
            Alert.alert(t('common.success'), t('reportEdit.updateSuccess'));
            navigation.goBack();
        } catch (error) {
            Alert.alert(t('reportFlow.addressErrorTitle'), t('reportEdit.updateFailed'));
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
        Alert.alert(t('reportEdit.locationTitle'), t('reportFlow.locationAddBody'), [
            { text: t('reportFlow.locationUseCurrent'), onPress: () => handleAddLocation() },
            {
                text: t('reportFlow.locationEnterAddress'),
                onPress: () => {
                    setAddressInput('');
                    setAddressModalVisible(true);
                },
            },
            { text: t('common.cancel'), style: 'cancel' },
        ]);
    };

    const handleAddLocation = async () => {
        try {
            if (isFetchingLocation) return;
            setIsFetchingLocation(true);

            const ok = await ensureLocationPermission();
            if (!ok) {
                setIsFetchingLocation(false);
                Alert.alert(t('reportFlow.locationPermissionTitle'), t('reportFlow.locationPermissionDenied'));
                return;
            }

            Geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    setLocation({
                        latitude: lat,
                        longitude: lng,
                        address: t('reportFlow.gettingLocation'),
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
                    Alert.alert(t('reportFlow.locationUnavailable'), t('reportFlow.locationEnableGps'));
                },
                {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 30000,
                }
            );
        } catch (error) {
            setIsFetchingLocation(false);
            Alert.alert(t('reportFlow.locationError'), t('reportFlow.locationErrorBody'));
        }
    };

    const handleAddressSubmit = async () => {
        if (!addressInput.trim()) {
            Alert.alert(t('reportFlow.addressMissingTitle'), t('reportFlow.addressMissingBody'));
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
                Alert.alert(t('reportFlow.addressNotFoundTitle'), t('reportFlow.addressNotFoundBody'));
            }
        } catch (error) {
            Alert.alert(t('reportFlow.addressErrorTitle'), t('reportFlow.addressErrorBody'));
        } finally {
            setIsGeocodingAddress(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>{t('reportEdit.title')}</Text>
                <TouchableOpacity style={styles.locationRow} onPress={handleLocationAction}>
                    <Text style={styles.locationLabel}>{t('reportDescription.locationLabel')}</Text>
                    <Text style={styles.locationValue}>
                        {isFetchingLocation ? t('reportFlow.gettingLocation') : (location?.address || t('reportFlow.addLocationOptional'))}
                    </Text>
                </TouchableOpacity>
                <Input
                    label={t('reportDescription.titleLabel')}
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t('reportDescription.titlePlaceholder')}
                    maxLength={100}
                />
                <Input
                    label={t('reportDescription.descriptionLabel')}
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t('reportDescription.descriptionPlaceholder')}
                    multiline
                    numberOfLines={6}
                />
                <View style={styles.actions}>
                    <Button
                        title={t('common.cancel')}
                        variant="outline"
                        onPress={() => navigation.goBack()}
                        style={styles.actionButton}
                    />
                    <Button
                        title={t('reportEdit.save')}
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
                        <Text style={styles.modalTitle}>{t('reportFlow.addressTitle')}</Text>
                        <TextInput
                            value={addressInput}
                            onChangeText={setAddressInput}
                            placeholder={t('reportFlow.addressPlaceholder')}
                            placeholderTextColor={colors.textSecondary}
                            style={styles.modalInput}
                            autoCapitalize="words"
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancel]}
                                onPress={() => setAddressModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalConfirm]}
                                onPress={handleAddressSubmit}
                                disabled={isGeocodingAddress}
                            >
                                <Text style={styles.modalConfirmText}>
                                    {isGeocodingAddress ? t('reportFlow.addressSearching') : t('reportFlow.addressUse')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};
export default EditReportScreen;
