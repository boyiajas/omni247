import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Button from '../../components/common/Button';
import { colors, typography, spacing } from '../../theme';

const WelcomeScreen = ({ navigation }) => {
    return (
        <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={require('../../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Welcome to G-iReport</Text>
                <Text style={styles.subtitle}>
                    Report incidents, stay informed, make a difference
                </Text>
            </View>

            <View style={styles.footer}>
                <Button
                    title="Sign In"
                    variant="outline"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.button}
                    textStyle={styles.buttonText}
                />
                <Button
                    title="Create Account"
                    onPress={() => navigation.navigate('Register')}
                    style={styles.button}
                />
                <Button
                    title="Continue Anonymously"
                    variant="text"
                    onPress={() => navigation.navigate('AnonymousLogin')}
                    style={styles.anonymousButton}
                    textStyle={styles.anonymousText}
                />
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.white,
        textAlign: 'center',
        marginBottom: spacing.md,
        fontFamily: typography.families.bold,
    },
    subtitle: {
        fontSize: typography.sizes.md,
        color: colors.white,
        textAlign: 'center',
        opacity: 0.9,
        fontFamily: typography.families.regular,
    },
    footer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
    },
    button: {
        marginBottom: spacing.md,
    },
    buttonText: {
        color: colors.white,
    },
    anonymousButton: {
        marginTop: spacing.md,
    },
    anonymousText: {
        color: colors.white,
    },
});

export default WelcomeScreen;
