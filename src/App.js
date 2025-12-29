import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LocationProvider } from './contexts/LocationContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';

const App = () => {
    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <AuthProvider>
                    <ThemeProvider>
                        <LanguageProvider>
                            <LocationProvider>
                                <NotificationProvider>
                                    <AppNavigator />
                                </NotificationProvider>
                            </LocationProvider>
                        </LanguageProvider>
                    </ThemeProvider>
                </AuthProvider>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
};

export default App;
