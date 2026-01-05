import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useLocation } from '../../hooks/useLocation';
import { typography, spacing } from '../../theme';
import Geolocation from 'react-native-geolocation-service';
import GeocodingService from '../../services/location/GeocodingService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

const ReportDescriptionScreen = ({ navigation, route }) => {
    const { category, media, location: routeLocation } = route.params || {};
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = useThemedStyles((palette) => ({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        content: {
            flex: 1,
            padding: spacing.xl,
        },
        title: {
            fontSize: typography.sizes.xxl,
            fontWeight: typography.weights.bold,
            color: palette.textPrimary,
            marginBottom: spacing.xl,
            fontFamily: typography.families.bold,
        },
        label: {
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.medium,
            color: palette.textPrimary,
            marginBottom: spacing.md,
            fontFamily: typography.families.medium,
        },
        privacyOptions: {
            flexDirection: 'row',
            marginBottom: spacing.xl,
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
        privacyButton: {
            flex: 1,
            marginRight: spacing.md,
        },
        continueButton: {
            marginTop: 'auto',
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
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState('public');
    const { location: contextLocation } = useLocation();
    const [location, setLocation] = useState(
        routeLocation || contextLocation || {
            latitude: null,
            longitude: null,
            address: t('reportFlow.addLocationOptional'),
        }
    );
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [addressInput, setAddressInput] = useState('');
    const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const handleLocationAction = () => {
        Alert.alert(t('reportFlow.locationAddTitle'), t('reportFlow.locationAddBody'), [
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

            Geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    setLocation({
                        latitude: lat,
                        longitude: lng,
                        address: t('reportFlow.gettingLocation'),
                    });

                    const data = await GeocodingService.reverseGeocode(lat, lng);
                    const formatted = data?.formattedAddress || GeocodingService.formatAddress(data || {});
                    setLocation((prev) => ({
                        ...prev,
                        address: formatted || prev.address,
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

    const handleNext = () => {
        navigation.navigate('ReportPreview', {
            category,
            media,
            title,
            description,
            privacy,
            location,
        });
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}>
                <View style={styles.content}>
                <Text style={styles.title}>{t('reportDescription.title')}</Text>

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

                <Text style={styles.label}>{t('reportDescription.privacyLabel')}</Text>
                <View style={styles.privacyOptions}>
                    <Button
                        title={t('reportDescription.public')}
                        variant={privacy === 'public' ? 'primary' : 'outline'}
                        onPress={() => setPrivacy('public')}
                        style={styles.privacyButton}
                    />
                    <Button
                        title={t('reportDescription.anonymous')}
                        variant={privacy === 'anonymous' ? 'primary' : 'outline'}
                        onPress={() => setPrivacy('anonymous')}
                        style={styles.privacyButton}
                    />
                </View>

                <Button
                    title={t('common.continue')}
                    onPress={handleNext}
                    disabled={!title || !description}
                    style={styles.continueButton}
                />
            </View>

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
        </SafeAreaView>
    );
};
export default ReportDescriptionScreen;
