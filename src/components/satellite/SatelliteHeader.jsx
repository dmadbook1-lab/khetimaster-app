import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {ArrowLeft, CalendarDays, ChevronDown, Layers} from 'lucide-react-native';

export default function SatelliteHeader({title, onBack}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity activeOpacity={0.8} onPress={onBack} style={styles.backBtn}>
        <ArrowLeft size={22} color="#1F2937" strokeWidth={2.5} />
      </TouchableOpacity>

      <View style={styles.titleBox}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>

        <View style={styles.subtitleRow}>
          <Layers size={13} color="#64748B" strokeWidth={2.4} />
          <Text style={styles.subtitle}>Satellite Intelligence</Text>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.85} style={styles.datePill}>
        <CalendarDays size={15} color="#334155" strokeWidth={2.3} />
        <Text style={styles.dateText}>15 Jun 2026</Text>
        <ChevronDown size={14} color="#94A3B8" strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleBox: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.4,
  },

  subtitleRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  subtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },

  datePill: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  dateText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
  },
});