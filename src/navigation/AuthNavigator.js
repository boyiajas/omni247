import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import AnonymousLoginScreen from '../screens/auth/AnonymousLoginScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            // Check if onboarding was completed (persists after logout)
            const completed = await AsyncStorage.getItem('onboarding_completed');
            setShowOnboarding(completed !== 'true');
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            setShowOnboarding(true);
        } finally {
            setIsReady(true);
        }
    };

    if (!isReady) {
        return null; // Or a loading indicator
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#FFFFFF' },
            }}>
            {showOnboarding && (
                <>
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                </>
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="AnonymousLogin" component={AnonymousLoginScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;
