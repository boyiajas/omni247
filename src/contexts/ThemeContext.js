import React, { createContext, useEffect, useMemo, useState } from 'react';
import { colors as lightColors } from '../theme/colors';
import AsyncStorageService from '../services/storage/AsyncStorageService';
import { authAPI } from '../services/api/auth';
import { useAuth } from './AuthContext';

export const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'theme';

const themes = {
    light: lightColors,
    dark: {
        ...lightColors,
        primary: '#60A5FA',
        primaryDark: '#1D4ED8',
        secondary: '#F87171',
        accent: '#34D399',
        neutralDark: '#E5E7EB',
        neutralMedium: '#9CA3AF',
        neutralLight: '#1F2937',
        background: '#0B0F1A',
        white: '#111827',
        black: '#F9FAFB',
        border: '#1F2937',
        textPrimary: '#F9FAFB',
        textSecondary: '#9CA3AF',
    },
    pink: {
        ...lightColors,
        primary: '#EC4899',
        primaryDark: '#BE185D',
        secondary: '#F97316',
        accent: '#10B981',
        background: '#FFF1F2',
        neutralLight: '#FFE4E6',
        border: '#FBCFE8',
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
    },
    grey: {
        ...lightColors,
        primary: '#6B7280',
        primaryDark: '#4B5563',
        secondary: '#9CA3AF',
        accent: '#10B981',
        background: '#F3F4F6',
        neutralLight: '#E5E7EB',
        border: '#D1D5DB',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
    },
    gold: {
        ...lightColors,
        primary: '#D4AF37',
        primaryDark: '#B88A14',
        secondary: '#B45309',
        accent: '#059669',
        background: '#FFF9E6',
        neutralLight: '#FEF3C7',
        border: '#FDE68A',
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
    },
    emerald: {
        ...lightColors,
        primary: '#10B981',
        primaryDark: '#047857',
        secondary: '#14B8A6',
        accent: '#F59E0B',
        background: '#ECFDF5',
        neutralLight: '#D1FAE5',
        border: '#A7F3D0',
        textPrimary: '#064E3B',
        textSecondary: '#065F46',
    },
    ocean: {
        ...lightColors,
        primary: '#0EA5E9',
        primaryDark: '#0369A1',
        secondary: '#38BDF8',
        accent: '#14B8A6',
        background: '#E0F2FE',
        neutralLight: '#BAE6FD',
        border: '#7DD3FC',
        textPrimary: '#0F172A',
        textSecondary: '#334155',
    },
    violet: {
        ...lightColors,
        primary: '#8B5CF6',
        primaryDark: '#6D28D9',
        secondary: '#EC4899',
        accent: '#22C55E',
        background: '#F5F3FF',
        neutralLight: '#EDE9FE',
        border: '#DDD6FE',
        textPrimary: '#312E81',
        textSecondary: '#4C1D95',
    },
    midnight: {
        ...lightColors,
        primary: '#38BDF8',
        primaryDark: '#0EA5E9',
        secondary: '#A78BFA',
        accent: '#22C55E',
        neutralDark: '#E5E7EB',
        neutralMedium: '#9CA3AF',
        neutralLight: '#0F172A',
        background: '#0B1120',
        white: '#0F172A',
        black: '#F8FAFC',
        border: '#1E293B',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
    },
    charcoal: {
        ...lightColors,
        primary: '#F97316',
        primaryDark: '#EA580C',
        secondary: '#F59E0B',
        accent: '#10B981',
        neutralDark: '#E5E7EB',
        neutralMedium: '#9CA3AF',
        neutralLight: '#111827',
        background: '#0F172A',
        white: '#111827',
        black: '#F9FAFB',
        border: '#1F2937',
        textPrimary: '#F9FAFB',
        textSecondary: '#9CA3AF',
    },
    obsidian: {
        ...lightColors,
        primary: '#34D399',
        primaryDark: '#10B981',
        secondary: '#60A5FA',
        accent: '#A78BFA',
        neutralDark: '#E5E7EB',
        neutralMedium: '#9CA3AF',
        neutralLight: '#0B0F0F',
        background: '#050708',
        white: '#0B0F0F',
        black: '#F9FAFB',
        border: '#111827',
        textPrimary: '#E5E7EB',
        textSecondary: '#9CA3AF',
    },
    slate: {
        ...lightColors,
        primary: '#94A3B8',
        primaryDark: '#64748B',
        secondary: '#38BDF8',
        accent: '#22C55E',
        neutralDark: '#E5E7EB',
        neutralMedium: '#9CA3AF',
        neutralLight: '#1E293B',
        background: '#0F172A',
        white: '#1E293B',
        black: '#F8FAFC',
        border: '#334155',
        textPrimary: '#F8FAFC',
        textSecondary: '#CBD5F5',
    },
    indigoNight: {
        ...lightColors,
        primary: '#818CF8',
        primaryDark: '#4F46E5',
        secondary: '#22D3EE',
        accent: '#F472B6',
        neutralDark: '#E5E7EB',
        neutralMedium: '#9CA3AF',
        neutralLight: '#111827',
        background: '#0A0F2C',
        white: '#111827',
        black: '#F9FAFB',
        border: '#1E1B4B',
        textPrimary: '#EEF2FF',
        textSecondary: '#C7D2FE',
    },
    amoled: {
        ...lightColors,
        primary: '#22C55E',
        primaryDark: '#15803D',
        secondary: '#38BDF8',
        accent: '#F59E0B',
        neutralDark: '#E5E7EB',
        neutralMedium: '#9CA3AF',
        neutralLight: '#000000',
        background: '#000000',
        white: '#000000',
        black: '#FFFFFF',
        border: '#111827',
        textPrimary: '#F9FAFB',
        textSecondary: '#9CA3AF',
    },
};

const normalizeThemeKey = (key) => {
    if (!key) {
        return 'light';
    }
    return Object.prototype.hasOwnProperty.call(themes, key) ? key : 'light';
};

export const ThemeProvider = ({ children }) => {
    const { user, updateUser } = useAuth();
    const [themeKey, setThemeKey] = useState('light');

    useEffect(() => {
        const loadTheme = async () => {
            try {
                if (user?.theme) {
                    setThemeKey(normalizeThemeKey(user.theme));
                    return;
                }
                const stored = await AsyncStorageService.getItem(THEME_STORAGE_KEY);
                if (stored) {
                    setThemeKey(normalizeThemeKey(stored));
                    return;
                }
                if (user) {
                    const response = await authAPI.getThemeSettings();
                    const apiTheme = response?.data?.theme;
                    if (apiTheme) {
                        setThemeKey(normalizeThemeKey(apiTheme));
                    }
                    return;
                }
                setThemeKey('light');
            } catch (error) {
                // Keep default on failure.
            }
        };

        loadTheme();
    }, [user]);

    useEffect(() => {
        if (user?.theme) {
            setThemeKey(normalizeThemeKey(user.theme));
        }
    }, [user?.theme]);

    const setTheme = async (nextTheme) => {
        const resolved = normalizeThemeKey(nextTheme);
        setThemeKey(resolved);
        await AsyncStorageService.setItem(THEME_STORAGE_KEY, resolved);
        if (user) {
            updateUser({ theme: resolved });
            try {
                await authAPI.updateThemeSettings({ theme: resolved });
            } catch (error) {
                // Keep local selection even if API fails.
            }
        }
    };

    const theme = useMemo(() => {
        return {
            key: themeKey,
            colors: themes[themeKey] || themes.light,
        };
    }, [themeKey]);

    const value = {
        theme,
        themeKey,
        setTheme,
        themes,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
