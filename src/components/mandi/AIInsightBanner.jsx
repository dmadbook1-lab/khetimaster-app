import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Bot} from 'lucide-react-native';
import {COLORS, rf} from './theme';

export default function AIInsightBanner({label, title, desc, ctaLabel, onPress, iconColor = COLORS.ORANGE}) {
  return (
    <LinearGradient
      colors={['#22A957', '#158B3D']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, {backgroundColor: iconColor}]}>
          <Bot size={rf(15)} color="#FFFFFF" strokeWidth={2.3} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      {desc && <Text style={styles.desc}>{desc}</Text>}

      {ctaLabel && (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.ctaBtn}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {padding: 16, borderRadius: 16, overflow: 'hidden'},
  headerRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: rf(10),
    fontWeight: '900',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },
  title: {
    marginTop: 8,
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: rf(21),
  },
  desc: {
    marginTop: 6,
    fontSize: rf(11),
    lineHeight: rf(16),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
  },
  ctaBtn: {
    marginTop: 14,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {fontSize: rf(12), fontWeight: '900', color: COLORS.DARK_GREEN},
});