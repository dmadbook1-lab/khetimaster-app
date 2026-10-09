import React from 'react';

import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Layers3,
  Satellite,
  Sprout,
} from 'lucide-react-native';

const DARK_GREEN = '#0D6B30';

export default function FarmOverviewHero({
  farmName,
  cropName,
  variety,
  farmArea,
  selectedSatellite,
  cropImage,
}) {
  const hasCropImage =
    typeof cropImage === 'string' &&
    cropImage.trim().length > 0;

  return (
    <View style={styles.heroCard}>
      {/* Decorative glow */}
      <View style={styles.heroGlowOne} />
      <View style={styles.heroGlowTwo} />

      {/* ======================================================
          TOP SECTION
      ====================================================== */}

      <View style={styles.heroTop}>

        {/* ====================================================
            LARGE CROP IMAGE
        ==================================================== */}

        <View style={styles.cropImageOuter}>
          <View style={styles.cropImageContainer}>
            {hasCropImage ? (
              <Image
                source={{
                  uri: cropImage.trim(),
                }}
                style={styles.cropImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.cropImageFallback}>
                <Sprout
                  size={34}
                  color="#FFFFFF"
                  strokeWidth={1.8}
                />
              </View>
            )}
          </View>

          {/* Small live indicator */}
          <View style={styles.imageStatus}>
            <View style={styles.imageStatusDot} />
          </View>
        </View>

        {/* ====================================================
            FARM INFORMATION
        ==================================================== */}

        <View style={styles.heroText}>
          <Text style={styles.heroEyebrow}>
            FARM MONITORING
          </Text>

          <Text
            style={styles.heroTitle}
            numberOfLines={1}>
            {farmName || 'My Farm'}
          </Text>

          <View style={styles.cropNameRow}>
            <Sprout
              size={13}
              color="#8BE5A9"
              strokeWidth={2.3}
            />

            <Text
              style={styles.heroCropName}
              numberOfLines={1}>
              {cropName || 'Crop'}
            </Text>
          </View>

          <Text
            style={styles.heroVariety}
            numberOfLines={1}>
            {variety || 'Variety not specified'}
          </Text>
        </View>

        {/* ====================================================
            ACTIVE STATUS
        ==================================================== */}

        <View style={styles.heroStatus}>
          <View style={styles.statusDot} />

          <Text style={styles.statusText}>
            ACTIVE
          </Text>
        </View>
      </View>

      {/* ======================================================
          STATS
      ====================================================== */}

      <View style={styles.heroStats}>

        <HeroStat
          icon={
            <Sprout
              size={16}
              color="#FFFFFF"
              strokeWidth={2}
            />
          }
          label="Crop"
          value={cropName || 'Crop'}
        />

        <HeroDivider />

        <HeroStat
          icon={
            <Layers3
              size={16}
              color="#FFFFFF"
              strokeWidth={2}
            />
          }
          label="Area"
          value={farmArea || '—'}
        />

        <HeroDivider />

        <HeroStat
          icon={
            <Satellite
              size={16}
              color="#FFFFFF"
              strokeWidth={2}
            />
          }
          label="Satellite"
          value={
            selectedSatellite === 's1'
              ? 'Sentinel-1'
              : 'Sentinel-2'
          }
        />
      </View>
    </View>
  );
}

function HeroStat({
  icon,
  label,
  value,
}) {
  return (
    <View style={styles.heroStat}>
      <View style={styles.heroStatIcon}>
        {icon}
      </View>

      <View style={styles.heroStatText}>
        <Text style={styles.heroStatLabel}>
          {label}
        </Text>

        <Text
          style={styles.heroStatValue}
          numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function HeroDivider() {
  return (
    <View style={styles.heroDivider} />
  );
}

const styles = StyleSheet.create({
  /* ========================================================
     HERO CARD
  ======================================================== */

  heroCard: {
    marginTop: 14,
    borderRadius: 25,
    backgroundColor: DARK_GREEN,
    padding: 18,
    overflow: 'hidden',
    position: 'relative',
  },

  /* ========================================================
     DECORATIVE GLOWS
  ======================================================== */

  heroGlowOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -80,
    top: -90,
    backgroundColor:
      'rgba(255,255,255,0.055)',
  },

  heroGlowTwo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    left: -90,
    bottom: -100,
    backgroundColor:
      'rgba(255,255,255,0.04)',
  },

  /* ========================================================
     HERO TOP
  ======================================================== */

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* ========================================================
     LARGE CROP IMAGE
  ======================================================== */

  cropImageOuter: {
    width: 72,
    height: 72,
    marginRight: 13,
    position: 'relative',
  },

  cropImageContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor:
      'rgba(255,255,255,0.13)',
    borderWidth: 2,
    borderColor:
      'rgba(255,255,255,0.24)',
  },

  cropImage: {
    width: '100%',
    height: '100%',
  },

  cropImageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,255,255,0.10)',
  },

  /* ========================================================
     IMAGE ACTIVE INDICATOR
  ======================================================== */

  imageStatus: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: DARK_GREEN,
  },

  imageStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6EE7A2',
  },

  /* ========================================================
     HERO TEXT
  ======================================================== */

  heroText: {
    flex: 1,
    minWidth: 0,
  },

  heroEyebrow: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 3,
  },

  cropNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  heroCropName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 5,
    flexShrink: 1,
  },

  heroVariety: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  /* ========================================================
     ACTIVE STATUS
  ======================================================== */

  heroStatus: {
    position: 'absolute',
    right: 0,
    top: 0,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 9,
    paddingVertical: 6,

    borderRadius: 20,

    backgroundColor:
      'rgba(255,255,255,0.10)',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6EE7A2',
    marginRight: 5,
  },

  statusText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  /* ========================================================
     STATS
  ======================================================== */

  heroStats: {
    marginTop: 18,
    paddingTop: 14,

    borderTopWidth: 1,
    borderTopColor:
      'rgba(255,255,255,0.12)',

    flexDirection: 'row',
    alignItems: 'center',
  },

  heroStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  heroStatIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,

    backgroundColor:
      'rgba(255,255,255,0.10)',
  },

  heroStatText: {
    flex: 1,
    minWidth: 0,
  },

  heroStatLabel: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 8,
    fontWeight: '700',
  },

  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },

  heroDivider: {
    width: 1,
    height: 30,

    backgroundColor:
      'rgba(255,255,255,0.12)',

    marginHorizontal: 7,
  },
});