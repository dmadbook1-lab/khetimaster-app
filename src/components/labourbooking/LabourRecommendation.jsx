import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Sparkles, ArrowRight } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function LabourRecommendation({ onViewPress }) {
  return (
    <LinearGradient
      colors={['#158B3D', '#18A84A']}
      start={{
        x: 0,
        y: 0,
      }}
      end={{
        x: 1,
        y: 1,
      }}
      style={styles.card}
    >
      <View style={styles.badge}>
        <Sparkles size={rf(11)} color="#FFFFFF" strokeWidth={2.4} />
        <Text style={styles.badgeText}>AI RECOMMENDATION</Text>
      </View>

      <Text style={styles.title}>Best worker for your farm</Text>
      <Text style={styles.subtitle}>
        Based on your crop, area & season, we recommend Ram Pawar (Harvesting
        expert).
      </Text>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onViewPress}
        style={styles.btn}
      >
        <Text style={styles.btnText}>View Details</Text>
        <ArrowRight size={rf(13)} color="#16A34A" strokeWidth={2.6} />
      </TouchableOpacity>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    borderRadius: 14,
    padding: 15,
  },
  badge: {
    alignSelf: 'flex-start',
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: rf(7),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  title: {
    marginTop: 11,
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: 6,
    fontSize: rf(10),
    color: '#DCFCE7',
    lineHeight: rf(14),
  },
  btn: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#16A34A',
  },
});
