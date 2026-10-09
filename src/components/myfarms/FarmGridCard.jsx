import React from 'react';

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

import {
  MoreVertical,
  BookOpen,
  Maximize2,
  ChevronRight,
  MapPin,
} from 'lucide-react-native';

import {farms as defaultFarmImages} from './data';

const {width} = Dimensions.get('window');

const CARD_WIDTH =
  (width - width * 0.11 - 16) / 2;

const GREEN = '#16883E';
const DARK = '#111827';

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size - 2,
    Math.min(size * scale, size + 2),
  );
};

export default function FarmGridCard({
  farm,
  farmIndex = 0,
  navigation,
}) {
  if (!farm) {
    return null;
  }

  const farmId =
    farm?._id || farm?.id;

  const farmName =
    farm?.fieldName ||
    farm?.farmName ||
    'My Farm';

  const cropName =
    farm?.cropName ||
    'Crop not specified';

  const variety =
    farm?.variety || '';

  const acre =
    Number(farm?.acre || 0);

  const isBarren =
    Boolean(farm?.isBarrenLand);

  /*
  |--------------------------------------------------------------------------
  | DEFAULT IMAGE
  |--------------------------------------------------------------------------
  |
  | Keep using the existing images from:
  | components/myfarms/data.js
  |
  | They are only visual defaults.
  |
  */

  const defaultImage =
    defaultFarmImages?.[
      farmIndex %
        Math.max(
          defaultFarmImages.length,
          1,
        )
    ]?.image;

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  const status =
    isBarren
      ? 'Barren'
      : 'Active';

  /*
  |--------------------------------------------------------------------------
  | OPEN FARM
  |--------------------------------------------------------------------------
  */

  const handlePress = () => {
    navigation.navigate(
      'FarmOverview',
      {
        farm,
        farmId,
      },
    );
  };

  /*
  |--------------------------------------------------------------------------
  | MENU
  |--------------------------------------------------------------------------
  */

  const handleMenu = () => {
    console.log(
      '[FarmGridCard] Menu:',
      farmId,
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={styles.card}
    >
      {defaultImage ? (
        <Image
          source={defaultImage}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View
          style={styles.imageFallback}
        >
          <Text
            style={styles.fallbackText}
          >
            {cropName}
          </Text>
        </View>
      )}

      {/* Dark overlay for readability */}
      <View
        pointerEvents="none"
        style={styles.imageOverlay}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleMenu}
        style={styles.menuBtn}
      >
        <MoreVertical
          size={17}
          color="#FFFFFF"
          strokeWidth={2.5}
        />
      </TouchableOpacity>

      <View style={styles.body}>
        <Text
          numberOfLines={1}
          style={styles.title}
        >
          {farmName}
        </Text>

        <View
          style={styles.metaRow}
        >
          <View
            style={styles.metaItem}
          >
            <BookOpen
              size={11}
              color="#64748B"
              strokeWidth={2.2}
            />

            <Text
              numberOfLines={1}
              style={styles.metaText}
            >
              {cropName}
            </Text>
          </View>

          <Text style={styles.dot}>
            •
          </Text>

          <View
            style={styles.metaItem}
          >
            <Maximize2
              size={11}
              color="#64748B"
              strokeWidth={2.2}
            />

            <Text
              numberOfLines={1}
              style={styles.metaText}
            >
              {acre > 0
                ? `${acre.toFixed(
                    1,
                  )} ac`
                : '—'}
            </Text>
          </View>
        </View>

        {variety ? (
          <View
            style={styles.locationRow}
          >
            <MapPin
              size={11}
              color="#94A3B8"
              strokeWidth={2.2}
            />

            <Text
              numberOfLines={1}
              style={styles.locationText}
            >
              {variety}
            </Text>
          </View>
        ) : null}

        <View
          style={styles.bottomRow}
        >
          <View
            style={[
              styles.statusPill,
              isBarren
                ? styles.attentionPill
                : styles.healthyPill,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isBarren
                  ? styles.attentionText
                  : styles.healthyText,
              ]}
            >
              {status}
            </Text>
          </View>

          <View
            style={styles.detailsRow}
          >
            <Text
              style={styles.detailsText}
            >
              View
            </Text>

            <ChevronRight
              size={13}
              color={GREEN}
              strokeWidth={2.6}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',

    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 4,
  },

  image: {
    width: '100%',
    height: 106,
  },

  imageFallback: {
    width: '100%',
    height: 106,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fallbackText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: GREEN,
  },

  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 106,
    backgroundColor:
      'rgba(0,0,0,0.08)',
  },

  menuBtn: {
    position: 'absolute',
    right: 10,
    top: 10,

    width: 30,
    height: 30,

    borderRadius: 15,

    backgroundColor:
      'rgba(0,0,0,0.35)',

    justifyContent: 'center',
    alignItems: 'center',
  },

  body: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  title: {
    fontSize: rf(14),
    color: DARK,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '42%',
  },

  metaText: {
    marginLeft: 4,
    fontSize: rf(9),
    color: '#64748B',
    fontWeight: '700',
  },

  dot: {
    marginHorizontal: 6,
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '900',
  },

  locationRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    flex: 1,
    marginLeft: 4,
    fontSize: rf(9),
    color: '#94A3B8',
    fontWeight: '700',
  },

  bottomRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusPill: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },

  healthyPill: {
    backgroundColor: '#ECFDF5',
  },

  attentionPill: {
    backgroundColor: '#FFF7ED',
  },

  statusText: {
    fontSize: rf(9),
    fontWeight: '900',
  },

  healthyText: {
    color: GREEN,
  },

  attentionText: {
    color: '#EA580C',
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailsText: {
    marginRight: 2,
    fontSize: rf(10),
    color: GREEN,
    fontWeight: '900',
  },
});