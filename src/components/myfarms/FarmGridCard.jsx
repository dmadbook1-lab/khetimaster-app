import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  MoreVertical,
  BookOpen,
  Maximize2,
  ChevronRight,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - width * 0.11 - 16) / 2;
const GREEN = '#16883E';
const DARK = '#111827';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function FarmGridCard({ farm, navigation }) {
  const healthy = farm.statusType === 'healthy';
  const handlePress = () => {
    navigation.navigate('FarmOverview', {
      farm: {
        ...farm,
        location: farm.location || 'Yavatmal, Maharashtra',
        sowingDate: farm.sowingDate || '12 Jun 2025',
        soilType: farm.soilType || 'Black Cotton Soil',
      },
    });
  };
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={styles.card}
    >
      <Image source={farm.image} style={styles.image} resizeMode="cover" />

      <TouchableOpacity activeOpacity={0.8} style={styles.menuBtn}>
        <MoreVertical size={17} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.title}>
          {farm.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <BookOpen size={11} color="#64748B" strokeWidth={2.2} />
            <Text numberOfLines={1} style={styles.metaText}>
              {farm.crop}
            </Text>
          </View>

          <Text style={styles.dot}>•</Text>

          <View style={styles.metaItem}>
            <Maximize2 size={11} color="#64748B" strokeWidth={2.2} />
            <Text numberOfLines={1} style={styles.metaText}>
              {farm.area}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View
            style={[
              styles.statusPill,
              healthy ? styles.healthyPill : styles.attentionPill,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                healthy ? styles.healthyText : styles.attentionText,
              ]}
            >
              {farm.status}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsText}>View</Text>

            <ChevronRight size={13} color={GREEN} strokeWidth={2.6} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 106,
  },
  menuBtn: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  title: {
    fontSize: rf(14),
    color: DARK,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: rf(9),
    color: '#64748B',
    fontWeight: '700',
  },
  dot: {
    marginHorizontal: 6,
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '900',
  },
  bottomRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  healthyPill: {
    backgroundColor: '#ECFDF5',
  },
  attentionPill: {
    backgroundColor: '#FFF7ED',
  },
  statusText: {
    fontSize: rf(9),
    fontWeight: '900',
  },
  healthyText: {
    color: GREEN,
  },
  attentionText: {
    color: '#EA580C',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    marginRight: 2,
    fontSize: rf(10),
    color: GREEN,
    fontWeight: '900',
  },
});
