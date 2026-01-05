import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { reportsAPI } from '../../services/api/reports';
import { commentsAPI } from '../../services/api/comments';
import { API_BASE_URL } from '../../config/api';
import Loading from '../../components/common/Loading';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { typography, spacing } from '../../theme';
import { formatRelativeTime } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemedStyles from '../../theme/useThemedStyles';

// Placeholder image for reports without media
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

const isCoordinateLocation = (value) => {
    if (!value) return false;
    const trimmed = value.toString().trim();
    return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(trimmed);
};

const isPlaceholderLocation = (value, t) => {
    if (!value) return true;
    const normalized = value.toString().trim().toLowerCase();
    const unknownLabel = t('newsfeed.unknownLocation').toLowerCase();
    return (
        !normalized
        || normalized === unknownLabel
        || normalized === 'unknown location'
        || normalized === 'getting location...'
        || normalized === 'getting location…'
        || isCoordinateLocation(normalized)
    );
};

const getDisplayLocation = (report, t) => {
    const rawLocation = report?.address
        || report?.location_address
        || [report?.city, report?.country].filter(Boolean).join(', ');

    if (isPlaceholderLocation(rawLocation, t)) {
        return t('newsfeed.unknownLocation');
    }

    return rawLocation.toString().trim();
};

const ReportDetailScreen = ({ route, navigation }) => {
    const { user } = useAuth();
    const { refreshUnreadCount } = useNotifications();
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = useThemedStyles((palette) => ({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        imageContainer: {
            position: 'relative',
        },
        heroImage: {
            width: '100%',
            height: 250,
        },
        categoryBadge: {
            position: 'absolute',
            bottom: 15,
            left: 15,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
        },
        categoryText: {
            color: palette.white,
            fontSize: 12,
            fontWeight: '600',
            textTransform: 'capitalize',
        },
        ownerBadge: {
            position: 'absolute',
            top: 15,
            right: 15,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: palette.primary,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 12,
        },
        ownerBadgeText: {
            color: palette.white,
            fontSize: 11,
            fontWeight: '600',
            marginLeft: 4,
        },
        backButton: {
            position: 'absolute',
            top: 40,
            left: 16,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
        },
        backButtonText: {
            color: palette.white,
            fontWeight: '600',
        },
        content: {
            padding: 16,
        },
        title: {
            fontSize: 22,
            fontWeight: 'bold',
            color: palette.textPrimary,
            marginBottom: 4,
        },
        time: {
            fontSize: 13,
            color: palette.textSecondary,
            marginBottom: 16,
        },
        userSection: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: palette.border,
        },
        userAvatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: palette.neutralLight,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        userInfo: {
            flex: 1,
        },
        userName: {
            fontSize: 15,
            fontWeight: '600',
            color: palette.textPrimary,
        },
        userSubtext: {
            fontSize: 12,
            color: palette.textSecondary,
        },
        statsRow: {
            flexDirection: 'row',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderColor: palette.border,
        },
        statItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 20,
        },
        statText: {
            fontSize: 13,
            color: palette.textSecondary,
            marginLeft: 6,
        },
        ratingSection: {
            marginTop: 12,
            marginBottom: 6,
        },
        ratingHeaderRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
        },
        ratingLabel: {
            fontSize: 12,
            color: palette.textSecondary,
        },
        ratingLink: {
            fontSize: 12,
            color: palette.primary,
            fontWeight: typography.weights.semibold,
        },
        ratingRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        ratingButton: {
            marginRight: 6,
        },
        ratingLoader: {
            marginLeft: 8,
        },
        actionBar: {
            flexDirection: 'row',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderColor: palette.border,
        },
        actionButton: {
            marginRight: 20,
        },
        section: {
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderColor: palette.border,
        },
        sectionTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: palette.textPrimary,
            marginBottom: 10,
        },
        description: {
            fontSize: 15,
            color: palette.textPrimary,
            lineHeight: 24,
        },
        locationCard: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: palette.neutralLight,
            borderRadius: 10,
        },
        locationInfo: {
            flex: 1,
            marginLeft: 12,
        },
        locationText: {
            fontSize: 14,
            color: palette.textPrimary,
        },
        locationSubtext: {
            fontSize: 12,
            color: palette.textSecondary,
            marginTop: 2,
        },
        tagsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        tag: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 16,
            marginRight: 8,
            marginBottom: 8,
        },
        tagText: {
            fontSize: 12,
            fontWeight: '500',
        },
        addCommentRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        commentInput: {
            flex: 1,
            height: 44,
            backgroundColor: palette.neutralLight,
            borderRadius: 22,
            paddingHorizontal: 16,
            fontSize: 14,
            color: palette.textPrimary,
        },
        sendButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: palette.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 10,
        },
        commentItem: {
            flexDirection: 'row',
            marginBottom: 12,
        },
        commentAvatar: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: palette.neutralLight,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
        },
        commentContent: {
            flex: 1,
            backgroundColor: palette.neutralLight,
            borderRadius: 12,
            padding: 10,
        },
        commentHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 4,
        },
        commentUser: {
            fontSize: 13,
            fontWeight: '600',
            color: palette.textPrimary,
        },
        commentTime: {
            fontSize: 11,
            color: palette.textSecondary,
        },
        commentText: {
            fontSize: 14,
            color: palette.textPrimary,
            lineHeight: 20,
        },
        sendButtonDisabled: {
            opacity: 0.6,
        },
        commentsLoading: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 20,
        },
        loadingText: {
            marginLeft: 8,
            color: palette.textSecondary,
            fontSize: 14,
        },
        deleteCommentBtn: {
            marginLeft: 'auto',
            padding: 4,
        },
        noComments: {
            textAlign: 'center',
            color: palette.textSecondary,
            fontSize: 14,
            paddingVertical: 20,
            fontStyle: 'italic',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
            backgroundColor: palette.background,
        },
        emptyTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: palette.textPrimary,
            marginTop: 16,
            marginBottom: 8,
        },
        emptyText: {
            fontSize: 14,
            color: palette.textSecondary,
            textAlign: 'center',
            marginBottom: 20,
        },
        commentsDisabledContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.lg,
            backgroundColor: palette.neutralLight,
            borderRadius: 12,
            marginBottom: spacing.md,
        },
        commentsDisabledText: {
            fontSize: typography.sizes.sm,
            color: palette.textSecondary,
            marginLeft: spacing.sm,
        },
    }));
    const paramReport = route.params?.report || null;
    const paramId = route.params?.id || route.params?.reportId || paramReport?.id || '';
    const id = paramId ? paramId.toString().replace('api-', '') : '';

    const [report, setReport] = useState(paramReport);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [addingComment, setAddingComment] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(false);

    useEffect(() => {
        if (id) {
            loadReport();
            loadComments();
        } else {
            setLoading(false);
            setError(t('reportDetail.noReportId'));
        }
    }, [id]);

    useFocusEffect(
        React.useCallback(() => {
            if (id) {
                loadReport();
            }
        }, [id])
    );

    const loadReport = async () => {
        try {
            setError(null);
            const response = await reportsAPI.getReportDetail(id);
            setReport(response.data);
        } catch (err) {
            console.error('Error loading report:', err);
            setError(t('reportDetail.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        try {
            setCommentsLoading(true);
            const response = await commentsAPI.getComments(id);
            const commentsData = response.data || [];
            // Transform to expected format
            setComments(commentsData.map(c => ({
                id: c.id,
                userId: c.user_id,
                user: c.user?.name || t('profile.anonymous'),
                text: c.content,
                time: formatRelativeTime(c.created_at),
                avatar: c.user?.avatar_url,
            })));
            refreshUnreadCount();
        } catch (err) {
            console.error('Error loading comments:', err);
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleLike = () => {
        setLiked(!liked);
    };

    const handleOpenRatings = () => {
        if (!id) {
            return;
        }
        navigation.navigate('ReportRatings', {
            reportId: id,
            report,
        });
    };

    const handleRateReport = async (rating) => {
        if (!id || isOwner) {
            return;
        }

        try {
            setRatingLoading(true);
            setUserRating(rating);
            await reportsAPI.rateReport(id, rating);
            await loadReport();
        } catch (error) {
            Alert.alert(t('reportFlow.addressErrorTitle'), t('reportDetail.ratingError'));
        } finally {
            setRatingLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            const title = report?.title || t('reportDetail.titleFallback');
            const location = getDisplayLocation(report, t);
            const description = report?.description ? `\n\n${report.description}` : '';
            const message = `${title}\n${location}${description}`;

            await Share.share({
                title,
                message,
            });
        } catch (error) {
            Alert.alert(t('reportFlow.addressErrorTitle'), t('reportDetail.shareError'));
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return;

        try {
            setAddingComment(true);
            const newComment = await commentsAPI.addComment(id, commentText.trim());
            // Add new comment to top of list
            setComments([{
                id: newComment.id,
                userId: newComment.user_id,
                user: newComment.user?.name || user?.name || t('reportDetail.you'),
                text: newComment.content,
                time: t('newsfeed.justNow'),
                avatar: newComment.user?.avatar_url,
            }, ...comments]);
            setCommentText('');
            if (route.params?.onCommentAdded) {
                route.params.onCommentAdded(id);
            }
        } catch (err) {
            console.error('Error adding comment:', err);
            // Check if error is due to disabled comments
            if (err.response?.status === 403) {
                Alert.alert(t('reportDetail.commentsDisabledTitle'), t('reportDetail.commentsDisabledBody'));
            } else {
                Alert.alert(t('reportFlow.addressErrorTitle'), t('reportDetail.addCommentError'));
            }
        } finally {
            setAddingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        Alert.alert(
            t('reportDetail.deleteCommentTitle'),
            t('reportDetail.deleteCommentBody'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await commentsAPI.deleteComment(commentId);
                            setComments(comments.filter(c => c.id !== commentId));
                        } catch (err) {
                            Alert.alert(t('reportFlow.addressErrorTitle'), t('reportDetail.deleteCommentError'));
                        }
                    },
                },
            ]
        );
    };

    const isOwner = report?.user_id === user?.id;

    const handleEdit = () => {
        navigation.navigate('EditReport', {
            reportId: id,
            report,
            onUpdated: (updatedReport) => {
                if (!updatedReport) return;
                setReport((prev) => ({
                    ...prev,
                    ...updatedReport,
                }));
            },
        });
    };

    const handleDelete = () => {
        Alert.alert(
            t('newsfeed.delete'),
            t('newsfeed.deleteReportConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await reportsAPI.deleteReport(id);
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert(t('reportDetail.errorTitle'), t('reportDetail.deleteFailed'));
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return <Loading message={t('common.loading')} />;
    }

    if (error || !report) {
        return (
            <View style={styles.emptyContainer}>
                <Icon name="alert-circle-outline" size={60} color={colors.textSecondary} />
                <Text style={styles.emptyTitle}>{t('reportDetail.notFoundTitle')}</Text>
                <Text style={styles.emptyText}>{error || t('reportDetail.notFoundBody')}</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>{t('reportDetail.goBack')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const categoryName = report.category?.name || t('reportDetail.categoryFallback');
    const categoryColors = {
        crime: colors.secondary,
        event: colors.warning,
        accident: '#EA580C',
        environment: colors.accent,
        politics: '#7C3AED',
        infrastructure: '#4F46E5',
        other: colors.textSecondary,
    };
    const categoryColor = categoryColors[categoryName.toLowerCase()] || categoryColors.other;
    const apiHost = API_BASE_URL.replace(/\/api\/?$/, '');

    // Get media URL and fix for Android emulator
    let mediaUrl = report.media?.[0]?.url || PLACEHOLDER_IMAGE;
    if (mediaUrl && mediaUrl !== PLACEHOLDER_IMAGE) {
        mediaUrl = mediaUrl
            .replace('http://127.0.0.1:8000', apiHost)
            .replace('http://localhost:8000', apiHost)
            .replace('http://localhost', apiHost)
            .replace('http://10.0.2.2:8000', apiHost);
        if (mediaUrl.startsWith('/storage/')) {
            mediaUrl = `${apiHost}${mediaUrl}`;
        } else if (!mediaUrl.startsWith('http')) {
            mediaUrl = `${apiHost}/storage/${mediaUrl}`;
        }
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView style={styles.container}>
                {/* Header Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: mediaUrl }} style={styles.heroImage} />

                    {/* Back button - positioned over image */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color={colors.white} />
                    </TouchableOpacity>

                    <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                        <Text style={styles.categoryText}>{categoryName}</Text>
                    </View>
                    {isOwner && (
                        <View style={styles.ownerBadge}>
                            <Icon name="account" size={12} color={colors.white} />
                            <Text style={styles.ownerBadgeText}>{t('reportDetail.ownerBadge')}</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Title & Time */}
                    <Text style={styles.title}>{report.title}</Text>
                    <Text style={styles.time}>{formatRelativeTime(report.created_at)}</Text>

                    {/* User Info - Modified for anonymous reports */}
                    {!(report.is_anonymous || report.privacy === 'anonymous') && report.user ? (
                        <View style={styles.userSection}>
                            <View style={styles.userAvatar}>
                                <Icon name="account" size={24} color={colors.textSecondary} />
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>
                                    {report.user.name || t('profile.anonymous')}
                                </Text>
                                <Text style={styles.userSubtext}>{t('reportDetail.reporter')}</Text>
                            </View>
                            {report.user.is_verified && (
                                <Icon name="check-decagram" size={20} color={colors.primary} />
                            )}
                        </View>
                    ) : (
                        <View style={styles.userSection}>
                            <View style={styles.userAvatar}>
                                <Icon name="incognito" size={24} color={colors.textSecondary} />
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{t('profile.anonymous')}</Text>
                                <Text style={styles.userSubtext}>{t('reportDetail.reporter')}</Text>
                            </View>
                        </View>
                    )}
                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Icon name="eye" size={18} color={colors.textSecondary} />
                            <Text style={styles.statText}>{t('reportDetail.viewsCount', { count: report.views_count || 0 })}</Text>
                        </View>
                        <TouchableOpacity style={styles.statItem} onPress={handleOpenRatings}>
                            <Icon name="star" size={18} color={colors.warning} />
                            <Text style={styles.statText}>
                                {t('reportDetail.ratingValue', { count: parseFloat(report.average_rating || 0).toFixed(1) })}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.statItem}>
                            <Icon name="comment-outline" size={18} color={colors.textSecondary} />
                            <Text style={styles.statText}>{t('reportDetail.commentsCount', { count: comments.length })}</Text>
                        </View>
                    </View>

                    <View style={styles.ratingSection}>
                        <View style={styles.ratingHeaderRow}>
                            <Text style={styles.ratingLabel}>
                                {isOwner ? t('reportDetail.ownerRating') : t('reportDetail.rateReport')}
                            </Text>
                            <TouchableOpacity onPress={handleOpenRatings}>
                                <Text style={styles.ratingLink}>{t('reportDetail.viewReviews') || 'View reviews'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.ratingRow}>
                            {[1, 2, 3, 4, 5].map((value) => (
                                <TouchableOpacity
                                    key={value}
                                    style={styles.ratingButton}
                                    onPress={() => handleRateReport(value)}
                                    disabled={isOwner || ratingLoading}
                                >
                                    <Icon
                                        name={value <= (userRating || 0) ? 'star' : 'star-outline'}
                                        size={22}
                                        color={value <= (userRating || 0) ? colors.warning : colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            ))}
                            {ratingLoading && (
                                <ActivityIndicator size="small" color={colors.primary} style={styles.ratingLoader} />
                            )}
                        </View>
                    </View>

                    {/* Action Icons Bar */}
                    <View style={styles.actionBar}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                            <Icon
                                name={liked ? "heart" : "heart-outline"}
                                size={24}
                                color={liked ? colors.secondary : colors.textSecondary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <Icon name="share-variant" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Icon name="link-variant" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Icon name="bookmark-outline" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>

                        {isOwner && (
                            <>
                                <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
                                    <Icon name="pencil-outline" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                                    <Icon name="delete-outline" size={24} color={colors.secondary} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('reportDetail.description')}</Text>
                        <Text style={styles.description}>{report.description}</Text>
                    </View>

                    {/* Location */}
                    {(report.address || report.location_address || report.city || report.country || report.latitude) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('reportDetail.location')}</Text>
                            <View style={styles.locationCard}>
                                <Icon name="map-marker" size={24} color={colors.primary} />
                                <View style={styles.locationInfo}>
                                    <Text style={styles.locationText}>
                                        {getDisplayLocation(report, t)}
                                    </Text>
                                    {report.city && (
                                        <Text style={styles.locationSubtext}>{report.city}, {report.country}</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Status & Priority */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('reportDetail.status')}</Text>
                        <View style={styles.tagsRow}>
                            <View style={[styles.tag, { backgroundColor: '#E0F2FE' }]}>
                                <Text style={[styles.tagText, { color: '#0369A1' }]}>
                                    {report.status || t('reportDetail.statusPending')}
                                </Text>
                            </View>
                            <View style={[styles.tag, { backgroundColor: '#FEF3C7' }]}>
                                <Text style={[styles.tagText, { color: '#B45309' }]}>
                                    {t('reportDetail.priorityValue', { priority: report.priority || t('reportDetail.priorityMedium') })}
                                </Text>
                            </View>
                            {report.is_emergency && (
                                <View style={[styles.tag, { backgroundColor: '#FEE2E2' }]}>
                                    <Icon name="alert" size={12} color="#DC2626" />
                                    <Text style={[styles.tagText, { color: '#DC2626', marginLeft: 4 }]}>
                                        {t('reportDetail.emergency')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Comments Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {t('reportDetail.comments')} ({comments.length})
                        </Text>

                        {/* Add Comment - Only show if comments are allowed */}
                        {report.allow_comments !== false ? (
                            <View style={styles.addCommentRow}>
                                <TextInput
                                    style={styles.commentInput}
                                    placeholder={t('reportDetail.addComment')}
                                    value={commentText}
                                    onChangeText={setCommentText}
                                    placeholderTextColor={colors.textSecondary}
                                    editable={!addingComment}
                                />
                                <TouchableOpacity
                                    style={[styles.sendButton, addingComment && styles.sendButtonDisabled]}
                                    onPress={handleAddComment}
                                    disabled={addingComment || !commentText.trim()}
                                >
                                    {addingComment ? (
                                        <ActivityIndicator size="small" color={colors.white} />
                                    ) : (
                                        <Icon name="send" size={20} color={colors.white} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.commentsDisabledContainer}>
                                <Icon name="comment-off-outline" size={24} color={colors.textSecondary} />
                                <Text style={styles.commentsDisabledText}>{t('reportDetail.commentsDisabled')}</Text>
                            </View>
                        )}

                        {/* Comments Loading */}
                        {commentsLoading && (
                            <View style={styles.commentsLoading}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={styles.loadingText}>{t('reportDetail.loadingComments')}</Text>
                            </View>
                        )}

                        {/* Comments List */}
                        {!commentsLoading && comments.map((comment) => (
                            <View key={comment.id} style={styles.commentItem}>
                                <View style={styles.commentAvatar}>
                                    <Icon name="account" size={20} color={colors.textSecondary} />
                                </View>
                                <View style={styles.commentContent}>
                                    <View style={styles.commentHeader}>
                                        <Text style={styles.commentUser}>{comment.user}</Text>
                                        <Text style={styles.commentTime}>{comment.time}</Text>
                                        {comment.userId === user?.id && (
                                            <TouchableOpacity
                                                style={styles.deleteCommentBtn}
                                                onPress={() => handleDeleteComment(comment.id)}
                                            >
                                                <Icon name="delete-outline" size={16} color={colors.error} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <Text style={styles.commentText}>{comment.text}</Text>
                                </View>
                            </View>
                        ))}

                        {/* No comments */}
                        {!commentsLoading && comments.length === 0 && (
                            <Text style={styles.noComments}>{t('reportDetail.noComments')}</Text>
                        )}
                    </View>
                </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ReportDetailScreen;
