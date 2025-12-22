import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Button from '../common/Button';
import { colors, spacing } from '../../theme';

const LocationPicker = ({ initialLocation, onLocationSelect, onCancel }) => {
    const [selectedLocation, setSelectedLocation] = useState(
        initialLocation || {
            latitude: 37.78825,
            longitude: -122.4324,
        }
    );

    const handleMapPress = (event) => {
        setSelectedLocation(event.nativeEvent.coordinate);
    };

    const handleConfirm = () => {
        onLocationSelect(selectedLocation);
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    ...selectedLocation,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}>
                {selectedLocation && (
                    <Marker coordinate={selectedLocation} />
                )}
            </MapView>

            <View style={styles.buttons}>
                <Button
                    title="Cancel"
                    variant="outline"
                    onPress={onCancel}
                    style={styles.button}
                />
                <Button
                    title="Confirm Location"
                    onPress={handleConfirm}
                    style={styles.button}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    buttons: {
        position: 'absolute',
        bottom: spacing.xl,
        left: spacing.md,
        right: spacing.md,
        flexDirection: 'row',
    },
    button: {
        flex: 1,
        marginHorizontal: spacing.xs,
    },
});

export default LocationPicker;
