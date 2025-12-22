import React from 'react';
import {
    Modal as RNModal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, shadows } from '../../theme';

const { width } = Dimensions.get('window');

const Modal = ({
    visible,
    onClose,
    title,
    children,
    showCloseButton = true,
    animationType = 'slide',
    transparent = true,
    fullScreen = false,
}) => {
    return (
        <RNModal
            visible={visible}
            animationType={animationType}
            transparent={transparent}
            onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.modal, fullScreen && styles.modalFullScreen]}>
                    {(title || showCloseButton) && (
                        <View style={styles.header}>
                            {title && <Text style={styles.title}>{title}</Text>}

                            {showCloseButton && (
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Icon name="close" size={28} color={colors.textPrimary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <View style={styles.content}>{children}</View>
                </View>
            </View>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: colors.white,
        borderRadius: 16,
        width: width * 0.9,
        maxHeight: '80%',
        ...shadows.large,
    },
    modalFullScreen: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
        maxHeight: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        fontFamily: typography.families.bold,
        flex: 1,
    },
    closeButton: {
        padding: spacing.xs,
    },
    content: {
        padding: spacing.md,
    },
});

export default Modal;
