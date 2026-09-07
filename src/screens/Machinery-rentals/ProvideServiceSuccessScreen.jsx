import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  CheckCircle2,
  Tractor,
  ArrowRight,
  Home,
  Eye,
  Clock,
  CalendarDays,
  MapPin,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const rf = s =>
  Math.max(
    s - 2,
    Math.min((s * width) / 390, s + 2),
  );

export default function ProvideServiceSuccessScreen({
  navigation,
  route,
}) {
  const machinery =
    route?.params?.machinery || {};

  const name =
    machinery.name || 'Your Machinery';

  const category =
    machinery.category || 'Machinery';

  const ownerName =
    machinery.ownerName || '';

  const state =
    machinery.state || '';

  const district =
    machinery.district || '';

  const village =
    machinery.village || '';

  const location =
    [village, district, state]
      .filter(Boolean)
      .join(', ');

  const hourly =
    machinery.pricing?.hourly || 0;

  const daily =
    machinery.pricing?.daily || 0;

  const handleViewProfile = () => {
    navigation.replace(
      'MachineryRentalProfile',
      {
        machinery,
      },
    );
  };

  const handleGoHome = () => {
    navigation.popToTop();
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        {/* SUCCESS ICON */}

        <View style={styles.successIcon}>
          <CheckCircle2
            size={54}
            color="#1B7A2E"
            strokeWidth={1.8}
          />
        </View>

        <Text style={styles.title}>
          Service Started!
        </Text>

        <Text style={styles.subtitle}>
          Your machinery has been successfully
          listed for rental.
        </Text>

        {/* MACHINERY CARD */}

        <View style={styles.machineCard}>
          <View style={styles.machineIcon}>
            <Tractor
              size={30}
              color="#1B7A2E"
              strokeWidth={2}
            />
          </View>

          <View style={styles.machineInfo}>
            <Text style={styles.category}>
              {category}
            </Text>

            <Text style={styles.machineName}>
              {name}
            </Text>

            {ownerName ? (
              <Text style={styles.owner}>
                Owner: {ownerName}
              </Text>
            ) : null}

            {location ? (
              <View style={styles.locationRow}>
                <MapPin
                  size={14}
                  color="#6B7280"
                />

                <Text
                  style={styles.location}
                  numberOfLines={2}
                >
                  {location}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* PRICING */}

        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>
            Rental Pricing
          </Text>

          <View style={styles.pricingRow}>
            {hourly > 0 && (
              <View style={styles.priceItem}>
                <View style={styles.priceIcon}>
                  <Clock
                    size={16}
                    color="#1B7A2E"
                  />
                </View>

                <View>
                  <Text style={styles.priceLabel}>
                    Per Hour
                  </Text>

                  <Text style={styles.priceValue}>
                    ₹{hourly}
                  </Text>
                </View>
              </View>
            )}

            {daily > 0 && (
              <View style={styles.priceItem}>
                <View style={styles.priceIcon}>
                  <CalendarDays
                    size={16}
                    color="#1B7A2E"
                  />
                </View>

                <View>
                  <Text style={styles.priceLabel}>
                    Per Day
                  </Text>

                  <Text style={styles.priceValue}>
                    ₹{daily}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* MESSAGE */}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <CheckCircle2
              size={18}
              color="#1B7A2E"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Your machinery is now available
            </Text>

            <Text style={styles.infoText}>
              Farmers can discover your machinery
              and request it for their agricultural
              work.
            </Text>
          </View>
        </View>

        {/* VIEW PROFILE */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.primaryBtn}
          onPress={handleViewProfile}
        >
          <Eye
            size={19}
            color="#fff"
            strokeWidth={2.3}
          />

          <Text style={styles.primaryText}>
            View Rental Profile
          </Text>

          <ArrowRight
            size={18}
            color="#fff"
            strokeWidth={2.3}
          />
        </TouchableOpacity>

        {/* HOME */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.secondaryBtn}
          onPress={handleGoHome}
        >
          <Home
            size={18}
            color="#1B7A2E"
            strokeWidth={2.2}
          />

          <Text style={styles.secondaryText}>
            Go to Home
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          You can manage your machinery listing
          from your services section.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 40,
  },

  successIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#EAF6E8',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: rf(27),
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
    marginTop: 20,
  },

  subtitle: {
    fontSize: rf(13),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
    paddingHorizontal: 20,
  },

  machineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FAFCF9',
  },

  machineIcon: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  machineInfo: {
    flex: 1,
  },

  category: {
    fontSize: rf(11),
    color: '#1B7A2E',
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  machineName: {
    fontSize: rf(17),
    fontWeight: '900',
    color: '#111',
    marginTop: 3,
  },

  owner: {
    fontSize: rf(11),
    color: '#6B7280',
    marginTop: 3,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    gap: 4,
  },

  location: {
    flex: 1,
    fontSize: rf(11),
    color: '#6B7280',
  },

  pricingCard: {
    marginTop: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#fff',
  },

  pricingTitle: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#111',
    marginBottom: 13,
  },

  pricingRow: {
    flexDirection: 'row',
    gap: 25,
  },

  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  priceIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  priceLabel: {
    fontSize: rf(10),
    color: '#6B7280',
  },

  priceValue: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#111',
    marginTop: 2,
  },

  infoCard: {
    flexDirection: 'row',
    marginTop: 14,
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#F6FBF3',
    borderWidth: 1,
    borderColor: '#DCEED8',
  },

  infoIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#DFF1D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: rf(12),
    fontWeight: '800',
    color: '#111',
  },

  infoText: {
    fontSize: rf(11),
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 3,
  },

  primaryBtn: {
    height: 54,
    borderRadius: 28,
    backgroundColor: '#1B7A2E',
    marginTop: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  primaryText: {
    color: '#fff',
    fontSize: rf(15),
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },

  secondaryBtn: {
    height: 52,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: '#DCEED8',
    backgroundColor: '#F6FBF3',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  secondaryText: {
    color: '#1B7A2E',
    fontSize: rf(14),
    fontWeight: '800',
  },

  footerNote: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: rf(10),
    lineHeight: 15,
    marginTop: 14,
    paddingHorizontal: 25,
  },
});