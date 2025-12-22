import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorageService from '../services/storage/AsyncStorageService';
import { authAPI } from '../services/api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthState();
    }, []);

    const fetchLatestProfile = async (fallbackUser = null) => {
        try {
            const response = await authAPI.getProfile();
            const latestUser = response.data;
            await AsyncStorageService.setItem('user', JSON.stringify(latestUser));
            setUser(latestUser);
            return latestUser;
        } catch (error) {
            if (fallbackUser) {
                setUser(fallbackUser);
            }
            console.error('Unable to refresh profile:', error.message || error);
            return fallbackUser;
        }
    };

    const checkAuthState = async () => {
        try {
            const storedToken = await AsyncStorageService.getItem('authToken');
            const storedUser = await AsyncStorageService.getItem('user');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;

            if (storedToken) {
                setToken(storedToken);
                if (parsedUser) {
                    setUser(parsedUser);
                }
                await fetchLatestProfile(parsedUser);
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (emailOrUser, passwordOrToken) => {
        try {
            let newToken, newUser;

            // Check if this is a direct login (with user object and token) or API login
            if (typeof emailOrUser === 'object' && emailOrUser !== null) {
                // Direct login with user object and token (for testing/dummy data)
                newUser = emailOrUser;
                newToken = passwordOrToken;
            } else {
                // API login with email and password
                const response = await authAPI.login(emailOrUser, passwordOrToken);
                newToken = response.data.token;
                newUser = response.data.user;
            }

            await AsyncStorageService.setItem('authToken', newToken);
            await AsyncStorageService.setItem('user', JSON.stringify(newUser));

            // Store onboarding status separately for persistence after logout
            if (newUser.has_completed_onboarding) {
                await AsyncStorageService.setItem('onboarding_completed', 'true');
            }

            setToken(newToken);
            await fetchLatestProfile(newUser);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { token: newToken, user: newUser } = response.data;

            await AsyncStorageService.setItem('authToken', newToken);
            await AsyncStorageService.setItem('user', JSON.stringify(newUser));

            // Store onboarding status separately for persistence after logout
            if (newUser.has_completed_onboarding) {
                await AsyncStorageService.setItem('onboarding_completed', 'true');
            }

            setToken(newToken);
            await fetchLatestProfile(newUser);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorageService.removeItem('authToken');
            await AsyncStorageService.removeItem('user');
            setToken(null);
            setUser(null);

            // Reset to Welcome screen (the first screen in auth flow)
            // Don't use navigation here - let AppNavigator handle it automatically
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const anonymousLogin = async () => {
        try {
            const response = await authAPI.anonymousLogin();
            const { token: newToken, user: newUser } = response.data;

            await AsyncStorageService.setItem('authToken', newToken);
            await AsyncStorageService.setItem('user', JSON.stringify(newUser));

            setToken(newToken);
            await fetchLatestProfile(newUser);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateUser = async (updates) => {
        const updatedUser = { ...user, ...updates };
        await AsyncStorageService.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const value = {
        user,
        token,
        loading: isLoading,
        login,
        register,
        logout,
        anonymousLogin,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the useAuth hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
