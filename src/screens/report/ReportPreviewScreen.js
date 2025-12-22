import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Alert } from 'react-native';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/ui/Badge';
import { reportsAPI } from '../../services/api/reports';
import { mediaAPI } from '../../services/api/media';
import { colors, typography, spacing } from '../../theme';
import { formatDate } from '../../utils/formatters';

const ReportPreviewScreen = ({ navigation, route }) => {
  const { category, media, title, description, privacy, location } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async () => {
    setLoading(true);
    setUploadProgress(0);

    try {
      const payload = {
        category_id: category?.backendId ?? category?.id,
        title: title || 'Untitled Report',
        description: description || '',
        latitude: location?.latitude ?? 0,
        longitude: location?.longitude ?? 0,
        address: location?.address ?? null,
        privacy: privacy || 'public',
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

      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Review Your Report</Text>

        <Card>
          <Badge text={category?.label || category?.name || 'Unknown'} variant="info" style={styles.badge} />

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
            <Text style={styles.metadataItem}>Privacy: {privacy}</Text>
            <Text style={styles.metadataItem}>
              Location: {Number(location?.latitude || 0).toFixed(6)}, {Number(location?.longitude || 0).toFixed(6)}
            </Text>
            <Text style={styles.metadataItem}>Time: {formatDate(new Date(), 'datetime')}</Text>

            {loading && (media?.length || 0) > 0 ? (
              <Text style={styles.metadataItem}>Uploading media: {uploadProgress}%</Text>
            ) : null}
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Submit Report" onPress={handleSubmit} loading={loading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1, padding: spacing.xl },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.xl },
  badge: { marginBottom: spacing.md },
  reportTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, marginBottom: spacing.sm },
  description: { fontSize: typography.sizes.md, marginBottom: spacing.md },
  mediaContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  mediaItem: { width: 100, height: 100, borderRadius: 8, marginRight: spacing.sm, marginBottom: spacing.sm },
  metadata: { borderTopWidth: 1, paddingTop: spacing.md },
  metadataItem: { fontSize: typography.sizes.sm, marginBottom: spacing.xs },
  footer: { padding: spacing.xl, borderTopWidth: 1 },
});

export default ReportPreviewScreen;
