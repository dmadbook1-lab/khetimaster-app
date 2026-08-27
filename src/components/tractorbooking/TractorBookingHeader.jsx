import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ArrowLeft, Bell } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const DARK = '#121A2B';
const ORANGE = '#F97316';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function TractorBookingHeader({
  navigation,
  onNotificationPress,
  title = 'Tractor Booking',
}) {
  const handleBackPress = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation?.navigate?.('Bazaar');
  };
  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleBackPress}
        style={styles.backButton}
      >
        <ArrowLeft size={rf(22)} color={DARK} strokeWidth={2.5} />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onNotificationPress}
        style={styles.notificationButton}
      >
        <Bell size={rf(20)} color={DARK} strokeWidth={2.3} />

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
  backButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    marginLeft: 3,
    fontSize: rf(20),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.4,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    right: 9,
    top: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ORANGE,
    borderWidth: 1.5,
    borderColor: '#F8FAFC',
  },
});
