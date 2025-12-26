import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Platform,
  Alert,
  PermissionsAndroid,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { colors, typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import GeocodingService from '../../services/location/GeocodingService';

export default function ReportMediaScreen({ route, navigation }) {
  const { category } = route.params || {};

  const [media, setMedia] = useState([]);
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    address: 'Tap to add location (optional)',
    provided: false,
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  useEffect(() => {
    requestMediaPermissions();
  }, []);

  const requestMediaPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
      } catch (err) {
        console.warn('Permission error:', err);
      }
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
    Alert.alert(
      'Add Location',
      'Choose how you want to add the location.',
      [
        {
          text: 'Use current location',
          onPress: () => handleAddLocation(),
        },
        {
          text: 'Enter address',
          onPress: () => {
            setAddressInput('');
            setAddressModalVisible(true);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAddLocation = async () => {
    try {
      if (isFetchingLocation) return;

      setIsFetchingLocation(true);

      const ok = await ensureLocationPermission();
      if (!ok) {
        setIsFetchingLocation(false);
        Alert.alert(
          'Location permission',
          'Location permission was denied. You can continue without adding location.'
        );
        return;
      }

      if (!Geolocation || typeof Geolocation.getCurrentPosition !== 'function') {
        setIsFetchingLocation(false);
        Alert.alert('Location unavailable', 'Location is not available right now.');
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

          await reverseGeocode(lat, lng);
          setIsFetchingLocation(false);
        },
        (error) => {
          console.log('Location error:', error);
          setIsFetchingLocation(false);
          Alert.alert('Location unavailable', 'Enable GPS/location or continue without it.');
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    } catch (e) {
      console.warn('handleAddLocation error:', e);
      setIsFetchingLocation(false);
      Alert.alert('Location error', 'Could not fetch location. Continue without it.');
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const data = await GeocodingService.reverseGeocode(lat, lng);
      const formatted = data?.formattedAddress || GeocodingService.formatAddress(data || {});
      if (formatted) {
        setLocation(prev => ({ ...prev, address: formatted, provided: true }));
      } else {
        setLocation(prev => ({ ...prev, address: 'Location added', provided: true }));
      }
    } catch (error) {
      console.log('Geocoding error:', error);
      setLocation(prev => ({ ...prev, address: 'Location added', provided: true }));
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

  const handleTakePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        saveToPhotos: true,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.error) return Alert.alert('Error', 'Failed to take photo');

        const asset = response.assets?.[0];
        if (!asset?.uri) return;

        const newMedia = {
          uri: asset.uri,
          kind: 'photo',
          mimeType: asset.type,      // ✅ e.g. image/jpeg
          fileName: asset.fileName,
          fileSize: asset.fileSize,
        };

        setMedia(prev => [...prev, newMedia]);
      }
    );
  };

  const handleTakeVideo = () => {
    launchCamera(
      {
        mediaType: 'video',
        quality: 0.7,
        videoQuality: 'high',
        durationLimit: 60,
        saveToPhotos: true,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.error) return Alert.alert('Error', 'Failed to record video');

        const asset = response.assets?.[0];
        if (!asset?.uri) return;

        const newMedia = {
          uri: asset.uri,
          kind: 'video',
          mimeType: asset.type,      // ✅ e.g. video/mp4
          fileName: asset.fileName,
          fileSize: asset.fileSize,
          duration: asset.duration,
        };

        setMedia(prev => [...prev, newMedia]);
      }
    );
  };

  const handleRecordAudio = () => {
    setIsRecording(true);
    Alert.alert('Info', 'Audio recording feature coming soon');
    setTimeout(() => setIsRecording(false), 1000);
  };

  const handleSelectFromGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'mixed',
        quality: 0.8,
        selectionLimit: 10,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.error) return Alert.alert('Error', 'Failed to select media');

        const assets = response.assets || [];
        if (!assets.length) return;

        const newMedia = assets
          .filter(a => a?.uri)
          .map(asset => {
            const isVideo = asset.type?.startsWith('video/');
            const isAudio = asset.type?.startsWith('audio/');
            return {
              uri: asset.uri,
              kind: isAudio ? 'audio' : (isVideo ? 'video' : 'photo'),
              mimeType: asset.type,     // ✅ important
              fileName: asset.fileName,
              fileSize: asset.fileSize,
              duration: asset.duration,
            };
          });

        setMedia(prev => [...prev, ...newMedia]);
      }
    );
  };

  const removeMedia = (index) => {
    setMedia(prev => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleContinue = () => {
    if (media.length === 0) {
      Alert.alert('No Media', 'Submit without media?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => navigation.navigate('ReportDescription', { category, media, location }),
        },
      ]);
      return;
    }

    navigation.navigate('ReportDescription', { category, media, location });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.neutralDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Media</Text>
        <View style={{ width: 24 }} />
      </View>

      <TouchableOpacity style={styles.locationContainer} onPress={handleLocationAction} activeOpacity={0.8}>
        <Icon name="map-marker" size={16} color={colors.primary} />
        <Text style={styles.locationText}>
          {isFetchingLocation ? 'Getting location…' : (location?.address || 'Tap to add location (optional)')}
        </Text>
        <View style={styles.locationRight}>
          {location?.provided ? (
            <Icon name="check-circle" size={18} color={colors.success || colors.primary} />
          ) : (
            <Icon name="plus-circle-outline" size={18} color={colors.primary} />
          )}
        </View>
      </TouchableOpacity>

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
              placeholderTextColor={colors.neutralMedium}
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

      <ScrollView contentContainerStyle={styles.content}>
        {media.length > 0 ? (
          <View style={styles.mediaGrid}>
            {media.map((item, index) => (
              <View key={index} style={styles.mediaItem}>
                <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                <TouchableOpacity style={styles.removeButton} onPress={() => removeMedia(index)}>
                  <Icon name="close-circle" size={24} color={colors.secondary} />
                </TouchableOpacity>
                {item.kind === 'video' && (
                  <View style={styles.videoIndicator}>
                    <Icon name="play" size={16} color={colors.white} />
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyMediaContainer}>
            <Icon name="image-multiple" size={80} color={colors.neutralLight} />
            <Text style={styles.emptyMediaText}>No media added yet</Text>
            <Text style={styles.emptyMediaSubtext}>
              Add photos, videos, or audio to make your report more credible
            </Text>
          </View>
        )}

        <View style={styles.mediaOptions}>
          <Text style={styles.sectionTitle}>Capture New Media</Text>
          <View style={styles.captureButtons}>
            <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
              <Icon name="camera" size={30} color={colors.primary} />
              <Text style={styles.captureButtonText}>Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={handleTakeVideo}>
              <Icon name="video" size={30} color={colors.primary} />
              <Text style={styles.captureButtonText}>Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, isRecording && styles.recordingButton]}
              onPress={handleRecordAudio}
            >
              <Icon
                name={isRecording ? 'microphone' : 'microphone-outline'}
                size={30}
                color={isRecording ? colors.secondary : colors.primary}
              />
              <Text style={styles.captureButtonText}>Audio</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.galleryButton} onPress={handleSelectFromGallery}>
            <Icon name="folder-multiple-image" size={24} color={colors.primary} />
            <Text style={styles.galleryButtonText}>Upload from gallery</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.mediaCount}>
          <Icon name="file" size={20} color={colors.neutralMedium} />
          <Text style={styles.mediaCountText}>
            {media.length} media file{media.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <Icon name="arrow-right" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  headerTitle: { ...typography.h3, color: colors.neutralDark },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  locationText: { ...typography.caption, color: colors.neutralDark, marginLeft: 8, flex: 1 },
  locationRight: { marginLeft: 10 },

  content: { padding: 20, paddingBottom: 100 },
  emptyMediaContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyMediaText: { ...typography.h3, color: colors.neutralMedium, marginTop: 20, marginBottom: 10 },
  emptyMediaSubtext: { ...typography.body, color: colors.neutralMedium, textAlign: 'center', lineHeight: 22 },

  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 30 },
  mediaItem: { width: '48%', aspectRatio: 1, marginBottom: '4%', marginRight: '4%', position: 'relative' },
  mediaImage: { width: '100%', height: '100%', borderRadius: 12 },
  removeButton: { position: 'absolute', top: -8, right: -8, backgroundColor: colors.white, borderRadius: 12 },
  videoIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mediaOptions: { marginBottom: 30 },
  sectionTitle: { ...typography.body, color: colors.neutralDark, fontWeight: '600', marginBottom: 15 },
  captureButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  captureButton: { alignItems: 'center', backgroundColor: colors.neutralLight, padding: 20, borderRadius: 16, width: '31%' },
  recordingButton: { backgroundColor: `${colors.secondary}20` },
  captureButtonText: { ...typography.caption, color: colors.neutralDark, marginTop: 8 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.neutralLight },
  dividerText: { ...typography.caption, color: colors.neutralMedium, marginHorizontal: 10 },

  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutralLight,
    paddingVertical: 16,
    borderRadius: 12,
  },
  galleryButtonText: { ...typography.body, color: colors.primary, marginLeft: 10, fontWeight: '500' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.neutralLight,
  },
  mediaCount: { flexDirection: 'row', alignItems: 'center' },
  mediaCountText: { ...typography.caption, color: colors.neutralMedium, marginLeft: 8 },
  continueButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  continueButtonText: { ...typography.body, color: colors.white, fontWeight: '600', marginRight: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.neutralDark,
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.neutralLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.neutralDark,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginLeft: 10,
  },
  modalCancel: {
    backgroundColor: colors.neutralLight,
  },
  modalConfirm: {
    backgroundColor: colors.primary,
  },
  modalCancelText: {
    ...typography.caption,
    color: colors.neutralDark,
  },
  modalConfirmText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
});
