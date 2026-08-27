import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Mic, ChevronRight } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const PURPLE = '#4F46E5';
const DARK = '#1F2937';
const MUTED = '#94A3B8';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function VoiceAssistantCard({ onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.left}>
        <View style={styles.iconCircle}>
          <Mic size={24} color="#FFFFFF" strokeWidth={2.5} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Speak to KhetiMaster</Text>

          <Text style={styles.subtitle}>
            "Need labour" • "Mandi price" • "Book tractor"
          </Text>
        </View>
      </View>

      <ChevronRight size={22} color="#94A3B8" />
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 18,
    height: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: rf(18),
    color: DARK,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    fontSize: rf(13),
    color: MUTED,
    fontWeight: '500',
    lineHeight: rf(18),
  },
});
