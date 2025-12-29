import React, { useMemo, useRef, useEffect } from 'react';
import { Animated, StyleSheet, Modal, TouchableWithoutFeedback, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const BottomSheet = ({
    visible,
    onClose,
    children,
    height = 400,
}) => {
    const slideAnim = useRef(new Animated.Value(height)).current;
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = useMemo(() => StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        bottomSheet: {
            backgroundColor: colors.white,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 16,
            paddingBottom: 20,
        },
        handle: {
            width: 40,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginVertical: 12,
        },
    }), [colors]);

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, height]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.bottomSheet,
                                {
                                    height,
                                    transform: [{ translateY: slideAnim }],
                                },
                            ]}>
                            <View style={styles.handle} />
                            {children}
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default BottomSheet;
