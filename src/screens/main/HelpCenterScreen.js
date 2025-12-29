import React from 'react';
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

export default function HelpCenterScreen({ navigation }) {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = useThemedStyles((palette) => ({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
            backgroundColor: palette.white,
        },
        backButton: {
            padding: 8,
        },
        headerTitle: {
            ...typography.h2,
            color: palette.textPrimary,
        },
        placeholder: {
            width: 40,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: 32,
        },
        heroSection: {
            alignItems: 'center',
            padding: 32,
            backgroundColor: palette.white,
        },
        heroTitle: {
            ...typography.h2,
            color: palette.textPrimary,
            marginTop: 16,
            marginBottom: 8,
        },
        heroSubtitle: {
            ...typography.body,
            color: palette.textSecondary,
            textAlign: 'center',
        },
        quickActions: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            gap: 12,
            marginTop: 16,
            marginBottom: 24,
        },
        quickActionCard: {
            flex: 1,
            backgroundColor: palette.white,
            borderRadius: 12,
            padding: 20,
            alignItems: 'center',
            shadowColor: palette.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        quickActionTitle: {
            ...typography.body,
            fontWeight: '600',
            color: palette.textPrimary,
            marginTop: 8,
        },
        quickActionText: {
            ...typography.small,
            color: palette.textSecondary,
            marginTop: 4,
            textAlign: 'center',
        },
        topicsSection: {
            paddingHorizontal: 20,
        },
        sectionTitle: {
            ...typography.h3,
            color: palette.textPrimary,
            marginBottom: 16,
        },
        topicCard: {
            backgroundColor: palette.white,
            borderRadius: 12,
            marginBottom: 16,
            shadowColor: palette.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        topicHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
        },
        topicIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        topicTitle: {
            ...typography.h3,
            color: palette.textPrimary,
        },
        topicItems: {
            padding: 8,
        },
        helpItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderRadius: 8,
        },
        helpItemText: {
            ...typography.body,
            color: palette.textPrimary,
            flex: 1,
            marginLeft: 12,
        },
        footerCard: {
            backgroundColor: palette.white,
            marginHorizontal: 20,
            borderRadius: 16,
            padding: 32,
            alignItems: 'center',
            marginTop: 16,
        },
        footerTitle: {
            ...typography.h3,
            color: palette.textPrimary,
            marginTop: 16,
            marginBottom: 8,
        },
        footerText: {
            ...typography.body,
            color: palette.textSecondary,
            textAlign: 'center',
            marginBottom: 20,
        },
        contactButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: palette.primary,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 24,
            gap: 8,
        },
        contactButtonText: {
            ...typography.body,
            color: palette.white,
            fontWeight: '600',
        },
    }));
    const helpTopics = [
        {
            id: '1',
            title: t('helpCenter.topicGettingStarted'),
            icon: 'rocket-launch',
            color: '#22c55e',
            items: [
                { title: t('helpCenter.itemFirstReport'), icon: 'file-plus' },
                { title: t('helpCenter.itemProfileSetup'), icon: 'account-cog' },
                { title: t('helpCenter.itemAppInterface'), icon: 'view-dashboard' },
                { title: t('helpCenter.itemNotificationPrefs'), icon: 'bell-cog' },
            ],
        },
        {
            id: '2',
            title: t('helpCenter.topicReporting'),
            icon: 'flag',
            color: '#3b82f6',
            items: [
                { title: t('helpCenter.itemCategory'), icon: 'format-list-bulleted' },
                { title: t('helpCenter.itemMedia'), icon: 'camera' },
                { title: t('helpCenter.itemLocation'), icon: 'map-marker' },
                { title: t('helpCenter.itemAnonymous'), icon: 'incognito' },
            ],
        },
        {
            id: '3',
            title: t('helpCenter.topicSafety'),
            icon: 'shield-check',
            color: '#f59e0b',
            items: [
                { title: t('helpCenter.itemDataPrivacy'), icon: 'lock' },
                { title: t('helpCenter.itemSafety'), icon: 'shield-account' },
                { title: t('helpCenter.itemVerification'), icon: 'check-decagram' },
                { title: t('helpCenter.itemBlocking'), icon: 'account-cancel' },
            ],
        },
        {
            id: '4',
            title: t('helpCenter.topicRewards'),
            icon: 'trophy',
            color: '#8b5cf6',
            items: [
                { title: t('helpCenter.itemBadges'), icon: 'medal' },
                { title: t('helpCenter.itemLeveling'), icon: 'arrow-up-bold' },
                { title: t('helpCenter.itemRankings'), icon: 'podium' },
                { title: t('helpCenter.itemRedeem'), icon: 'gift' },
            ],
        },
        {
            id: '5',
            title: t('helpCenter.topicMapAlerts'),
            icon: 'map',
            color: '#06b6d4',
            items: [
                { title: t('helpCenter.itemOpsMap'), icon: 'map-search' },
                { title: t('helpCenter.itemAlertPrefs'), icon: 'bell-alert' },
                { title: t('helpCenter.itemEmergency'), icon: 'alert-octagon' },
                { title: t('helpCenter.itemLocationServices'), icon: 'crosshairs-gps' },
            ],
        },
        {
            id: '6',
            title: t('helpCenter.topicTroubleshooting'),
            icon: 'tools',
            color: '#ef4444',
            items: [
                { title: t('helpCenter.itemCrashes'), icon: 'restart' },
                { title: t('helpCenter.itemLoginIssues'), icon: 'login-variant' },
                { title: t('helpCenter.itemUploadIssues'), icon: 'image-off' },
                { title: t('helpCenter.itemNotifications'), icon: 'bell-off' },
            ],
        },
    ];
    const handleTopicPress = (topic, item) => {
        // Navigate to FAQ with specific category or show detailed help
        navigation.navigate('FAQ');
    };

    const handleContactSupport = () => {
        navigation.navigate('ContactSupport');
    };

    const renderHelpTopic = (topic) => (
        <View key={topic.id} style={styles.topicCard}>
            <View style={styles.topicHeader}>
                <View style={[styles.topicIcon, { backgroundColor: `${topic.color}20` }]}>
                    <Icon name={topic.icon} size={28} color={topic.color} />
                </View>
                <Text style={styles.topicTitle}>{topic.title}</Text>
            </View>
            <View style={styles.topicItems}>
                {topic.items.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.helpItem}
                        onPress={() => handleTopicPress(topic, item)}
                        activeOpacity={0.7}
                    >
                        <Icon name={item.icon} size={20} color={colors.textSecondary} />
                        <Text style={styles.helpItemText}>{item.title}</Text>
                        <Icon name="chevron-right" size={20} color={colors.border} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('helpCenter.title')}</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroSection}>
                    <Icon name="help-circle" size={64} color={colors.primary} />
                    <Text style={styles.heroTitle}>{t('helpCenter.heroTitle')}</Text>
                    <Text style={styles.heroSubtitle}>
                        {t('helpCenter.heroSubtitle')}
                    </Text>
                </View>

                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => navigation.navigate('FAQ')}
                        activeOpacity={0.7}
                    >
                        <Icon name="frequently-asked-questions" size={32} color={colors.primary} />
                        <Text style={styles.quickActionTitle}>{t('helpCenter.faq')}</Text>
                        <Text style={styles.quickActionText}>{t('helpCenter.faqSubtitle')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={handleContactSupport}
                        activeOpacity={0.7}
                    >
                        <Icon name="email" size={32} color={colors.accent} />
                        <Text style={styles.quickActionTitle}>{t('helpCenter.contact')}</Text>
                        <Text style={styles.quickActionText}>{t('helpCenter.contactSubtitle')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.topicsSection}>
                    <Text style={styles.sectionTitle}>{t('helpCenter.browseTopics')}</Text>
                    {helpTopics.map(renderHelpTopic)}
                </View>

                <View style={styles.footerCard}>
                    <Icon name="lifebuoy" size={48} color={colors.primary} />
                    <Text style={styles.footerTitle}>{t('helpCenter.footerTitle')}</Text>
                    <Text style={styles.footerText}>
                        {t('helpCenter.footerSubtitle')}
                    </Text>
                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={handleContactSupport}
                    >
                        <Icon name="email-outline" size={20} color={colors.white} />
                        <Text style={styles.contactButtonText}>{t('helpCenter.footerAction')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
