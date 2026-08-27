import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Plus } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.3;
const CARD_HEIGHT = 205;
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function AddFarmCard({ onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.circle}>
        <Plus size={26} color="#FFFFFF" strokeWidth={2.8} />
      </View>

      <Text style={styles.title}>Add Farm</Text>

      <Text style={styles.desc}>Add a new farm{'\n'}to get started</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#A7F3D0',
    backgroundColor: '#F9FFFB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#16A34A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    marginTop: 2,
    color: GREEN,
    fontWeight: '900',
    fontSize: rf(15),
    letterSpacing: -0.2,
  },
  desc: {
    marginTop: 6,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: rf(10),
    lineHeight: 14,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
});
