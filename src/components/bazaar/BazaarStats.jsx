import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {ShoppingBag, Tractor, Users} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

const stats = [
  {
    Icon: ShoppingBag,
    value: '1200+',
    label: 'PRODUCTS',
    desc: 'Quality Assured',
    color: '#16A34A',
    bg: '#ECFDF5',
  },
  {
    Icon: Tractor,
    value: '350+',
    label: 'MACHINES',
    desc: 'Ready to Rent',
    color: '#F97316',
    bg: '#FFF7ED',
  },
  {
    Icon: Users,
    value: '800+',
    label: 'WORKERS',
    desc: 'Skilled & Verified',
    color: '#6366F1',
    bg: '#EEF2FF',
  },
];

export default function BazaarStats() {
  return (
    <View style={styles.card}>
      {stats.map((item, index) => {
        const Icon = item.Icon;

        return (
          <View key={index} style={[styles.item, index !== 0 && styles.border]}>
            <View style={[styles.iconBox, {backgroundColor: item.bg}]}>
              <Icon size={22} color={item.color} strokeWidth={2.4} />
            </View>

            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    height: 118,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#EEF2F7',

    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },

  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  border: {
    borderLeftWidth: 1,
    borderLeftColor: '#F1F5F9',
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  value: {
    marginTop: 8,
    fontSize: rf(15),
    color: '#111827',
    fontWeight: '900',
  },

  label: {
    marginTop: 3,
    fontSize: rf(8.5),
    color: '#94A3B8',
    fontWeight: '900',
  },

  desc: {
    marginTop: 5,
    fontSize: rf(8),
    color: '#CBD5E1',
    fontWeight: '700',
  },
});