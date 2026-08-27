import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Menu, Bell } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const DARK = '#111827';
export default function HomeHeader() {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.headerIcon}
        onPress={() => navigation.navigate('Sidebar')}
      >
        <Menu size={25} color={DARK} strokeWidth={2.3} />
      </TouchableOpacity>

      <Image
        source={require('../../assets/images/logoo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.headerIcon}
        onPress={() => {}}
      >
        <Bell size={22} color={DARK} strokeWidth={2.2} />

        <View style={styles.badgeCount}>
          <Text style={styles.badgeCountText}>3</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.33,
    height: 52,
  },
  badgeCount: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCountText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
