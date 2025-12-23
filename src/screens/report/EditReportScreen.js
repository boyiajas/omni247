import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { reportsAPI } from '../../services/api/reports';
import { colors, typography, spacing } from '../../theme';

const EditReportScreen = ({ navigation, route }) => {
    const paramReport = route.params?.report || null;
    const paramId = route.params?.reportId || paramReport?.id || '';
    const reportId = paramId ? paramId.toString().replace('api-', '') : '';

    const [title, setTitle] = useState(paramReport?.title || '');
    const [description, setDescription] = useState(paramReport?.description || '');
    const [loading, setLoading] = useState(false);

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
            await reportsAPI.updateReport(reportId, {
                title: title.trim(),
                description: description.trim(),
            });
            Alert.alert('Success', 'Report updated successfully.');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to update report.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Edit Report</Text>
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
});

export default EditReportScreen;
