import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const useThemedStyles = (factory) => {
    const { theme } = useTheme();
    const colors = theme.colors;

    return useMemo(() => StyleSheet.create(factory(colors)), [colors, factory]);
};

export default useThemedStyles;
