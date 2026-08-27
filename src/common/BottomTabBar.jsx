import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { Home, Sprout, Bot, ShoppingCart, User } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const MUTED = '#94A3B8';
const DARK = '#111827';
const BORDER = '#EEF2F3';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
const tabs = [
  {
    key: 'home',
    route: 'Home',
    label: 'Home',
    Icon: Home,
  },
  {
    key: 'farms',
    route: 'MyFarms',
    label: 'My Farms',
    Icon: Sprout,
  },
  {
    key: 'ai',
    route: 'AIGuru',
    label: 'AI Guru',
    Icon: Bot,
    center: true,
  },
  {
    key: 'bazaar',
    route: 'Bazaar',
    label: 'Bazaar',
    Icon: ShoppingCart,
  },
  {
    key: 'profile',
    route: 'Profile',
    label: 'Profile',
    Icon: User,
  },
];
export default function BottomTabBar({ navigation: navigationProp, active }) {
  const hookNavigation = useNavigation();
  const currentRoute = useRoute();
  const navigation = navigationProp || hookNavigation;
  const activeRoute = active || currentRoute?.name || 'Home';
  const handleNavigate = routeName => {
    if (!navigation || routeName === activeRoute) {
      return;
    }
    navigation.dispatch(
      CommonActions.navigate({
        name: routeName,
      }),
    );
  };
  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View style={styles.bar}>
        {tabs.map(tab => {
          const Icon = tab.Icon;
          const activeTab =
            activeRoute === tab.route || activeRoute === tab.label;
          if (tab.center) {
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.86}
                onPress={() => handleNavigate(tab.route)}
                style={styles.centerItem}
              >
                <View
                  style={[
                    styles.centerCircle,
                    activeTab && styles.activeCenterCircle,
                  ]}
                >
                  <Icon size={rf(26)} color="#FFFFFF" strokeWidth={2.5} />
                </View>

                <Text
                  style={[
                    styles.centerLabel,
                    activeTab && styles.activeCenterLabel,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.84}
              onPress={() => handleNavigate(tab.route)}
              style={styles.item}
            >
              <View
                style={[
                  styles.iconWrapper,
                  activeTab && styles.activeIconWrapper,
                ]}
              >
                <Icon
                  size={rf(21)}
                  color={activeTab ? GREEN : MUTED}
                  strokeWidth={activeTab ? 2.6 : 2.2}
                />
              </View>

              <Text
                numberOfLines={1}
                style={[styles.label, activeTab && styles.activeLabel]}
              >
                {tab.label}
              </Text>

              {activeTab && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  bar: {
    width: '100%',
    height: width < 360 ? 80 : 86,
    paddingHorizontal: width < 360 ? 4 : 8,
    paddingBottom: Platform.OS === 'ios' ? 8 : 5,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: -5,
    },
    elevation: 18,
  },
  item: {
    flex: 1,
    height: '100%',
    paddingTop: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 38,
    height: 31,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: '#ECF8F0',
  },
  label: {
    marginTop: 5,
    fontSize: rf(9),
    lineHeight: rf(12),
    fontWeight: '700',
    color: MUTED,
    textAlign: 'center',
  },
  activeLabel: {
    color: GREEN,
    fontWeight: '900',
  },
  activeDot: {
    width: 4,
    height: 4,
    marginTop: 4,
    borderRadius: 2,
    backgroundColor: GREEN,
  },
  centerItem: {
    flex: 1.15,
    height: '100%',
    marginTop: -38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCircle: {
    width: width < 360 ? 57 : 63,
    height: width < 360 ? 57 : 63,
    borderRadius: 32,
    backgroundColor: GREEN,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 10,
  },
  activeCenterCircle: {
    backgroundColor: '#116F32',
    transform: [
      {
        scale: 1.04,
      },
    ],
  },
  centerLabel: {
    marginTop: 5,
    fontSize: rf(9),
    lineHeight: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  activeCenterLabel: {
    color: GREEN,
  },
});
