import React, { createContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { colors as lightColors } from '../theme/colors';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const theme = {
        colors: lightColors, // For now, using light colors only
        isDarkMode,
    };

    const value = {
        theme,
        isDarkMode,
        toggleTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
