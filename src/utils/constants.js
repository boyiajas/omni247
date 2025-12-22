// Utility constants for the G-iReport application

export const REPORT_CATEGORIES = {
    CRIME: {
        id: 'crime',
        name: 'Crime',
        color: '#DC2626',
        icon: 'alert-circle',
    },
    ENVIRONMENT: {
        id: 'environment',
        name: 'Environment',
        color: '#059669',
        icon: 'leaf',
    },
    EVENTS: {
        id: 'events',
        name: 'Events',
        color: '#2563EB',
        icon: 'calendar',
    },
    DISASTERS: {
        id: 'disasters',
        name: 'Disasters',
        color: '#F59E0B',
        icon: 'warning',
    },
    POLITICS: {
        id: 'politics',
        name: 'Politics',
        color: '#8B5CF6',
        icon: 'people',
    },
};

export const REPORT_STATUS = {
    PENDING: 'pending',
    VERIFYING: 'verifying',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
};

export const PRIVACY_MODES = {
    PUBLIC: 'public',
    ANONYMOUS: 'anonymous',
    PRIVATE: 'private',
};

export const MEDIA_TYPES = {
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
};

export const MAX_FILE_SIZES = {
    IMAGE: 10 * 1024 * 1024, // 10MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    AUDIO: 20 * 1024 * 1024, // 20MB
};

export const ACHIEVEMENT_TYPES = {
    FIRST_REPORT: 'first_report',
    VERIFIED_REPORTER: 'verified_reporter',
    ACTIVE_CONTRIBUTOR: 'active_contributor',
    TOP_REPORTER: 'top_reporter',
};

export const USER_ROLES = {
    CITIZEN: 'citizen',
    VERIFIED: 'verified',
    MODERATOR: 'moderator',
    AGENCY: 'agency',
    NEWSROOM: 'newsroom',
    ADMIN: 'admin',
};

export const NOTIFICATION_TYPES = {
    NEW_REPORT: 'new_report',
    REPORT_VERIFIED: 'report_verified',
    NEARBY_INCIDENT: 'nearby_incident',
    ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
    AGENCY_RESPONSE: 'agency_response',
};

export const MAP_ZOOM_LEVELS = {
    CITY: 12,
    NEIGHBORHOOD: 15,
    STREET: 17,
};

export const NEARBY_RADIUS_METERS = 5000; // 5km

export const API_TIMEOUT = 30000; // 30 seconds

export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
