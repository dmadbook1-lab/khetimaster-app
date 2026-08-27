import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ShoppingCart, Bell } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const DARK = '#111827';
const ORANGE = '#F97316';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function AgriHeader({
  title = 'Agri Products',
  subtitle = '2400+ Products Available',
  cartCount = 2,
  fallbackRoute = 'Bazaar',
  onNotificationPress,
}) {
  const navigation = useNavigation();
  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate(fallbackRoute);
  };
  const handleCartPress = () => {
    navigation.navigate('Cart');
  };
  const displayCartCount = cartCount > 99 ? '99+' : String(cartCount);
  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleBackPress}
        style={styles.backBtn}
      >
        <ArrowLeft size={rf(22)} color={DARK} strokeWidth={2.5} />
      </TouchableOpacity>

      <View style={styles.titleBox}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>

        {!!subtitle && (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleCartPress}
        style={styles.iconBtn}
      >
        <ShoppingCart size={rf(21)} color={DARK} strokeWidth={2.3} />

        {cartCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{displayCartCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onNotificationPress}
        style={styles.iconBtn}
      >
        <Bell size={rf(21)} color={DARK} strokeWidth={2.3} />

        <View style={styles.notificationDot} />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: rf(20),
    lineHeight: rf(25),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 2,
    fontSize: rf(11),
    lineHeight: rf(14),
    fontWeight: '800',
    color: '#94A3B8',
  },
  iconBtn: {
    marginLeft: 9,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    right: 2,
    top: -1,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: ORANGE,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: rf(9),
    lineHeight: rf(11),
    fontWeight: '900',
  },
  notificationDot: {
    position: 'absolute',
    right: 8,
    top: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ORANGE,
    borderWidth: 1.5,
    borderColor: '#F8FAFC',
  },
});
