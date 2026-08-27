import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {Zap, RefreshCcw, Search, Clock} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const items = [
  {Icon: Zap, title: 'Rich in Nitrogen &\nPhosphorus'},
  {Icon: RefreshCcw, title: 'Improves Root\nGrowth'},
  {Icon: Search, title: 'Suitable for Irrigated\nCrops'},
  {Icon: Clock, title: 'Long-lasting\nNutrition'},
];

export default function ProductBenefits() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Product Benefits</Text>

      <View style={styles.grid}>
        {items.map((item, index) => {
          const Icon = item.Icon;

          return (
            <View key={index} style={styles.card}>
              <View style={styles.iconBox}>
                <Icon size={20} color="#FFFFFF" />
              </View>

              <Text style={styles.title}>{item.title}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },

  grid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },

  card: {
    width: (width - width * 0.074 - 12) / 2,
    height: 94,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    padding: 14,
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    color: '#111827',
  },
});