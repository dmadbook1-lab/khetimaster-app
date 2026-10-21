import React from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ArrowRight} from 'lucide-react-native';

import {MARKET_ROUTES} from '../../constants/marketRoutes';

const {width} = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

const KINDS = ['Crops', 'Equipment', 'Fertilizers'];

export default function MarketPromoCard({navigation}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.wrapper}
      onPress={() => navigation.navigate(MARKET_ROUTES.HOME)}>
      <ImageBackground
        source={require('../../assets/bazar/bazar-hero.png')}
        resizeMode="cover"
        style={styles.card}
        imageStyle={styles.image}>
        <LinearGradient
          colors={['rgba(7,63,32,0.96)', 'rgba(7,63,32,0.72)', 'rgba(7,63,32,0.05)']}
          start={{x: 0, y: 0.5}}
          end={{x: 1, y: 0.5}}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.content}>
          <Text style={styles.eyebrow}>NEW · KHETI MARKET</Text>
          <Text style={styles.title}>Buy & sell{'\n'}directly</Text>

          <View style={styles.kindRow}>
            {KINDS.map(kind => (
              <Text key={kind} style={styles.kind}>
                {kind}
              </Text>
            ))}
          </View>

          <View style={styles.button}>
            <Text style={styles.buttonText}>Open Market</Text>
            <ArrowRight size={14} color="#073F20" strokeWidth={2.8} />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
    borderRadius: 24,
    shadowColor: '#073F20',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
  card: {borderRadius: 24, overflow: 'hidden', minHeight: 176},
  image: {borderRadius: 24},
  content: {padding: 18, width: '72%'},
  eyebrow: {color: '#BFF0D2', fontSize: rf(9.5), fontWeight: '900', letterSpacing: 1.2},
  title: {
    marginTop: 6,
    color: '#FFFFFF',
    fontSize: rf(22),
    lineHeight: rf(26),
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  kindRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10},
  kind: {
    color: '#FFFFFF',
    fontSize: rf(9.5),
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  button: {
    marginTop: 14,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#F7B733',
  },
  buttonText: {color: '#073F20', fontSize: rf(12), fontWeight: '900'},
});
