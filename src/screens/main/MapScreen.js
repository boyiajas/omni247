import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, typography, categoryColors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useCategories from '../../hooks/useCategories';
import { useNotifications } from '../../hooks/useNotifications';

const { width, height } = Dimensions.get('window');

// Mock data for reports
const mockReports = [
  {
    id: '1',
    title: 'Armed Robbery',
    category: 'crime',
    latitude: 40.785091,
    longitude: -73.968285,
    rating: 4.8,
    reportsCount: 15,
    timestamp: '5 min ago',
  },
  {
    id: '2',
    title: 'Community Cleanup',
    category: 'environment',
    latitude: 40.7769,
    longitude: -73.980,
    rating: 4.5,
    reportsCount: 9,
    timestamp: '1 hour ago',
  },
  {
    id: '3',
    title: 'Political Rally',
    category: 'politics',
    latitude: 40.759,
    longitude: -73.9845,
    rating: 4.2,
    reportsCount: 3,
    timestamp: '2 hours ago',
  },
  {
    id: '4',
    title: 'Car Accident',
    category: 'accident',
    latitude: 40.7527,
    longitude: -73.9772,
    rating: 4.6,
    reportsCount: 7,
    timestamp: '30 min ago',
  },
];

const initialRegion = {
  latitude: 40.785091,
  longitude: -73.968285,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userLocation, setUserLocation] = useState({
    latitude: 40.785091,
    longitude: -73.968285,
  });
  const [legendExpanded, setLegendExpanded] = useState(true);
  const { categories: availableCategories } = useCategories();
  const { unreadCount, realtimeStatus } = useNotifications();
  const isLive = realtimeStatus === 'subscribed';

  const filteredReports = selectedCategory
    ? mockReports.filter(report => report.category === selectedCategory)
    : mockReports;

  const getCategoryIcon = (category) => {
    const categoryMap = {
      crime: 'shield-alert',
      event: 'party-popper',
      accident: 'car-brake-alert',
      environment: 'leaf',
      politics: 'account-tie',
      infrastructure: 'road',
      other: 'alert-circle',
    };
    return categoryMap[category] || 'alert-circle';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Global Eye</Text>
        <View style={styles.notificationWrap}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="bell-outline" size={24} color={colors.neutralDark} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.liveRow}>
            <View style={[styles.liveDot, isLive ? styles.liveDotOn : styles.liveDotOff]} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {filteredReports.map((report) => (
            <Marker
              key={report.id}
              coordinate={{
                latitude: report.latitude,
                longitude: report.longitude,
              }}
              onPress={() => navigation.navigate('ReportDetail', { report })}
            >
              <View style={styles.markerContainer}>
                <View
                  style={[
                    styles.marker,
                    { backgroundColor: categoryColors[report.category] || categoryColors.other },
                  ]}>
                  <Icon
                    name={getCategoryIcon(report.category)}
                    size={20}
                    color={colors.white}
                  />
                </View>
                <View style={styles.markerBadge}>
                  <Text style={styles.markerBadgeText}>{report.reportsCount}</Text>
                </View>
              </View>
            </Marker>
          ))}
        </MapView>

        <View style={styles.locationCard}>
          <Icon name="map-marker" size={20} color={colors.primary} />
          <Text style={styles.locationText}>5th Ave, New York</Text>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === null && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(null)}>
            <Icon
              name="earth"
              size={20}
              color={selectedCategory === null ? colors.white : colors.neutralMedium}
            />
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === null && styles.categoryButtonTextActive,
              ]}>
              All
            </Text>
          </TouchableOpacity>

          {availableCategories.map((category) => (
            <TouchableOpacity
              key={category.slug || category.backendId}
              style={[
                styles.categoryButton,
                selectedCategory === category.slug && styles.categoryButtonActive,
                selectedCategory === category.slug && { backgroundColor: category.color },
              ]}
              onPress={() => setSelectedCategory(category.slug)}>
              <Icon
                name={category.icon}
                size={20}
                color={selectedCategory === category.slug ? colors.white : colors.neutralMedium}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.slug && styles.categoryButtonTextActive,
                ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => navigation.navigate('ReportFlow')}>
        <Icon name="plus" size={24} color={colors.white} />
        <Text style={styles.reportButtonText}>Report Incident</Text>
      </TouchableOpacity>

      {/* Collapsible Legend */}
      {legendExpanded ? (
        <View style={styles.legend}>
          <View style={styles.legendHeader}>
            <Text style={styles.legendTitle}>Map Legend:</Text>
            <TouchableOpacity onPress={() => setLegendExpanded(false)}>
              <Icon name="close" size={20} color={colors.neutralDark} />
            </TouchableOpacity>
          </View>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: categoryColors.crime }]} />
              <Text style={styles.legendText}>Crime/Emergency</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: categoryColors.event }]} />
              <Text style={styles.legendText}>Celebrations/Events</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: categoryColors.environment }]} />
              <Text style={styles.legendText}>Environment</Text>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.legendMinimized}
          onPress={() => setLegendExpanded(true)}
        >
          <Icon name="map-legend" size={22} color={colors.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.neutralDark,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationWrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.secondary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    ...typography.small,
    color: colors.white,
    fontSize: 10,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  liveDotOn: {
    backgroundColor: '#16A34A',
  },
  liveDotOff: {
    backgroundColor: '#DC2626',
  },
  liveText: {
    fontSize: 10,
    color: colors.neutralMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationCard: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationText: {
    ...typography.caption,
    color: colors.neutralDark,
    marginLeft: 5,
  },
  categoriesContainer: {
    paddingVertical: 15,
    backgroundColor: colors.white,
  },
  categoriesScroll: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralLight,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    ...typography.caption,
    color: colors.neutralMedium,
    marginLeft: 5,
  },
  categoryButtonTextActive: {
    color: colors.white,
  },
  markerContainer: {
    position: 'relative',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  markerBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.white,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutralLight,
  },
  markerBadgeText: {
    ...typography.small,
    color: colors.neutralDark,
    fontSize: 10,
    fontWeight: 'bold',
  },
  reportButton: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  reportButtonText: {
    ...typography.body,
    color: colors.white,
    marginLeft: 8,
    fontWeight: '600',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 15,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    ...typography.caption,
    color: colors.neutralDark,
    fontWeight: '600',
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    ...typography.small,
    color: colors.neutralMedium,
  },
  legendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendMinimized: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
