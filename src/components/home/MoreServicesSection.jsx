// components/home/MoreServicesSection.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');
const DARK = '#111827';

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function MoreServicesSection({navigation}) {
  const topRow = [
    {
      title: 'Reels',
      image: require('../../assets/homescreen/reeel.png'),
      onPress: () => navigation?.navigate('Reels'),
    },
    {
      title: 'News',
      image: require('../../assets/homescreen/news.png'),
      onPress: () => navigation?.navigate('News'),
    },
    {
      title: 'Traders',
      image: require('../../assets/homescreen/traders.png'),
      onPress: () => navigation?.navigate('Traders'),
    },
  ];

  const bottomRow = [
    {
      title: 'Insurance',
      image: require('../../assets/homescreen/insurance.png'),
      onPress: () => navigation?.navigate('Insurance'),
    },
    {
      title: 'Community',
      image: require('../../assets/homescreen/community.png'),
      onPress: () => navigation?.navigate('Community'),
    },
  ];

  const renderPill = (item, style) => (
    <TouchableOpacity
      key={item.title}
      activeOpacity={0.85}
      onPress={item.onPress}
      style={[styles.pill, style]}>
      <View style={styles.iconWrap}>
        <Image source={item.image} style={styles.icon} resizeMode="cover" />
      </View>
      <Text style={styles.pillText} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {topRow.map(item => renderPill(item, styles.thirdPill))}
      </View>
      <View style={[styles.row, {marginTop: 10}]}>
        {bottomRow.map(item => renderPill(item, styles.halfPill))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 22,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingRight: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  thirdPill: {
    flex: 1,
  },
  halfPill: {
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  icon: {
    width: 52,
    height: 52,
  },
  pillText: {
    flex: 1,
    fontSize: rf(12),
    color: DARK,
    fontWeight: '800',
  },
});