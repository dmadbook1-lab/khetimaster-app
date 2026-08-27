import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import {Bell} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const DARK = '#111827';
const MUTED = '#667085';
const ORANGE = '#F97316';

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function MyFarmsHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.textBox}>
        <Text style={styles.title}>My Farms</Text>
        <Text style={styles.subtitle}>
          Manage and monitor all your farms in one place
        </Text>
      </View>

      <TouchableOpacity activeOpacity={0.8} style={styles.bellBtn}>
        <Bell size={22} color={DARK} strokeWidth={2.2} />
        <View style={styles.bellDot} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  textBox: {
    flex: 1,
    paddingRight: 18,
  },

  title: {
    fontSize: rf(30),
    lineHeight: rf(36),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 4,
    fontSize: rf(13),
    lineHeight: rf(20),
    fontWeight: '600',
    color: MUTED,
  },

  bellBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bellDot: {
    position: 'absolute',
    top: 13,
    right: 14,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ORANGE,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
});