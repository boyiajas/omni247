import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Share,
} from 'react-native';
import { reportsAPI } from '../../services/api/reports';
import { commentsAPI } from '../../services/api/comments';
import Loading from '../../components/common/Loading';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../theme';
import { formatRelativeTime } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useFocusEffect } from '@react-navigation/native';

// Placeholder image for reports without media
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

// Category colors
const categoryColors = {
    crime: '#DC2626',
    event: '#F59E0B',
    accident: '#EA580C',
    environment: '#10B981',
    politics: '#7C3AED',
    infrastructure: '#4F46E5',
    other: '#6B7280',
};

const ReportDetailScreen = ({ route, navigation }) => {
    const { user } = useAuth();
    const { refreshUnreadCount } = useNotifications();
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
            setError('No report ID provided');
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
            setError('Failed to load report');
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
                user: c.user?.name || 'Anonymous',
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
            Alert.alert('Error', 'Unable to submit rating.');
        } finally {
            setRatingLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            const title = report?.title || 'Report';
            const location = report?.address || report?.location_address || report?.city || 'Unknown location';
            const description = report?.description ? `\n\n${report.description}` : '';
            const message = `${title}\n${location}${description}`;

            await Share.share({
                title,
                message,
            });
        } catch (error) {
            Alert.alert('Error', 'Unable to open share options.');
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
                user: newComment.user?.name || user?.name || 'You',
                text: newComment.content,
                time: 'Just now',
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
                Alert.alert('Comments Disabled', 'The owner of this report has disabled comments.');
            } else {
                Alert.alert('Error', 'Failed to add comment');
            }
        } finally {
            setAddingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        Alert.alert(
            'Delete Comment',
            'Are you sure you want to delete this comment?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await commentsAPI.deleteComment(commentId);
                            setComments(comments.filter(c => c.id !== commentId));
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete comment');
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
            'Delete Report',
            'Are you sure you want to delete this report?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await reportsAPI.deleteReport(id);
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete report');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return <Loading message="Loading report..." />;
    }

    if (error || !report) {
        return (
            <View style={styles.emptyContainer}>
                <Icon name="alert-circle-outline" size={60} color={colors.neutralMedium} />
                <Text style={styles.emptyTitle}>Report Not Found</Text>
                <Text style={styles.emptyText}>{error || 'Unable to load this report.'}</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const categoryName = report.category?.name || 'Other';
    const categoryColor = categoryColors[categoryName.toLowerCase()] || categoryColors.other;

    // Get media URL and fix for Android emulator
    let mediaUrl = report.media?.[0]?.url || PLACEHOLDER_IMAGE;
    if (mediaUrl && mediaUrl !== PLACEHOLDER_IMAGE) {
        mediaUrl = mediaUrl
            .replace('http://127.0.0.1:8000', 'http://10.0.2.2:8000')
            .replace('http://localhost:8000', 'http://10.0.2.2:8000')
            .replace('http://localhost', 'http://10.0.2.2:8000');
        if (mediaUrl.startsWith('/storage/')) {
            mediaUrl = `http://10.0.2.2:8000${mediaUrl}`;
        } else if (!mediaUrl.startsWith('http')) {
            mediaUrl = `http://10.0.2.2:8000/storage/${mediaUrl}`;
        }
    }

    return (
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
                            <Text style={styles.ownerBadgeText}>Your Report</Text>
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
                                <Icon name="account" size={24} color={colors.neutralMedium} />
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>
                                    {report.user.name || 'Anonymous User'}
                                </Text>
                                <Text style={styles.userSubtext}>Reporter</Text>
                            </View>
                            {report.user.is_verified && (
                                <Icon name="check-decagram" size={20} color={colors.primary} />
                            )}
                        </View>
                    ) : (
                        <View style={styles.userSection}>
                            <View style={styles.userAvatar}>
                                <Icon name="incognito" size={24} color={colors.neutralMedium} />
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>Anonymous User</Text>
                                <Text style={styles.userSubtext}>Reporter</Text>
                            </View>
                        </View>
                    )}
                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Icon name="eye" size={18} color={colors.neutralMedium} />
                            <Text style={styles.statText}>{report.views_count || 0} views</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Icon name="star" size={18} color={colors.warning} />
                            <Text style={styles.statText}>{parseFloat(report.average_rating || 0).toFixed(1)} rating</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Icon name="comment-outline" size={18} color={colors.neutralMedium} />
                            <Text style={styles.statText}>{comments.length} comments</Text>
                        </View>
                    </View>

                    <View style={styles.ratingSection}>
                        <Text style={styles.ratingLabel}>
                            {isOwner ? 'Your report rating' : 'Rate this report'}
                        </Text>
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
                                        color={value <= (userRating || 0) ? colors.warning : colors.neutralMedium}
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
                                color={liked ? '#DC2626' : colors.neutralMedium}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <Icon name="share-variant" size={24} color={colors.neutralMedium} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Icon name="link-variant" size={24} color={colors.neutralMedium} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Icon name="bookmark-outline" size={24} color={colors.neutralMedium} />
                        </TouchableOpacity>

                        {isOwner && (
                            <>
                                <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
                                    <Icon name="pencil-outline" size={24} color={colors.neutralMedium} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                                    <Icon name="delete-outline" size={24} color={colors.secondary} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{report.description}</Text>
                    </View>

                    {/* Location */}
                    {(report.address || report.latitude) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Location</Text>
                            <View style={styles.locationCard}>
                                <Icon name="map-marker" size={24} color={colors.primary} />
                                <View style={styles.locationInfo}>
                                    <Text style={styles.locationText}>
                                        {report.address || `${report.latitude}, ${report.longitude}`}
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
                        <Text style={styles.sectionTitle}>Status</Text>
                        <View style={styles.tagsRow}>
                            <View style={[styles.tag, { backgroundColor: '#E0F2FE' }]}>
                                <Text style={[styles.tagText, { color: '#0369A1' }]}>
                                    {report.status || 'Pending'}
                                </Text>
                            </View>
                            <View style={[styles.tag, { backgroundColor: '#FEF3C7' }]}>
                                <Text style={[styles.tagText, { color: '#B45309' }]}>
                                    {report.priority || 'Medium'} Priority
                                </Text>
                            </View>
                            {report.is_emergency && (
                                <View style={[styles.tag, { backgroundColor: '#FEE2E2' }]}>
                                    <Icon name="alert" size={12} color="#DC2626" />
                                    <Text style={[styles.tagText, { color: '#DC2626', marginLeft: 4 }]}>
                                        Emergency
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Comments Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>

                        {/* Add Comment - Only show if comments are allowed */}
                        {report.allow_comments !== false ? (
                            <View style={styles.addCommentRow}>
                                <TextInput
                                    style={styles.commentInput}
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChangeText={setCommentText}
                                    placeholderTextColor={colors.neutralMedium}
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
                                <Icon name="comment-off-outline" size={24} color={colors.neutralMedium} />
                                <Text style={styles.commentsDisabledText}>Comments are disabled for this report</Text>
                            </View>
                        )}

                        {/* Comments Loading */}
                        {commentsLoading && (
                            <View style={styles.commentsLoading}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={styles.loadingText}>Loading comments...</Text>
                            </View>
                        )}

                        {/* Comments List */}
                        {!commentsLoading && comments.map((comment) => (
                            <View key={comment.id} style={styles.commentItem}>
                                <View style={styles.commentAvatar}>
                                    <Icon name="account" size={20} color={colors.neutralMedium} />
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
                            <Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        color: colors.white,
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
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    ownerBadgeText: {
        color: colors.white,
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
    content: {
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.neutralDark,
        marginBottom: 4,
    },
    time: {
        fontSize: 13,
        color: colors.neutralMedium,
        marginBottom: 16,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.neutralLight,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutralLight,
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
        color: colors.neutralDark,
    },
    userSubtext: {
        fontSize: 12,
        color: colors.neutralMedium,
    },
    statsRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: colors.neutralLight,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    statText: {
        fontSize: 13,
        color: colors.neutralMedium,
        marginLeft: 6,
    },
    ratingSection: {
        marginTop: 12,
        marginBottom: 6,
    },
    ratingLabel: {
        fontSize: 12,
        color: colors.neutralMedium,
        marginBottom: 6,
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
        borderColor: colors.neutralLight,
    },
    actionButton: {
        marginRight: 20,
    },
    section: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: colors.neutralLight,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutralDark,
        marginBottom: 10,
    },
    description: {
        fontSize: 15,
        color: colors.neutralDark,
        lineHeight: 24,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.neutralLight,
        borderRadius: 10,
    },
    locationInfo: {
        flex: 1,
        marginLeft: 12,
    },
    locationText: {
        fontSize: 14,
        color: colors.neutralDark,
    },
    locationSubtext: {
        fontSize: 12,
        color: colors.neutralMedium,
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
        backgroundColor: colors.neutralLight,
        borderRadius: 22,
        paddingHorizontal: 16,
        fontSize: 14,
        color: colors.neutralDark,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
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
        backgroundColor: colors.neutralLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    commentContent: {
        flex: 1,
        backgroundColor: colors.neutralLight,
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
        color: colors.neutralDark,
    },
    commentTime: {
        fontSize: 11,
        color: colors.neutralMedium,
    },
    commentText: {
        fontSize: 14,
        color: colors.neutralDark,
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
        color: colors.neutralMedium,
        fontSize: 14,
    },
    deleteCommentBtn: {
        marginLeft: 'auto',
        padding: 4,
    },
    noComments: {
        textAlign: 'center',
        color: colors.neutralMedium,
        fontSize: 14,
        paddingVertical: 20,
        fontStyle: 'italic',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: colors.background,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutralDark,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: colors.neutralMedium,
        textAlign: 'center',
        marginBottom: 20,
    },
    commentsDisabledContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        backgroundColor: colors.neutralLight,
        borderRadius: 12,
        marginBottom: spacing.md,
    },
    commentsDisabledText: {
        fontSize: typography.sizes.sm,
        color: colors.neutralMedium,
        marginLeft: spacing.sm,
    },
});

export default ReportDetailScreen;
