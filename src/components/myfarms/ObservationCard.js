import React from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {CalendarDays} from 'lucide-react-native';

const GREEN = '#16883E';
const PALE_GREEN = '#F5FBF7';
const TEXT = '#142018';
const MUTED = '#728078';

export default function ObservationCard({
  selectedDate,
  selectedIndex,
  formatDate,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.icon}>
          <CalendarDays
            size={17}
            color={GREEN}
            strokeWidth={2}
          />
        </View>

        <View>
          <Text style={styles.label}>
            CURRENT OBSERVATION
          </Text>

          <Text style={styles.date}>
            {selectedDate
              ? formatDate(selectedDate)
              : 'Waiting for satellite date'}
          </Text>
        </View>
      </View>

      <View style={styles.index}>
        <Text style={styles.indexLabel}>
          INDEX
        </Text>

        <Text style={styles.indexValue}>
          {selectedIndex || '--'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    padding: 13,
    borderRadius: 16,
    backgroundColor: PALE_GREEN,
    borderWidth: 1,
    borderColor: '#DCEFE2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  label: {
    color: GREEN,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  date: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },

  index: {
    alignItems: 'flex-end',
  },

  indexLabel: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '800',
  },

  indexValue: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 1,
  },
});