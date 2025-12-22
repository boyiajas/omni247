import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Card from '../../components/common/Card';
import { useAuth } from '../../hooks/useAuth';
import { colors, typography, spacing } from '../../theme';

const SettingsScreen = ({ navigation }) => {
    const { user, logout } = useAuth();

    const settingsOptions = [
        {
            title: 'Notifications',
            icon: 'notifications-outline',
            onPress: () => navigation.navigate('NotificationSettings'),
        },
        {
            title: 'Privacy',
            icon: 'shield-outline',
            onPress: () => navigation.navigate('PrivacySettings'),
        },
        {
            title: 'Language',
            icon: 'language-outline',
            onPress: () => navigation.navigate('LanguageSettings'),
        },
        {
            title: 'About',
            icon: 'information-circle-outline',
            onPress: () => { },
        },
    ];

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <Card>
                {settingsOptions.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.option}
                        onPress={option.onPress}>
                        <View style={styles.optionLeft}>
                            <Icon name={option.icon} size={24} color={colors.textPrimary} />
                            <Text style={styles.optionText}>{option.title}</Text>
                        </View>
                        <Icon name="chevron-forward" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                ))}
            </Card>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={logout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.md,
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xl,
        fontFamily: typography.families.bold,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        marginLeft: spacing.md,
        fontFamily: typography.families.regular,
    },
    logoutButton: {
        marginTop: spacing.xl,
        padding: spacing.md,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: typography.sizes.md,
        color: colors.error,
        fontWeight: typography.weights.semibold,
        fontFamily: typography.families.semibold,
    },
});

export default SettingsScreen;
