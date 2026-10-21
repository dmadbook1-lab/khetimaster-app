import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import {Mic, ChevronRight, Sparkles} from 'lucide-react-native';

const {width} = Dimensions.get('window');
const PURPLE = '#4F46E5';

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function VoiceAssistantCard({onPress}) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.055,
          duration: 1050,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1050,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Speak to KhetiMaster"
      activeOpacity={0.9}
      style={styles.card}
      onPress={onPress}>
      <View pointerEvents="none" style={styles.glowLine} />

      <View style={styles.left}>
        <Animated.View style={[styles.iconCircle, {transform: [{scale: pulse}]}]}>
          <Mic size={23} color="#FFFFFF" strokeWidth={2.4} />
        </Animated.View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Speak to KhetiMaster</Text>
            <Sparkles size={15} color={PURPLE} />
          </View>
          <Text style={styles.subtitle}>बोलें और अपना काम तुरंत करें</Text>
          <Text style={styles.examples}>Labour · Mandi Rates · Tractor</Text>
        </View>
      </View>

      <View style={styles.arrow}>
        <ChevronRight size={21} color={PURPLE} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    minHeight: 96,
    borderRadius: 24,
    paddingHorizontal: 17,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E7FF',
    overflow: 'hidden',
    shadowColor: PURPLE,
    shadowOpacity: 0.13,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 7},
    elevation: 5,
  },
  glowLine: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: '#A5B4FC',
  },
  left: {flexDirection: 'row', alignItems: 'center', flex: 1},
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 19,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PURPLE,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  textContainer: {marginLeft: 14, flex: 1},
  titleRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  title: {fontSize: rf(16), color: '#171A2B', fontWeight: '800'},
  subtitle: {
    marginTop: 5,
    fontSize: rf(12),
    color: '#475569',
    fontWeight: '600',
  },
  examples: {
    marginTop: 5,
    fontSize: rf(10),
    color: '#8186A4',
    fontWeight: '600',
  },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#F0EFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});