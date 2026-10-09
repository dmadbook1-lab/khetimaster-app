import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ArrowLeft,
  Satellite,
  Sprout,
} from 'lucide-react-native';

const GREEN = '#16883E';
const LIGHT_GREEN = '#EAF7EF';
const TEXT = '#142018';
const MUTED = '#728078';

export default function FarmOverviewHeader({
  navigation,
  farmName,
  cropName,
  farmArea,
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        activeOpacity={0.8}>
        <ArrowLeft
          size={20}
          color={TEXT}
          strokeWidth={2.2}
        />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <Text
          style={styles.headerTitle}
          numberOfLines={1}>
          {farmName}
        </Text>

        <View style={styles.headerMeta}>
          <Sprout
            size={12}
            color={GREEN}
            strokeWidth={2.5}
          />

          <Text
            style={styles.headerSubtitle}
            numberOfLines={1}>
            {cropName} • {farmArea}
          </Text>
        </View>
      </View>

      <View style={styles.headerSatelliteIcon}>
        <Satellite
          size={20}
          color={GREEN}
          strokeWidth={2}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 72,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EF',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F2F6F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '900',
  },

  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  headerSubtitle: {
    color: MUTED,
    fontSize: 11,
    marginLeft: 5,
    fontWeight: '600',
  },

  headerSatelliteIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});