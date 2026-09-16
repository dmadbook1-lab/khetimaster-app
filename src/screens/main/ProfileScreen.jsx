
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import {
  logout,
  selectIsLoading,
  selectUser,
} from '../../redux/slices/authSlice';

import {
  SlidersHorizontal,
  BadgeCheck,
  CalendarDays,
  Pencil,
  UserRound,
  MapPin,
  Languages,
  Bell,
  CreditCard,
  Shield,
  LifeBuoy,
  Star,
  FileText,
  ChevronRight,
  LogOut,
  Info,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const GREEN = '#16883E';
const DARK_GREEN = '#116F32';
const DARK = '#1D2738';
const MUTED = '#94A3B8';
const PAGE_BG = '#FFFFFF';
const BORDER = '#EDF0F2';
const RED = '#FF3D4D';

const PAGE_PADDING = Math.max(16, width * 0.037);

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size - 2,
    Math.min(size * scale, size + 2),
  );
};

/*
|--------------------------------------------------------------------------
| ACCOUNT ITEMS
|--------------------------------------------------------------------------
*/

const ACCOUNT_ITEMS = [
  {
    id: 'personal-details',
    title: 'Personal Details',
    subtitle: 'Name, mobile, address',
    Icon: UserRound,
    iconColor: '#16A34A',
    iconBackground: '#DDF8E8',
    route: 'ProfileSetup',
  },
  {
    id: 'addresses',
    title: 'My Addresses',
    subtitle: 'Delivery and farm addresses',
    Icon: MapPin,
    iconColor: '#D89200',
    iconBackground: '#FFF7D9',
    route: null,
  },
  {
    id: 'language',
    title: 'Language',
    subtitle: 'English',
    Icon: Languages,
    iconColor: '#9333EA',
    iconBackground: '#F5E8FF',
    route: 'language',
  },
];

/*
|--------------------------------------------------------------------------
| PREFERENCE ITEMS
|--------------------------------------------------------------------------
*/

const PREFERENCE_ITEMS = [
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'Weather, advisory and updates',
    Icon: Bell,
    iconColor: '#F97316',
    iconBackground: '#FFF3E8',
    route: null,
  },
  {
    id: 'payments',
    title: 'Payments',
    subtitle: 'UPI and payment methods',
    Icon: CreditCard,
    iconColor: '#0F9F91',
    iconBackground: '#E7FAF7',
    route: null,
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    subtitle: 'Account safety',
    Icon: Shield,
    iconColor: '#2563EB',
    iconBackground: '#EAF1FF',
    route: null,
  },
];

/*
|--------------------------------------------------------------------------
| SUPPORT ITEMS
|--------------------------------------------------------------------------
*/

const SUPPORT_ITEMS = [
  {
    id: 'help',
    title: 'Help Center',
    Icon: LifeBuoy,
    iconColor: '#5B5FF0',
    iconBackground: '#EEF0FF',
    route: null,
  },
  {
    id: 'rate',
    title: 'Rate KhetiMaster',
    Icon: Star,
    iconColor: '#D99A00',
    iconBackground: '#FFF9DF',
    route: null,
  },
  {
    id: 'terms',
    title: 'Terms & Policies',
    Icon: FileText,
    iconColor: '#64748B',
    iconBackground: '#EEF2F7',
    route: null,
  },
];

/*
|--------------------------------------------------------------------------
| PROFILE SCREEN
|--------------------------------------------------------------------------
*/

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();

  const isLoading = useSelector(selectIsLoading);
  const user = useSelector(selectUser);

  /*
  |--------------------------------------------------------------------------
  | USER DATA
  |--------------------------------------------------------------------------
  */

  const profileName =
    user?.fullName ||
    user?.name ||
    'User';

  const email =
    user?.email ||
    '';

  const phoneNumber =
    user?.phoneNumber ||
    user?.phone ||
    '';

  const language =
    user?.language ||
    'English';

  const state =
    user?.state ||
    '';

  const district =
    user?.district ||
    '';

  const taluka =
    user?.taluka ||
    '';

  const village =
    user?.village ||
    '';

  const profileImage =
    user?.profileImage ||
    user?.profilePicture ||
    null;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : '2026';

  /*
  |--------------------------------------------------------------------------
  | LOCATION
  |--------------------------------------------------------------------------
  |
  | Village → Taluka → District → State
  |
  */

  const locationText = [
    village,
    taluka,
    district,
    state,
  ]
    .filter(Boolean)
    .join(', ');

  /*
  |--------------------------------------------------------------------------
  | ACCOUNT ITEMS
  |--------------------------------------------------------------------------
  */

  const accountItems = ACCOUNT_ITEMS.map(item => {
    if (item.id === 'personal-details') {
      return {
        ...item,
        subtitle:
          [phoneNumber, locationText]
            .filter(Boolean)
            .join(' • ') ||
          'Name, mobile, address',
      };
    }

    if (item.id === 'language') {
      return {
        ...item,
        subtitle: language,
      };
    }

    return item;
  });

  /*
  |--------------------------------------------------------------------------
  | MENU ITEM PRESS
  |--------------------------------------------------------------------------
  */

  const handleItemPress = item => {
    /*
    |--------------------------------------------------------------------------
    | PERSONAL DETAILS
    |--------------------------------------------------------------------------
    |
    | Open ProfileSetup in edit mode.
    |
    */

    if (item.id === 'personal-details') {
      navigation.navigate('ProfileSetup', {
        mode: 'edit',
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | OTHER ROUTES
    |--------------------------------------------------------------------------
    */

    if (item.route) {
      navigation.navigate(item.route);
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | PLACEHOLDER ITEMS
    |--------------------------------------------------------------------------
    */

    Alert.alert(
      item.title,
      `${item.title} screen will be connected here.`,
    );
  };

  /*
  |--------------------------------------------------------------------------
  | EDIT PROFILE
  |--------------------------------------------------------------------------
  */

  const handleEditProfile = () => {
    navigation.navigate('ProfileSetup', {
      mode: 'edit',
    });
  };

  /*
  |--------------------------------------------------------------------------
  | SETTINGS
  |--------------------------------------------------------------------------
  */

  const handleSettingsPress = () => {
    Alert.alert(
      'Profile Settings',
      'Additional profile settings can be opened here.',
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    if (isLoading) {
      return;
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',

          onPress: async () => {
            try {
              const result =
                await dispatch(logout());

              if (
                logout.fulfilled.match(result)
              ) {
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Login',
                    },
                  ],
                });

                return;
              }

              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Login',
                  },
                ],
              });
            } catch (error) {
              console.log(
                'Logout screen error:',
                error,
              );

              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Login',
                  },
                ],
              });
            }
          },
        },
      ],
    );
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Profile
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSettingsPress}
          style={styles.settingsButton}
        >
          <SlidersHorizontal
            size={rf(21)}
            color={DARK}
            strokeWidth={2.2}
          />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* PROFILE HERO */}

        <View style={styles.profileHero}>
          <View
            style={styles.heroDecorCircleOne}
          />

          <View
            style={styles.heroDecorCircleTwo}
          />

          {/* PROFILE IMAGE */}

          <View style={styles.avatarWrapper}>
            {profileImage ? (
              <Image
                source={{
                  uri: profileImage,
                }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('../../assets/images/farmerr.jpg')}
                style={styles.avatar}
                resizeMode="cover"
              />
            )}
          </View>

          {/* NAME */}

          <Text
            numberOfLines={1}
            style={styles.profileName}
          >
            {profileName}
          </Text>

          {/* BADGES */}

          <View style={styles.badgesRow}>
            <View style={styles.verifiedBadge}>
              <BadgeCheck
                size={rf(13)}
                color="#FFFFFF"
                fill="#FFFFFF"
                strokeWidth={2.4}
              />

              <Text
                style={
                  styles.verifiedBadgeText
                }
              >
                Verified Farmer
              </Text>
            </View>

            <View style={styles.memberBadge}>
              <CalendarDays
                size={rf(13)}
                color="#FFFFFF"
                strokeWidth={2.4}
              />

              <Text
                style={styles.memberBadgeText}
              >
                Member Since {memberSince}
              </Text>
            </View>
          </View>

          {/* EDIT PROFILE */}

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleEditProfile}
            style={styles.editProfileButton}
          >
            <Pencil
              size={rf(17)}
              color={GREEN}
              strokeWidth={2.3}
            />

            <Text
              style={styles.editProfileText}
            >
              Edit Profile
            </Text>
          </TouchableOpacity>

          {/* TAGLINE */}

          <Text style={styles.heroTagline}>
            GROWING SMARTER WITH KHETIMASTER
          </Text>
        </View>

        {/* ACCOUNT */}

        <ProfileSection
          title="ACCOUNT"
          items={accountItems}
          onPress={handleItemPress}
        />

        {/* PREFERENCES */}

        <ProfileSection
          title="PREFERENCES"
          items={PREFERENCE_ITEMS}
          onPress={handleItemPress}
        />

        {/* SUPPORT */}

        <ProfileSection
          title="SUPPORT"
          items={SUPPORT_ITEMS}
          onPress={handleItemPress}
        />

        {/* LOGOUT */}

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleLogout}
          disabled={isLoading}
          style={[
            styles.logoutButton,
            isLoading &&
              styles.logoutButtonDisabled,
          ]}
        >
          <LogOut
            size={rf(19)}
            color={RED}
            strokeWidth={2.3}
          />

          <Text style={styles.logoutText}>
            {isLoading
              ? 'Logging out...'
              : 'Logout'}
          </Text>
        </TouchableOpacity>

        {/* VERSION */}

        <View style={styles.versionRow}>
          <Info
            size={rf(13)}
            color="#A4ACB8"
            fill="#A4ACB8"
          />

          <Text style={styles.versionText}>
            KhetiMaster v2.4.1
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| PROFILE SECTION
|--------------------------------------------------------------------------
*/

function ProfileSection({
  title,
  items,
  onPress,
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <ProfileMenuItem
            key={item.id}
            item={item}
            onPress={() => onPress(item)}
            isLast={
              index === items.length - 1
            }
          />
        ))}
      </View>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| PROFILE MENU ITEM
|--------------------------------------------------------------------------
*/

function ProfileMenuItem({
  item,
  onPress,
  isLast,
}) {
  const Icon = item.Icon;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.menuItem,
        !isLast &&
          styles.menuItemBorder,
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor:
              item.iconBackground,
          },
        ]}
      >
        <Icon
          size={rf(21)}
          color={item.iconColor}
          strokeWidth={2.2}
        />
      </View>

      <View style={styles.menuTextBox}>
        <Text
          numberOfLines={1}
          style={styles.menuTitle}
        >
          {item.title}
        </Text>

        {!!item.subtitle && (
          <Text
            numberOfLines={1}
            style={styles.menuSubtitle}
          >
            {item.subtitle}
          </Text>
        )}
      </View>

      <ChevronRight
        size={rf(20)}
        color="#9AA9BC"
        strokeWidth={2.2}
      />
    </TouchableOpacity>
  );
}

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },

  header: {
    height: 65,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },

  headerTitle: {
    fontSize: rf(24),
    lineHeight: rf(29),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.45,
  },

  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#111827',
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: 33,
  },

  /*
  |--------------------------------------------------------------------------
  | PROFILE HERO
  |--------------------------------------------------------------------------
  */

  profileHero: {
    minHeight: 325,
    marginTop: 10,
    borderRadius: 31,
    paddingHorizontal: 18,
    paddingTop: 27,
    paddingBottom: 21,
    backgroundColor: DARK_GREEN,
    alignItems: 'center',
    overflow: 'hidden',

    shadowColor: '#0B5D2A',
    shadowOpacity:
      Platform.OS === 'ios'
        ? 0.18
        : 0.25,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 9,
    },

    elevation: 8,
  },

  heroDecorCircleOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -72,
    top: -85,
    backgroundColor:
      'rgba(255,255,255,0.035)',
  },

  heroDecorCircleTwo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    left: -63,
    bottom: -80,
    backgroundColor:
      'rgba(255,255,255,0.035)',
  },

  avatarWrapper: {
    width: width < 360 ? 86 : 94,
    height: width < 360 ? 86 : 94,
    borderRadius: 13,
    backgroundColor: '#E6C196',
    borderWidth: 2,
    borderColor:
      'rgba(255,255,255,0.35)',
    overflow: 'hidden',

    shadowColor: '#062D17',
    shadowOpacity: 0.16,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  avatar: {
    width: '100%',
    height: '100%',
  },

  profileName: {
    marginTop: 18,
    maxWidth: '90%',
    fontSize: rf(22),
    lineHeight: rf(27),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.35,
  },

  badgesRow: {
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },

  verifiedBadge: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor:
      'rgba(255,255,255,0.24)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  verifiedBadgeText: {
    fontSize: rf(10),
    fontWeight: '800',
    color: '#FFFFFF',
  },

  memberBadge: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#E97813',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  memberBadgeText: {
    fontSize: rf(10),
    fontWeight: '800',
    color: '#FFFFFF',
  },

  editProfileButton: {
    height: 42,
    marginTop: 24,
    paddingHorizontal: 24,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,

    shadowColor: '#062D17',
    shadowOpacity: 0.11,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  editProfileText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: GREEN,
  },

  heroTagline: {
    marginTop: 18,
    fontSize: rf(8),
    lineHeight: rf(11),
    fontWeight: '700',
    color:
      'rgba(255,255,255,0.76)',
    letterSpacing: 1.4,
  },

  /*
  |--------------------------------------------------------------------------
  | SECTION
  |--------------------------------------------------------------------------
  */

  section: {
    marginTop: 34,
  },

  sectionTitle: {
    marginLeft: 1,
    marginBottom: 13,
    fontSize: rf(10),
    lineHeight: rf(13),
    fontWeight: '900',
    color: '#778193',
    letterSpacing: 1.1,
  },

  sectionCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F3F5',

    shadowColor: '#111827',
    shadowOpacity:
      Platform.OS === 'ios'
        ? 0.035
        : 0.07,
    shadowRadius: 11,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  menuItem: {
    minHeight:
      width < 360 ? 69 : 73,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F3',
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuTextBox: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },

  menuTitle: {
    fontSize: rf(13),
    lineHeight: rf(17),
    fontWeight: '900',
    color: DARK,
  },

  menuSubtitle: {
    marginTop: 3,
    fontSize: rf(10),
    lineHeight: rf(13),
    fontWeight: '500',
    color: MUTED,
  },

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  logoutButton: {
    height: 57,
    marginTop: 43,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFCACA',
    backgroundColor: '#FFF5F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  logoutButtonDisabled: {
    opacity: 0.6,
  },

  logoutText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: RED,
  },

  /*
  |--------------------------------------------------------------------------
  | VERSION
  |--------------------------------------------------------------------------
  */

  versionRow: {
    marginTop: 23,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  versionText: {
    fontSize: rf(10),
    fontWeight: '600',
    color: '#A4ACB8',
  },
});
