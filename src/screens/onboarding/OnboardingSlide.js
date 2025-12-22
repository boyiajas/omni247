import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const OnboardingSlide = ({ item }) => {
    return (
        <View style={styles.container}>
            <Text>{item.title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default OnboardingSlide;
