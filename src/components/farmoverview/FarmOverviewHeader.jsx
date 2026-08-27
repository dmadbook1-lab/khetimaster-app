import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';
export default function FarmOverviewHeader({ title, onBack }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.8}
        style={styles.iconBtn}
      >
        <ArrowLeft size={22} color="#111827" strokeWidth={2.5} />
      </TouchableOpacity>

      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
        <MoreVertical size={22} color="#111827" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
  },
});
