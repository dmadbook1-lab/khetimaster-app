import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS, rf, PAGE_PADDING } from './theme';
export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightIcon: RightIcon,
  rightBadge,
  onRightPress,
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.iconBtn}
        >
          <ArrowLeft size={rf(16)} color={COLORS.DARK} strokeWidth={2.5} />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
          }}
        >
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {RightIcon ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onRightPress}
            style={styles.iconBtn}
          >
            <RightIcon size={rf(16)} color={COLORS.DARK} strokeWidth={2.3} />
            {rightBadge && <View style={styles.badge} />}
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.RED,
  },
  title: {
    fontSize: rf(16),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  subtitle: {
    marginTop: 3,
    fontSize: rf(11),
    fontWeight: '500',
    color: COLORS.MUTED,
    textAlign: 'center',
  },
});
