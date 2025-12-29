import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { typography } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

const faqData = [
    {
        category: 'Getting Started',
        questions: [
            {
                question: 'What is Omni247?',
                answer: 'Omni247 is a community-powered incident reporting platform that enables citizens to report, track, and engage with incidents in their area 24/7. Our platform connects communities, emergency services, and local authorities for safer neighborhoods.',
            },
            {
                question: 'How do I create an account?',
                answer: 'You can sign up using your email address or phone number. Simply tap "Sign Up" on the welcome screen, enter your details, verify your email/phone, and you\'re ready to start reporting incidents.',
            },
            {
                question: 'Is Omni247 free to use?',
                answer: 'Yes! Omni247 is completely free for all users. You can report incidents, view reports, comment, and access all core features at no cost.',
            },
        ],
    },
    {
        category: 'Reporting Incidents',
        questions: [
            {
                question: 'How do I report an incident?',
                answer: 'Tap the "+" button on the News Feed screen. Select a category, add a title and description, attach photos/videos if available, mark your location, and submit. Your report will be visible to the community immediately.',
            },
            {
                question: 'Can I report anonymously?',
                answer: 'Yes! When creating a report, you can toggle the "Anonymous" option. Your identity will be hidden, but the incident details will still be shared with the community.',
            },
            {
                question: 'What types of incidents can I report?',
                answer: 'You can report various incidents including accidents, crimes, fires, medical emergencies, infrastructure issues, suspicious activities, and more. Choose the appropriate category when submitting your report.',
            },
            {
                question: 'Can I attach photos or videos?',
                answer: 'Yes! You can attach up to 5 photos or 1 video per report. Visual evidence helps authorities respond more effectively and keeps the community informed.',
            },
            {
                question: 'How do I mark the incident location?',
                answer: 'The app uses your current GPS location by default. You can also drag the map pin to adjust the exact location or search for a specific address.',
            },
        ],
    },
    {
        category: 'Viewing & Interacting',
        questions: [
            {
                question: 'How do I view incidents near me?',
                answer: 'The News Feed shows incidents based on your current location. You can also use the Map view to see all incidents in your area visually. Filter by category or distance to find specific types of incidents.',
            },
            {
                question: 'Can I comment on reports?',
                answer: 'Yes! Tap on any report to view details, then scroll down to the comments section. You can add comments, helpful information, or updates about the incident.',
            },
            {
                question: 'What does the "Verified" badge mean?',
                answer: 'Verified badges indicate that the incident has been confirmed by multiple sources or validated by authorities. This helps users identify credible reports.',
            },
            {
                question: 'How do I save reports for later?',
                answer: 'Tap the bookmark icon on any report to save it to your Favorites. Access your saved reports anytime from the Profile > My Favourites section.',
            },
        ],
    },
    {
        category: 'Notifications & Alerts',
        questions: [
            {
                question: 'What are emergency alerts?',
                answer: 'Emergency alerts are high-priority notifications sent for critical incidents like natural disasters, security threats, or public safety emergencies. Enable them in Settings to stay informed.',
            },
            {
                question: 'How do I customize notifications?',
                answer: 'Go to Profile > Settings > Notifications. You can choose which types of incidents trigger notifications, set a notification radius, and enable/disable sounds and vibrations.',
            },
            {
                question: 'Why am I not receiving notifications?',
                answer: 'Check that notifications are enabled in your phone\'s Settings for Omni247. Also verify your in-app notification preferences and ensure you have location permissions enabled.',
            },
        ],
    },
    {
        category: 'Map & Location',
        questions: [
            {
                question: 'How does the Operations Map work?',
                answer: 'The Operations Map displays all reported incidents as pins on an interactive map. Different colors represent different incident types. Tap any pin to view incident details and tap clusters to zoom in.',
            },
            {
                question: 'Can I use the app without location services?',
                answer: 'You can browse reports, but location services are required to report incidents, receive location-based alerts, and view incidents near you.',
            },
            {
                question: 'How accurate is the location data?',
                answer: 'Location accuracy depends on your device\'s GPS signal. For best results, ensure you have a clear view of the sky and that location permissions are set to "Always Allow" or "While Using App".',
            },
        ],
    },
    {
        category: 'Rewards & Achievements',
        questions: [
            {
                question: 'How do I earn rewards?',
                answer: 'You earn points by reporting incidents, having your reports verified, adding helpful comments, and contributing valuable information. Check the Achievements section to see available rewards.',
            },
            {
                question: 'What are achievement badges?',
                answer: 'Achievement badges are earned by completing specific milestones like reporting your first incident, reaching view counts, or being an active community member. View your badges in the Profile section.',
            },
            {
                question: 'Can I redeem my points?',
                answer: 'Points contribute to your community ranking and unlock special badges. Future updates may include additional redemption options.',
            },
        ],
    },
    {
        category: 'Privacy & Safety',
        questions: [
            {
                question: 'Is my personal information safe?',
                answer: 'Yes! We use industry-standard encryption to protect your data. Your email and phone number are never shared publicly. You can control your privacy settings in the Profile section.',
            },
            {
                question: 'Who can see my reports?',
                answer: 'Reports are visible to all Omni247 users in your region. If you report anonymously, your name and profile picture are hidden. Only admins can access reporter identity for verification purposes.',
            },
            {
                question: 'How is my location data used?',
                answer: 'Location data is used only to show you nearby incidents and to mark incident locations. We do not track your movements or share your location with third parties.',
            },
            {
                question: 'Can I delete my reports?',
                answer: 'You can delete your own reports from the report details screen (tap the three dots menu). Note that verified or widely-viewed reports may remain for community safety reasons.',
            },
        ],
    },
    {
        category: 'Troubleshooting',
        questions: [
            {
                question: 'The app is crashing or freezing',
                answer: 'Try closing and reopening the app. If the issue persists, clear the app cache in your phone settings or reinstall the app. Make sure you\'re running the latest version.',
            },
            {
                question: 'Images are not loading',
                answer: 'Check your internet connection. Images require data to load. If on cellular data, ensure you haven\'t disabled image loading in Settings to save data.',
            },
            {
                question: 'I can\'t submit a report',
                answer: 'Ensure you have an active internet connection and that all required fields (title, category, location) are filled. Some categories may require additional information.',
            },
            {
                question: 'How do I report a bug or issue?',
                answer: 'Go to Profile > Contact Support to report technical issues. Include details about your device, app version, and steps to reproduce the problem.',
            },
        ],
    },
    {
        category: 'Account Management',
        questions: [
            {
                question: 'How do I change my profile picture?',
                answer: 'Tap your profile picture in the Profile tab, then select "Change Photo". You can choose from your gallery or take a new photo.',
            },
            {
                question: 'How do I update my email or phone number?',
                answer: 'Go to Profile > Settings > Account Settings. You\'ll need to verify your new email/phone number before the change takes effect.',
            },
            {
                question: 'Can I have multiple accounts?',
                answer: 'Each user should have only one account. Multiple accounts may be flagged and suspended to prevent abuse.',
            },
            {
                question: 'How do I delete my account?',
                answer: 'Go to Profile > Settings > Account Settings > Delete Account. This action is permanent and will remove all your reports, comments, and profile data.',
            },
        ],
    },
];

export default function FAQScreen({ navigation }) {
    const [expandedItems, setExpandedItems] = useState({});
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
        introSection: {
            alignItems: 'center',
            padding: 32,
            backgroundColor: palette.white,
            marginBottom: 16,
        },
        introTitle: {
            ...typography.h2,
            color: palette.textPrimary,
            marginTop: 16,
            marginBottom: 8,
        },
        introText: {
            ...typography.body,
            color: palette.textSecondary,
            textAlign: 'center',
        },
        categorySection: {
            backgroundColor: palette.white,
            marginBottom: 16,
            paddingVertical: 16,
        },
        categoryHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
            marginBottom: 8,
        },
        categoryTitle: {
            ...typography.h3,
            color: palette.textPrimary,
            marginLeft: 8,
        },
        questionCard: {
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
        },
        questionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        questionText: {
            ...typography.body,
            color: palette.textPrimary,
            fontWeight: '600',
            flex: 1,
            marginRight: 12,
        },
        answerContainer: {
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: palette.border,
        },
        answerText: {
            ...typography.body,
            color: palette.textSecondary,
            lineHeight: 22,
        },
        footerSection: {
            backgroundColor: palette.primary,
            padding: 32,
            alignItems: 'center',
            marginTop: 16,
        },
        footerTitle: {
            ...typography.h3,
            color: palette.white,
            marginBottom: 12,
        },
        footerText: {
            ...typography.body,
            color: palette.white,
            textAlign: 'center',
            opacity: 0.9,
        },
        footerLink: {
            fontWeight: '600',
            textDecorationLine: 'underline',
        },
    }));

    const toggleItem = (categoryIndex, questionIndex) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setExpandedItems(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const renderQuestion = (question, questionIndex, categoryIndex) => {
        const key = `${categoryIndex}-${questionIndex}`;
        const isExpanded = expandedItems[key];

        return (
            <TouchableOpacity
                key={key}
                style={styles.questionCard}
                onPress={() => toggleItem(categoryIndex, questionIndex)}
                activeOpacity={0.7}
            >
                <View style={styles.questionHeader}>
                    <Text style={styles.questionText}>{question.question}</Text>
                    <Icon
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={24}
                        color={colors.primary}
                    />
                </View>
                {isExpanded && (
                    <View style={styles.answerContainer}>
                        <Text style={styles.answerText}>{question.answer}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('faq.title')}</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.introSection}>
                    <Icon name="frequently-asked-questions" size={48} color={colors.primary} />
                    <Text style={styles.introTitle}>{t('faq.title')}</Text>
                    <Text style={styles.introText}>
                        {t('faq.subtitle')}
                    </Text>
                </View>

                {faqData.map((category, categoryIndex) => (
                    <View key={categoryIndex} style={styles.categorySection}>
                        <View style={styles.categoryHeader}>
                            <Icon name="folder-outline" size={20} color={colors.primary} />
                            <Text style={styles.categoryTitle}>{category.category}</Text>
                        </View>
                        {category.questions.map((question, questionIndex) =>
                            renderQuestion(question, questionIndex, categoryIndex)
                        )}
                    </View>
                ))}

                <View style={styles.footerSection}>
                    <Text style={styles.footerTitle}>{t('faq.footerTitle')}</Text>
                    <Text style={styles.footerText}>
                        {t('faq.footerBody')}{'\n'}
                        <Text style={styles.footerLink}>support@omni247.com</Text>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
