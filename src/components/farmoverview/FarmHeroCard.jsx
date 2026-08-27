import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  CheckCircle,
  BookOpen,
  Maximize2,
  MapPin,
  Circle,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#22C55E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function FarmHeroCard({ farm }) {
  return (
    <ImageBackground
      source={farm.image}
      style={styles.card}
      imageStyle={styles.image}
      resizeMode="cover"
    >
      <View style={styles.darkOverlay} />
      <View style={styles.bottomGradient} />

      <TouchableOpacity activeOpacity={0.8} style={styles.locationBtn}>
        <MapPin size={21} color="#FFFFFF" strokeWidth={2.6} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>
            {farm.title || 'Patil Farm'}
          </Text>

          <View style={styles.verifiedBox}>
            <CheckCircle size={16} color="#FFFFFF" fill={GREEN} />
          </View>
        </View>

        <View style={styles.metaRow}>
          <BookOpen
            size={14}
            color="rgba(255,255,255,0.92)"
            strokeWidth={2.3}
          />
          <Text style={styles.metaText}>{farm.crop || 'Soybean'}</Text>
        </View>

        <View style={styles.metaRow}>
          <Maximize2
            size={14}
            color="rgba(255,255,255,0.92)"
            strokeWidth={2.3}
          />
          <Text style={styles.metaText}>{farm.area || '2.34 Acres'}</Text>
        </View>

        <View style={styles.activeRow}>
          <View style={styles.activeDot} />
          <Text style={styles.activeText}>Monitoring Active</Text>
        </View>
      </View>

      <View style={styles.dots}>
        <Circle size={6} color="#FFFFFF" fill="#FFFFFF" />
        <Circle
          size={6}
          color="rgba(255,255,255,0.55)"
          fill="rgba(255,255,255,0.55)"
        />
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  card: {
    height: 256,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 7,
  },
  image: {
    borderRadius: 24,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.46)',
  },
  locationBtn: {
    position: 'absolute',
    right: 18,
    top: 116,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(91,112,50,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  content: {
    position: 'absolute',
    left: 20,
    right: 70,
    bottom: 22,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flexShrink: 1,
    fontSize: rf(27),
    lineHeight: rf(32),
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: -0.7,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 6,
  },
  verifiedBox: {
    marginLeft: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    color: 'rgba(255,255,255,0.94)',
    fontSize: rf(13),
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 4,
  },
  activeRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  activeText: {
    color: GREEN,
    fontSize: rf(13),
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },
  dots: {
    position: 'absolute',
    right: 20,
    bottom: 15,
    flexDirection: 'row',
    gap: 5,
  },
});
