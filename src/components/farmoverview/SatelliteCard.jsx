import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - width * 0.11 - 14) / 2;
const IMAGE_SIZE = width < 360 ? 108 : 128;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
const services = [
  {
    title: 'Labour Booking',
    desc: 'Book skilled farm workers',
    image: require('../../assets/bazar/labour.png'),
    bg: '#ECFDF5',
    color: '#16883E',
    route: null,
  },
  {
    title: 'Machinery Rental',
    desc: 'Rent tractors & equipment',
    image: require('../../assets/bazar/tractor.png'),
    bg: '#EFF6FF',
    color: '#2563EB',
    route: null,
  },
  {
    title: 'Agri Products',
    desc: 'Seeds, fertilizers & tools',
    image: require('../../assets/bazar/agri.png'),
    bg: '#FFF7ED',
    color: '#F97316',
    badge: '1200+',
    route: 'AgriProducts',
  },
  {
    title: 'Drone Services',
    desc: 'Spraying & crop monitoring',
    image: require('../../assets/bazar/drone.png'),
    bg: '#FAF5FF',
    color: '#9333EA',
    badge: 'Premium',
    route: null,
  },
];
export default function ServicesGrid() {
  const navigation = useNavigation();
  const handlePress = item => {
    if (item.route === 'AgriProducts') {
      navigation.navigate('AgriProducts');
    }
  };
  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Services & Products</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>

      <View style={styles.grid}>
        {services.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.78}
            onPress={() => handlePress(item)}
            style={[
              styles.card,
              {
                backgroundColor: item.bg,
              },
            ]}
          >
            {!!item.badge && (
              <View
                pointerEvents="none"
                style={[
                  styles.badge,
                  {
                    backgroundColor: item.color,
                  },
                ]}
              >
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}

            <View pointerEvents="none" style={styles.textBox}>
              <Text numberOfLines={1} style={styles.cardTitle}>
                {item.title}
              </Text>

              <Text numberOfLines={2} style={styles.cardDesc}>
                {item.desc}
              </Text>
            </View>

            <Image
              pointerEvents="none"
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />

            <View
              pointerEvents="none"
              style={[
                styles.exploreBtn,
                {
                  borderColor: item.color,
                },
              ]}
            >
              <Text
                style={[
                  styles.exploreText,
                  {
                    color: item.color,
                  },
                ]}
              >
                Explore
              </Text>
              <ArrowRight size={13} color={item.color} strokeWidth={2.7} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 34,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: rf(20),
    color: '#111827',
    fontWeight: '900',
    letterSpacing: -0.35,
  },
  seeAll: {
    fontSize: rf(12),
    color: '#16883E',
    fontWeight: '900',
  },
  grid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: 154,
    borderRadius: 22,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },
  textBox: {
    width: '76%',
    zIndex: 2,
  },
  cardTitle: {
    fontSize: rf(13),
    color: '#111827',
    fontWeight: '900',
  },
  cardDesc: {
    marginTop: 5,
    fontSize: rf(10),
    lineHeight: rf(14),
    color: '#475467',
    fontWeight: '700',
  },
  image: {
    position: 'absolute',
    right: -16,
    bottom: -10,
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    zIndex: 1,
  },
  exploreBtn: {
    position: 'absolute',
    left: 16,
    bottom: 14,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 11,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 3,
  },
  exploreText: {
    fontSize: rf(9),
    fontWeight: '900',
  },
  badge: {
    position: 'absolute',
    top: 14,
    right: 12,
    height: 21,
    borderRadius: 11,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  badgeText: {
    fontSize: rf(8),
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
