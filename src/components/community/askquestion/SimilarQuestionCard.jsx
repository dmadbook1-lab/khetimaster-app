import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {MessageCircle, Check} from 'lucide-react-native';
import {COLORS, rf} from '../theme';

export default function SimilarQuestionCard({item}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row1}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.match}>{item.match}%</Text>
      </View>

      <View style={styles.row2}>
        <View style={styles.repliesRow}>
          <MessageCircle size={rf(11)} color={COLORS.MUTED} strokeWidth={2.3} />
          <Text style={styles.repliesText}>{item.replies} replies</Text>
        </View>

        {item.expertAnswer && (
          <View style={styles.expertBadge}>
            <Check size={rf(10)} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.expertText}>Expert Answer</Text>
          </View>
        )}

        <View style={{flex: 1}} />

        <TouchableOpacity activeOpacity={0.85} style={styles.viewBtn}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  row1: {flexDirection: 'row', gap: 10, alignItems: 'flex-start'},
  title: {
    flex: 1,
    fontSize: rf(12.5),
    lineHeight: rf(17),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  match: {fontSize: rf(12.5), fontWeight: '900', color: COLORS.DARK_GREEN},
  row2: {marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10},
  repliesRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  repliesText: {fontSize: rf(10), fontWeight: '600', color: COLORS.MUTED},
  expertBadge: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  expertText: {fontSize: rf(9.5), fontWeight: '900', color: '#FFFFFF'},
  viewBtn: {
    height: 30,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
  },
  viewText: {fontSize: rf(10.5), fontWeight: '900', color: COLORS.DARK},
});