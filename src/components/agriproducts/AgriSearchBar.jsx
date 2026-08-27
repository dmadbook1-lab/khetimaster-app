import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Search, Mic, SlidersHorizontal } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function AgriSearchBar() {
  return (
    <View style={styles.row}>
      <View style={styles.searchBox}>
        <Search size={20} color="#94A3B8" strokeWidth={2.3} />

        <TextInput
          placeholder="Search seeds, fertilizers, pesticides..."
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />

        <Mic size={19} color="#94A3B8" strokeWidth={2.2} />
      </View>

      <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn}>
        <SlidersHorizontal size={23} color="#FFFFFF" strokeWidth={2.6} />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    marginTop: 16,
    height: 48,
    flexDirection: 'row',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    padding: 0,
    fontSize: rf(13),
    fontWeight: '700',
    color: '#111827',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
