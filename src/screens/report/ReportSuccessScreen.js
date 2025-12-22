import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../../components/common/Button';
import { colors, typography, spacing } from '../../theme';

const ReportSuccessScreen = ({ navigation }) => {
    const handleViewReport = () => {
        navigation.navigate('MainTabs', { screen: 'NewsFeed' });
    };

    const handleCreateAnother = () => {
        navigation.navigate('ReportCategory');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Icon name="checkmark-circle" size={100} color={colors.success} />
                </View>

                <Text style={styles.title}>Report Submitted!</Text>
                <Text style={styles.message}>
                    Thank you for your contribution. Your report is being verified and will be visible soon.
                </Text>

                <View style={styles.info}>
                    <Text style={styles.infoText}>
                        ✓ Your report has been received
                    </Text>
                    <Text style={styles.infoText}>
                        ✓ AI verification in progress
                    </Text>
                    <Text style={styles.infoText}>
                        ✓ You'll be notified once verified
                    </Text>
                </View>

                <Button
                    title="View My Reports"
                    onPress={handleViewReport}
                    style={styles.button}
                />

                <Button
                    title="Submit Another Report"
                    variant="outline"
                    onPress={handleCreateAnother}
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    iconContainer: {
        marginBottom: spacing.xl,
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
        textAlign: 'center',
        marginBottom: spacing.xl,
        fontFamily: typography.families.regular,
        lineHeight: 22,
    },
    info: {
        alignSelf: 'stretch',
        marginBottom: spacing.xl,
    },
    infoText: {
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        fontFamily: typography.families.regular,
    },
    button: {
        width: '100%',
        marginBottom: spacing.md,
    },
});

export default ReportSuccessScreen;
