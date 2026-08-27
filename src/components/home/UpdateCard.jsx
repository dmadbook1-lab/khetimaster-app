import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');
const DARK = '#111827';

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function UpdateCard({Icon, title, text, color, bg, border}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.updateCard, {backgroundColor: bg, borderColor: border}]}>
      <View style={styles.updateIconBox}>
        <Icon size={25} color={color} strokeWidth={2.3} />
      </View>

      <View style={styles.updateContent}>
        <Text style={[styles.updateTitle, {color}]}>{title}</Text>
        <Text style={styles.updateText}>{text}</Text>
        <Text style={[styles.updateLink, {color}]}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  updateCard: {
    minHeight: 108,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateContent: {
    flex: 1,
    marginLeft: 16,
  },
  updateTitle: {
    fontSize: rf(12),
    fontWeight: '900',
  },
  updateText: {
    marginTop: 5,
    fontSize: rf(14),
    lineHeight: rf(19),
    color: DARK,
    fontWeight: '600',
  },
  updateLink: {
    marginTop: 10,
    fontSize: rf(12),
    fontWeight: '900',
  },
});