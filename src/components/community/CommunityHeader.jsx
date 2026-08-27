import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu, Search, Bell } from 'lucide-react-native';
import { COLORS, rf, PAGE_PADDING } from './theme';
export default function CommunityHeader({ navigation }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
        <Menu size={rf(22)} color={COLORS.DARK} strokeWidth={2.4} />
      </TouchableOpacity>

      <View style={styles.textBox}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>LEARN · SHARE · GROW TOGETHER</Text>
      </View>

      <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
        <Search size={rf(20)} color={COLORS.DARK} strokeWidth={2.4} />
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
        <Bell size={rf(20)} color={COLORS.DARK} strokeWidth={2.3} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>5</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    minHeight: 68,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
    gap: 6,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: rf(18),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  subtitle: {
    marginTop: 2,
    fontSize: rf(8.5),
    fontWeight: '700',
    color: COLORS.MUTED,
    letterSpacing: 0.3,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLORS.ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
