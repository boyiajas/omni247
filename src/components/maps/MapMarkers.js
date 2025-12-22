import React from 'react';
import { Marker } from 'react-native-maps';
import { REPORT_CATEGORIES } from '../../utils/constants';

const MapMarkers = ({ reports, onMarkerPress }) => {
    const getMarkerColor = (category) => {
        const categoryData = REPORT_CATEGORIES[category.toUpperCase()];
        return categoryData ? categoryData.color : '#2563EB';
    };

    return (
        <>
            {reports.map((report) => (
                <Marker
                    key={report.id}
                    coordinate={{
                        latitude: report.latitude,
                        longitude: report.longitude,
                    }}
                    pinColor={getMarkerColor(report.category)}
                    onPress={() => onMarkerPress(report)}
                    title={report.title}
                    description={report.category}
                />
            ))}
        </>
    );
};

export default MapMarkers;
