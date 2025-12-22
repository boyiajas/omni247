import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../../theme';
import { REPORT_CATEGORIES } from '../../utils/constants';

const CategoryChip = ({
    category,
    selected = false,
    onPress,
    style,
}) => {
    const categoryData = REPORT_CATEGORIES[category.toUpperCase()];

    if (!categoryData) return null;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.chip,
                { borderColor: categoryData.color },
                selected && { backgroundColor: categoryData.color },
                style,
            ]}
            activeOpacity={0.7}>
            <Icon
                name={categoryData.icon}
                size={18}
                color={selected ? colors.white : categoryData.color}
                style={styles.icon}
            />
            <Text
                style={[
                    styles.text,
                    { color: selected ? colors.white : categoryData.color },
                ]}>
                {categoryData.name}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        borderWidth: 2,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
    },
    icon: {
        marginRight: spacing.xs,
    },
    text: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        fontFamily: typography.families.semibold,
    },
});

export default CategoryChip;
