import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import {BookOpen, Download, Share2} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const CARD_WIDTH = (width - width * 0.074 - 24) / 3;

const actions = [
  {
    title: 'View Advisory',
    Icon: BookOpen,
    active: true,
  },
  {
    title: 'Download Report',
    Icon: Download,
  },
  {
    title: 'Share Farm',
    Icon: Share2,
  },
];

export default function SatelliteQuickActions() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.row}>
        {actions.map((item, index) => {
          const Icon = item.Icon;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.85}
              style={[styles.card, item.active && styles.activeCard]}>
              <Icon
                size={24}
                color={item.active ? '#FFFFFF' : '#475467'}
                strokeWidth={2.4}
              />

              <Text style={[styles.text, item.active && styles.activeText]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 36,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.35,
  },

  row: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  card: {
    width: CARD_WIDTH,
    height: 104,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },

  activeCard: {
    backgroundColor: '#16883E',
    borderColor: '#16883E',
    shadowColor: '#16883E',
    shadowOpacity: 0.26,
  },

  text: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '900',
    color: '#344054',
    textAlign: 'center',
  },

  activeText: {
    color: '#FFFFFF',
  },
});