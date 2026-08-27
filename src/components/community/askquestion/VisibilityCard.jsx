import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, rf } from '../theme';
export default function VisibilityCard({ options, value, onChange }) {
  return (
    <View style={styles.row}>
      {options.map(opt => {
        const Icon = opt.icon;
        const active = value === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            activeOpacity={0.85}
            onPress={() => onChange(opt.id)}
            style={[styles.card, active && styles.cardActive]}
          >
            <View
              style={[
                styles.iconCircle,
                active && {
                  backgroundColor: COLORS.DARK_GREEN,
                },
              ]}
            >
              <Icon
                size={rf(14)}
                color={active ? '#FFFFFF' : COLORS.DARK}
                strokeWidth={2.3}
              />
            </View>
            <Text
              style={[
                styles.title,
                active && {
                  color: COLORS.DARK_GREEN,
                },
              ]}
            >
              {opt.label}
            </Text>
            <Text style={styles.sub}>{opt.sub}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    gap: 6,
  },
  cardActive: {
    borderColor: COLORS.DARK_GREEN,
    backgroundColor: '#EAFBF0',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: rf(11.5),
    fontWeight: '900',
    color: COLORS.DARK,
    textAlign: 'center',
  },
  sub: {
    fontSize: rf(9),
    fontWeight: '500',
    color: COLORS.MUTED,
    textAlign: 'center',
  },
});
