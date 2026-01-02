import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/ui/Badge';
import { reportsAPI } from '../../services/api/reports';
import { mediaAPI } from '../../services/api/media';
import { typography, spacing } from '../../theme';
import { formatDate } from '../../utils/formatters';
import { useLanguage } from '../../contexts/LanguageContext';
import useThemedStyles from '../../theme/useThemedStyles';
import { useLocation } from '../../hooks/useLocation';

const ReportPreviewScreen = ({ navigation, route }) => {
  const { category, media, title, description, privacy, location } = route.params || {};
  const { t } = useLanguage();
  const locationContext = useLocation();
  const styles = useThemedStyles((palette) => ({
    container: { flex: 1, backgroundColor: palette.background },
    content: { flex: 1, padding: spacing.xl },
    title: {
      fontSize: typography.sizes.xxl,
      fontWeight: typography.weights.bold,
      marginBottom: spacing.xl,
      color: palette.textPrimary,
    },
    badge: { marginBottom: spacing.md },
    reportTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      marginBottom: spacing.sm,
      color: palette.textPrimary,
    },
    description: { fontSize: typography.sizes.md, marginBottom: spacing.md, color: palette.textSecondary },
    mediaContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
    mediaItem: { width: 100, height: 100, borderRadius: 8, marginRight: spacing.sm, marginBottom: spacing.sm },
    metadata: { borderTopWidth: 1, paddingTop: spacing.md, borderTopColor: palette.border },
    metadataItem: { fontSize: typography.sizes.sm, marginBottom: spacing.xs, color: palette.textSecondary },
    footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: palette.border },
  }));

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const resolveSubmitterLocation = async () => {
    if (!locationContext?.requestLocationPermission || !locationContext?.getCurrentLocation) {
      return null;
    }

    try {
      const granted = await locationContext.requestLocationPermission();
      if (!granted) {
        return null;
      }
      const current = await locationContext.getCurrentLocation();
      return current || null;
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setUploadProgress(0);

    try {
      const submitterLocation =
        locationContext?.location || await resolveSubmitterLocation();

      const payload = {
        category_id: category?.backendId ?? category?.id,
        title: title || t('newsfeed.untitled'),
        description: description || '',
        latitude: location?.latitude ?? 0,
        longitude: location?.longitude ?? 0,
        address: location?.address ?? null,
        privacy: privacy || 'public',
        submitter_latitude: submitterLocation?.latitude ?? null,
        submitter_longitude: submitterLocation?.longitude ?? null,
        submitter_accuracy: submitterLocation?.accuracy ?? null,
        submitter_location_recorded_at: submitterLocation?.timestamp
          ? new Date(submitterLocation.timestamp).toISOString()
          : null,
      };

      // 1) Create report
      const reportRes = await reportsAPI.createReport(payload);
      const reportId = reportRes?.data?.id;

      if (!reportId) throw new Error('Report created but no report ID returned.');

      // 2) Upload media (after report exists)
      const items = Array.isArray(media) ? media : [];

      console.log('MEDIA PARAM:', media);
    console.log('ITEMS LENGTH:', items.length);

      if (items.length > 0) {
        console.log('Uploading media now...');
        await mediaAPI.uploadMultiple(reportId, items, (pct) => setUploadProgress(pct));
        console.log('Media upload done');
      }else {
            console.log('No media to upload');
        }

      navigation.navigate('ReportSuccess');
    } catch (error) {
      console.log('Submit report error:', error?.response?.data || error);

      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to submit report. Please try again.';

      Alert.alert(t('reportFlow.addressErrorTitle'), msg);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>{t('reportPreview.title')}</Text>

        <Card>
          <Badge text={category?.label || category?.name || t('newsfeed.unknownLocation')} variant="info" style={styles.badge} />

          <Text style={styles.reportTitle}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {Array.isArray(media) && media.length > 0 && (
            <View style={styles.mediaContainer}>
              {media.map((item, index) => (
                <Image key={index} source={{ uri: item.uri }} style={styles.mediaItem} />
              ))}
            </View>
          )}

          <View style={styles.metadata}>
            <Text style={styles.metadataItem}>{t('reportPreview.privacyLabel')}: {privacy}</Text>
            <Text style={styles.metadataItem}>
              {t('reportPreview.locationLabel')}: {location?.address || location?.formattedAddress
                || `${Number(location?.latitude || 0).toFixed(6)}, ${Number(location?.longitude || 0).toFixed(6)}`}
            </Text>
            <Text style={styles.metadataItem}>{t('reportPreview.timeLabel')}: {formatDate(new Date(), 'datetime')}</Text>

            {loading && (media?.length || 0) > 0 ? (
              <Text style={styles.metadataItem}>
                {t('reportPreview.uploading')}: {uploadProgress}%
              </Text>
            ) : null}
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={t('reportPreview.submit')} onPress={handleSubmit} loading={loading} />
      </View>
    </View>
  );
};
export default ReportPreviewScreen;
