import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { colors, typography, spacing } from '../../theme';

const AnonymousLoginScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const { anonymousLogin } = useAuth();

    const handleContinue = async () => {
        setLoading(true);
        const result = await anonymousLogin();
        setLoading(false);

        if (result.success) {
            // Navigation will be handled by AppNavigator
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Continue Anonymously</Text>
                <Text style={styles.message}>
                    You can browse and report incidents without creating an account.{'\n\n'}
                    Note: Some features may be limited in anonymous mode.
                </Text>

                <View style={styles.features}>
                    <Text style={styles.featureItem}>✓ View incidents on map</Text>
                    <Text style={styles.featureItem}>✓ Submit anonymous reports</Text>
                    <Text style={styles.featureItem}>✓ Get nearby alerts</Text>
                </View>

                <Button
                    title="Continue Anonymously"
                    onPress={handleContinue}
                    loading={loading}
                    style={styles.button}
                />

                <Button
                    title="Create Account Instead"
                    variant="outline"
                    onPress={() => navigation.navigate('Register')}
                    style={styles.button}
                />
            </View>
        </View>
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
        justifyContent: 'center',
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
        fontFamily: typography.families.bold,
    },
    message: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
        fontFamily: typography.families.regular,
        lineHeight: 24,
    },
    features: {
        marginBottom: spacing.xl,
    },
    featureItem: {
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        fontFamily: typography.families.regular,
    },
    button: {
        marginBottom: spacing.md,
    },
});

export default AnonymousLoginScreen;
