import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Search, Mic, SlidersHorizontal } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function LabourSearchBar({
  value,
  onChangeText,
  onMicPress,
  onFilterPress,
}) {
  return (
    <View style={styles.row}>
      <View style={styles.searchBox}>
        <Search size={rf(16)} color="#94A3B8" strokeWidth={2.4} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search workers or skills"
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />
        <TouchableOpacity activeOpacity={0.8} onPress={onMicPress}>
          <Mic size={rf(16)} color="#16A34A" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onFilterPress}
        style={styles.filterBtn}
      >
        <SlidersHorizontal size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E7EBED',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: rf(11),
    color: '#172033',
    padding: 0,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
