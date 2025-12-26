import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, typography, categoryColors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import { LocationContext } from '../../contexts/LocationContext';
import categoriesAPI from '../../services/api/categories';
import { reportsAPI } from '../../services/api/reports';
import GeocodingService from '../../services/location/GeocodingService';

const { width, height } = Dimensions.get('window');

const FALLBACK_CATEGORIES = [
  { backendId: 1, slug: 'crime', label: 'Crime & Emergency', icon: 'shield-alert', color: categoryColors.crime },
  { backendId: 2, slug: 'accident', label: 'Accidents', icon: 'car-brake-alert', color: categoryColors.accident },
  { backendId: 3, slug: 'event', label: 'Events & Celebrations', icon: 'party-popper', color: categoryColors.event },
  { backendId: 4, slug: 'environment', label: 'Environment', icon: 'leaf', color: categoryColors.environment },
  { backendId: 5, slug: 'politics', label: 'Politics', icon: 'account-tie', color: categoryColors.politics },
  { backendId: 6, slug: 'infrastructure', label: 'Infrastructure', icon: 'road', color: categoryColors.infrastructure },
  { backendId: 7, slug: 'other', label: 'Other', icon: 'alert-circle', color: categoryColors.other },
];

const normalizeCategory = (category) => {
  if (!category) return null;
  const slug = category.slug || category.label || String(category.backendId || category.id);
  return {
    backendId: category.id ?? category.backendId ?? slug,
    id: slug,
    slug,
    label: category.name || category.label,
    name: category.name || category.label,
    icon: category.icon || 'alert-circle',
    color: category.color || categoryColors[slug] || colors.primary,
    description: category.description,
    isEmergency: Boolean(category.is_emergency || category.isEmergency),
    isActive: category.is_active !== false && category.isActive !== false,
    order: category.order ?? 0,
    original: category,
  };
};

const initialRegion = {
  latitude: 40.785091,
  longitude: -73.968285,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

class MapScreenContent extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.addressRequestId = 0;
    this.slideAnim = new Animated.Value(0);
    this.state = {
      hasMapError: false,
      selectedCategory: null,
      userLocation: {
        latitude: 40.785091,
        longitude: -73.968285,
      },
      mapDelta: {
        latitudeDelta: initialRegion.latitudeDelta,
        longitudeDelta: initialRegion.longitudeDelta,
      },
      currentAddress: '',
      hasShownLocationError: false,
      legendExpanded: true,
      categories: FALLBACK_CATEGORIES.map(normalizeCategory).filter(Boolean),
      reports: [],
      isLoadingReports: false,
      viewMode: 'nearby',
      showViewMenu: false,
    };
  }

  static getDerivedStateFromError() {
    return { hasMapError: true };
  }

  componentDidCatch(error) {
    // Render fallback UI instead of crashing the app.
    console.error('MapScreen error:', error);
  }

  componentDidMount() {
    this.loadCategories();
    this.syncLocationFromProps(this.props);
    this.requestLocationAccess();
    this.loadReports();

    if (this.props.navigation?.addListener) {
      this.focusUnsubscribe = this.props.navigation.addListener('focus', () => {
        this.requestLocationAccess();
        this.loadReports();
      });
    }
  }

  componentWillUnmount() {
    if (this.focusUnsubscribe) {
      this.focusUnsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    const prevLocation = prevProps.locationContext?.location;
    const nextLocation = this.props.locationContext?.location;
    if (prevLocation !== nextLocation) {
      this.syncLocationFromProps(this.props);
      if (this.state.viewMode === 'nearby') {
        this.loadReports();
      }
    }

    const prevPermission = prevProps.locationContext?.hasPermission;
    const nextPermission = this.props.locationContext?.hasPermission;
    if (!prevPermission && nextPermission) {
      this.refreshCurrentLocation();
    }

    const prevError = prevProps.locationContext?.error;
    const nextError = this.props.locationContext?.error;
    if (nextError && nextError !== prevError && !this.state.hasShownLocationError) {
      Alert.alert('Location', nextError);
      this.setState({ hasShownLocationError: true });
    }
  }

  loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      const list = Array.isArray(response.data?.data) ? response.data.data : response.data;
      if (Array.isArray(list) && list.length) {
        const normalized = list
          .map(normalizeCategory)
          .filter(Boolean)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (normalized.length) {
          this.setState({ categories: normalized });
        }
      }
    } catch (error) {
      // Keep fallback categories on error.
    }
  };

  loadReports = async () => {
    if (this.state.isLoadingReports) {
      return;
    }
    try {
      this.setState({ isLoadingReports: true });
      const params = this.buildReportsParams();
      const response = await reportsAPI.getReports(params);
      const list = Array.isArray(response.data?.data) ? response.data.data : response.data;
      let reports = Array.isArray(list) ? list : [];

      if (!reports.length && params.view) {
        const fallbackResponse = await reportsAPI.getReports({ status: 'verified' });
        const fallbackList = Array.isArray(fallbackResponse.data?.data)
          ? fallbackResponse.data.data
          : fallbackResponse.data;
        reports = Array.isArray(fallbackList) ? fallbackList : [];
      }
      console.log('[MapScreen] Loaded reports:', reports.length, 'reports');
      this.setState({ reports });
    } catch (error) {
      // Keep current reports on error.
    } finally {
      this.setState({ isLoadingReports: false });
    }
  };

  getReportCategorySlug = (report) => {
    const slug = report?.category?.slug || report?.category?.name?.toLowerCase();
    if (slug) return slug;
    const category = this.state.categories.find(
      (item) => String(item.backendId) === String(report?.category_id)
    );
    return category?.slug || 'other';
  };

  getReportList = () => {
    return (this.state.reports || []).map((report) => ({
      ...report,
      categorySlug: this.getReportCategorySlug(report),
    })).filter((report) =>
      Number.isFinite(Number(report.latitude)) && Number.isFinite(Number(report.longitude))
    );
  };

  getLocationKey = (report) => {
    const lat = Number(report.latitude);
    const lng = Number(report.longitude);
    return `${lat.toFixed(5)},${lng.toFixed(5)}`;
  };

  getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2))
      * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  toggleViewMenu = () => {
    this.setState((prev) => {
      const nextShow = !prev.showViewMenu;
      if (nextShow) {
        this.openDrawer();
      } else {
        this.closeDrawer();
      }
      return { showViewMenu: nextShow };
    });
  };

  openDrawer = () => {
    Animated.spring(this.slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  closeDrawer = () => {
    Animated.timing(this.slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  setViewMode = (viewMode) => {
    this.closeDrawer();
    setTimeout(() => {
      this.setState({ viewMode, showViewMenu: false }, () => {
        this.loadReports();
      });
    }, 250);
  };

  buildReportsParams = () => {
    const { authContext, locationContext } = this.props;
    const user = authContext?.user;
    const hasPermission = Boolean(locationContext?.hasPermission);
    const params = { status: 'verified' };

    if (this.state.viewMode === 'global') {
      return { ...params, view: 'global' };
    }

    if (this.state.viewMode === 'country') {
      const country = user?.last_known_country;
      return country ? { ...params, view: 'country', country } : params;
    }

    if (this.state.viewMode === 'nearby') {
      const latitude = this.state.userLocation?.latitude;
      const longitude = this.state.userLocation?.longitude;
      if (hasPermission && Number.isFinite(latitude) && Number.isFinite(longitude)) {
        return {
          ...params,
          view: 'nearby',
          latitude,
          longitude,
          radius: 25,
        };
      }
    }

    return params;
  };

  updateZoom = (factor) => {
    this.setState((prev) => {
      const nextDelta = {
        latitudeDelta: Math.min(Math.max(prev.mapDelta.latitudeDelta * factor, 0.005), 2),
        longitudeDelta: Math.min(Math.max(prev.mapDelta.longitudeDelta * factor, 0.005), 2),
      };

      if (this.mapRef.current) {
        this.mapRef.current.animateToRegion(
          {
            ...prev.userLocation,
            latitudeDelta: nextDelta.latitudeDelta,
            longitudeDelta: nextDelta.longitudeDelta,
          },
          200
        );
      }

      return { mapDelta: nextDelta };
    });
  };

  handleZoomIn = () => {
    this.updateZoom(0.8);
  };

  handleZoomOut = () => {
    this.updateZoom(1.25);
  };

  syncLocationFromProps = (props) => {
    const location = props.locationContext?.location;
    if (!location) {
      return;
    }

    const nextLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
    };

    this.setState({
      userLocation: nextLocation,
      currentAddress: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
    });
    this.resolveAddress(nextLocation);

    if (this.mapRef.current) {
      this.mapRef.current.animateToRegion(
        {
          ...nextLocation,
          latitudeDelta: this.state.mapDelta.latitudeDelta,
          longitudeDelta: this.state.mapDelta.longitudeDelta,
        },
        600
      );
    }
  };

  resolveAddress = async (location) => {
    const requestId = ++this.addressRequestId;
    try {
      const result = await GeocodingService.reverseGeocode(location.latitude, location.longitude);
      if (this.addressRequestId !== requestId) {
        return;
      }
      const formatted = result?.formattedAddress || GeocodingService.formatAddress(result || {});
      if (formatted) {
        this.setState({ currentAddress: formatted });
      }
    } catch (error) {
      // Keep the coordinate fallback if reverse geocoding fails.
    }
  };

  refreshCurrentLocation = async () => {
    const { locationContext } = this.props;
    if (!locationContext?.getCurrentLocation) {
      return;
    }
    try {
      await locationContext.getCurrentLocation();
    } catch (error) {
      console.warn('MapScreen location refresh error:', error);
    }
  };

  requestLocationAccess = async () => {
    const { locationContext } = this.props;
    if (!locationContext?.requestLocationPermission) {
      return;
    }
    try {
      if (locationContext.hasPermission) {
        await this.refreshCurrentLocation();
        return;
      }
      const granted = await locationContext.requestLocationPermission();
      if (granted) {
        await this.refreshCurrentLocation();
      }
    } catch (error) {
      console.warn('MapScreen location permission error:', error);
    }
  };

  handleSelectCategory = (slug) => {
    this.setState({ selectedCategory: slug });
  };

  toggleLegend = (value) => {
    this.setState({ legendExpanded: value });
  };

  getCategoryIcon = (category) => {
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

  render() {
    const { navigation, authContext, notificationContext, locationContext } = this.props;
    const user = authContext?.user;
    const unreadCount = notificationContext?.unreadCount ?? 0;
    const realtimeStatus = notificationContext?.realtimeStatus;
    const isLive = realtimeStatus === 'subscribed';
    const hasPermission = Boolean(locationContext?.hasPermission);

    const fallbackLabel =
      user?.location_summary
      || [user?.last_known_city, user?.last_known_country].filter(Boolean).join(', ');
    let locationLabel = this.state.currentAddress || fallbackLabel || 'Unknown location';

    if (this.state.viewMode === 'global') {
      locationLabel = 'Global trends';
    } else if (this.state.viewMode === 'country') {
      locationLabel = user?.last_known_country
        ? `Country: ${user.last_known_country}`
        : 'My country trends';
    } else if (this.state.viewMode === 'nearby') {
      locationLabel = this.state.currentAddress || fallbackLabel || 'Current location';
    }

    const reportList = this.getReportList();
    console.log('[MapScreen] Total reportList:', reportList.length);

    const locationCounts = reportList.reduce((acc, report) => {
      const key = this.getLocationKey(report);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const selectedCountry = (user?.last_known_country || '').toString().toLowerCase();
    const nearbyReports = hasPermission
      ? reportList.filter((report) => {
        const lat = Number(report.latitude);
        const lng = Number(report.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return false;
        }
        return this.getDistanceKm(
          this.state.userLocation.latitude,
          this.state.userLocation.longitude,
          lat,
          lng
        ) <= 25;
      })
      : reportList;

    console.log('[MapScreen] nearbyReports:', nearbyReports.length);

    const modeReports = this.state.viewMode === 'global'
      ? reportList.filter((report) => report.is_trending)
      : this.state.viewMode === 'country'
        ? reportList.filter((report) =>
          (report.country || '').toString().toLowerCase() === selectedCountry
        )
        : nearbyReports;

    console.log('[MapScreen] modeReports for', this.state.viewMode, ':', modeReports.length);

    const baseReports = modeReports.length > 0 ? modeReports : reportList;
    const filteredReports = this.state.selectedCategory
      ? baseReports.filter((report) => report.categorySlug === this.state.selectedCategory)
      : baseReports;

    console.log('[MapScreen] filteredReports to render:', filteredReports.length);

    if (this.state.hasMapError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.errorCard}>
            <Icon name="map-marker-off" size={28} color={colors.primary} />
            <Text style={styles.errorTitle}>Map temporarily unavailable</Text>
            <Text style={styles.errorText}>
              We couldn't load the map right now. You can still report incidents and browse alerts.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => this.setState({ hasMapError: false })}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

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
            ref={this.mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              ...this.state.userLocation,
              latitudeDelta: this.state.mapDelta.latitudeDelta,
              longitudeDelta: this.state.mapDelta.longitudeDelta,
            }}
            showsUserLocation={hasPermission}
            showsMyLocationButton={true}
          >
            {filteredReports.map((report) => (
              <Marker
                key={report.id}
                coordinate={{
                  latitude: Number(report.latitude),
                  longitude: Number(report.longitude),
                }}
                onPress={() => navigation.navigate('ReportDetail', { report })}
              >
                <View style={styles.markerContainer}>
                  <View
                    style={[
                      styles.marker,
                      { backgroundColor: categoryColors[report.categorySlug] || categoryColors.other },
                    ]}>
                    <Icon name={this.getCategoryIcon(report.categorySlug)} size={24} color={colors.white} />
                  </View>
                  <View style={styles.markerBadge}>
                    <Text style={styles.markerBadgeText}>
                      {locationCounts[this.getLocationKey(report)] || 1}
                    </Text>
                  </View>
                </View>
              </Marker>
            ))}
          </MapView>

          <View style={styles.locationCard}>
            <Icon name="map-marker" size={20} color={colors.primary} />
            <Text style={styles.locationText}>{locationLabel}</Text>
          </View>

          <TouchableOpacity
            style={styles.viewMenuButton}
            onPress={this.toggleViewMenu}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="menu" size={24} color={colors.neutralDark} />
          </TouchableOpacity>

          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomButton} onPress={this.handleZoomIn}>
              <Icon name="plus" size={18} color={colors.neutralDark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.zoomButton, { borderBottomWidth: 0 }]}
              onPress={this.handleZoomOut}
            >
              <Icon name="minus" size={18} color={colors.neutralDark} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryButton,
                this.state.selectedCategory === null && styles.categoryButtonActive,
              ]}
              onPress={() => this.handleSelectCategory(null)}
            >
              <Icon
                name="earth"
                size={20}
                color={this.state.selectedCategory === null ? colors.white : colors.neutralMedium}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  this.state.selectedCategory === null && styles.categoryButtonTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {this.state.categories.map((category) => (
              <TouchableOpacity
                key={category.slug || category.backendId}
                style={[
                  styles.categoryButton,
                  this.state.selectedCategory === category.slug && styles.categoryButtonActive,
                  this.state.selectedCategory === category.slug && { backgroundColor: category.color },
                ]}
                onPress={() => this.handleSelectCategory(category.slug)}
              >
                <Icon
                  name={category.icon}
                  size={20}
                  color={
                    this.state.selectedCategory === category.slug
                      ? colors.white
                      : colors.neutralMedium
                  }
                />
                <Text
                  style={[
                    styles.categoryButtonText,
                    this.state.selectedCategory === category.slug && styles.categoryButtonTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.reportButton} onPress={() => navigation.navigate('ReportFlow')}>
          <Icon name="plus" size={24} color={colors.white} />
          <Text style={styles.reportButtonText}>Report Incident</Text>
        </TouchableOpacity>

        {this.state.legendExpanded ? (
          <View style={styles.legend}>
            <View style={styles.legendHeader}>
              <Text style={styles.legendTitle}>Map Legend:</Text>
              <TouchableOpacity onPress={() => this.toggleLegend(false)}>
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
          <TouchableOpacity style={styles.legendMinimized} onPress={() => this.toggleLegend(true)}>
            <Icon name="map-legend" size={22} color={colors.white} />
          </TouchableOpacity>
        )}

        <Modal
          visible={this.state.showViewMenu}
          transparent={true}
          animationType="none"
          onRequestClose={() => this.setState({ showViewMenu: false }, this.closeDrawer)}
        >
          <TouchableWithoutFeedback onPress={() => this.setState({ showViewMenu: false }, this.closeDrawer)}>
            <View style={styles.drawerBackdrop}>
              <TouchableWithoutFeedback>
                <Animated.View
                  style={[
                    styles.drawerContainer,
                    {
                      transform: [
                        {
                          translateY: this.slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [300, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.drawerHandle} />
                  <Text style={styles.drawerTitle}>Select View Mode</Text>

                  <TouchableOpacity
                    style={styles.drawerMenuItem}
                    onPress={() => this.setViewMode('global')}
                  >
                    <View style={styles.drawerMenuIconWrap}>
                      <Icon name="earth" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.drawerMenuTextWrap}>
                      <Text style={styles.drawerMenuText}>Global trends</Text>
                      <Text style={styles.drawerMenuSubtext}>View trending reports worldwide</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.drawerMenuItem}
                    onPress={() => this.setViewMode('country')}
                  >
                    <View style={styles.drawerMenuIconWrap}>
                      <Icon name="flag" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.drawerMenuTextWrap}>
                      <Text style={styles.drawerMenuText}>My country</Text>
                      <Text style={styles.drawerMenuSubtext}>Trending incidents in your country</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.drawerMenuItem}
                    onPress={() => this.setViewMode('nearby')}
                  >
                    <View style={styles.drawerMenuIconWrap}>
                      <Icon name="crosshairs-gps" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.drawerMenuTextWrap}>
                      <Text style={styles.drawerMenuText}>Current location</Text>
                      <Text style={styles.drawerMenuSubtext}>Incidents near you (25km radius)</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    );
  }
}

const MapScreen = (props) => (
  <AuthContext.Consumer>
    {(authContext) => (
      <NotificationContext.Consumer>
        {(notificationContext) => (
          <LocationContext.Consumer>
            {(locationContext) => (
              <MapScreenContent
                {...props}
                authContext={authContext}
                notificationContext={notificationContext}
                locationContext={locationContext}
              />
            )}
          </LocationContext.Consumer>
        )}
      </NotificationContext.Consumer>
    )}
  </AuthContext.Consumer>
);

export default MapScreen;

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
    paddingTop: 21,
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
    fontSize: 11,
  },
  viewMenuButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.neutralLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  drawerTitle: {
    ...typography.h4,
    color: colors.neutralDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.neutralLighter,
  },
  drawerMenuIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drawerMenuTextWrap: {
    flex: 1,
  },
  drawerMenuText: {
    ...typography.body,
    color: colors.neutralDark,
    fontWeight: '600',
    marginBottom: 2,
  },
  drawerMenuSubtext: {
    ...typography.caption,
    color: colors.neutralMedium,
    fontSize: 12,
  },
  zoomControls: {
    position: 'absolute',
    right: 12,
    top: 150,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoomButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralLight,
  },
  categoriesContainer: {
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  categoriesScroll: {
    paddingHorizontal: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.white,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.neutralLight,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  markerBadgeText: {
    ...typography.small,
    color: colors.neutralDark,
    fontSize: 11,
    fontWeight: 'bold',
  },
  reportButton: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  reportButtonText: {
    ...typography.body,
    color: colors.white,
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  errorCard: {
    margin: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorTitle: {
    ...typography.h4,
    color: colors.neutralDark,
    marginTop: 12,
  },
  errorText: {
    ...typography.caption,
    color: colors.neutralMedium,
    textAlign: 'center',
    marginTop: 6,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    ...typography.caption,
    color: colors.white,
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
