import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useLocation } from '../../hooks/useLocation';
import { colors, typography, spacing } from '../../theme';

const ReportDescriptionScreen = ({ navigation, route }) => {
    const { category, media } = route.params || {};
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState('public');
    const { location } = useLocation();

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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Describe the Incident</Text>

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

                <Text style={styles.label}>Privacy</Text>
                <View style={styles.privacyOptions}>
                    <Button
                        title="Public"
                        variant={privacy === 'public' ? 'primary' : 'outline'}
                        onPress={() => setPrivacy('public')}
                        style={styles.privacyButton}
                    />
                    <Button
                        title="Anonymous"
                        variant={privacy === 'anonymous' ? 'primary' : 'outline'}
                        onPress={() => setPrivacy('anonymous')}
                        style={styles.privacyButton}
                    />
                </View>

                <Button
                    title="Continue"
                    onPress={handleNext}
                    disabled={!title || !description}
                    style={styles.continueButton}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    content: {
        flex: 1,
        padding: spacing.xl,
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xl,
        fontFamily: typography.families.bold,
    },
    label: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
        marginBottom: spacing.md,
        fontFamily: typography.families.medium,
    },
    privacyOptions: {
        flexDirection: 'row',
        marginBottom: spacing.xl,
    },
    privacyButton: {
        flex: 1,
        marginRight: spacing.md,
    },
    continueButton: {
        marginTop: 'auto',
    },
});

export default ReportDescriptionScreen;
