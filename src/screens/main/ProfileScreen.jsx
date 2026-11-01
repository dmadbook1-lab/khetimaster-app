import React, { useState } from 'react';
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
  Linking,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { logout, selectProfileCompleted } from '../../redux/slices/authSlice';
import {
  selectAiGuru,
  setAiGuruLanguage,
} from '../../redux/slices/aiGuruSlice';
import BottomTabBar from '../../common/BottomTabBar';
import useAccountSummary from '../../common/useAccountSummary';
import { getLanguageLabel } from '../../utils/languageUtils';
import { DOCTOR_ROUTES } from '../../constants/doctorRoutes';
import { MARKET_ROUTES } from '../../constants/marketRoutes';
import {
  APP_VERSION,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  TERMS_URL,
  callSupport,
  canRateApp,
  emailSupport,
  openStoreListing,
  openTerms,
} from '../../constants/appInfo';

import {
  Settings2,
  Globe,
  BadgeCheck,
  CalendarDays,
  CircleAlert,
  Pencil,
  UserRound,
  MapPin,
  Languages,
  Bell,
  Package,
  Settings,
  UsersRound,
  Stethoscope,
  Handshake,
  LifeBuoy,
  Mail,
  Phone,
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

  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

// Languages AI Guru can reply in (besides the app language)
const REPLY_LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिन्दी (Hindi)' },
  { id: 'mr', label: 'मराठी (Marathi)' },
];

const countBadge = (label, count) => (count > 0 ? label : null);

/*
|--------------------------------------------------------------------------
| PROFILE SCREEN
|--------------------------------------------------------------------------
*/

export default function ProfileScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const profileCompleted = useSelector(selectProfileCompleted);
  const { language: replyLanguage } = useSelector(selectAiGuru);
  const {
    user,
    farmCount,
    totalAcres,
    activeOrders,
    activeMachinery,
    activeLabour,
    activeConsultations,
    activeDeals,
    refresh,
    refreshing,
  } = useAccountSummary();

  const [loggingOut, setLoggingOut] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | USER DATA
  |--------------------------------------------------------------------------
  */

  const profileName = user?.fullName || user?.name || t('common.farmer');
  const phoneNumber = user?.phoneNumber || user?.phone || '';
  const profileImage = user?.profileImage || user?.profilePicture || null;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : null;

  // Village → Taluka → District → State
  const locationText = [
    user?.village,
    user?.taluka,
    user?.district,
    user?.state,
  ]
    .filter(Boolean)
    .join(', ');

  const openBookings = activeMachinery + activeLabour + activeConsultations;
  const replyLanguageLabel =
    REPLY_LANGUAGES.find(item => item.id === replyLanguage)?.label ||
    getLanguageLabel(replyLanguage).native;

  /*
  |--------------------------------------------------------------------------
  | ACTIONS
  |--------------------------------------------------------------------------
  */

  const editProfile = () =>
    navigation.navigate('ProfileSetup', { mode: 'edit' });

  const chooseReplyLanguage = () =>
    Alert.alert(t('profile.ai_language_title'), t('profile.ai_language_question'), [
      ...REPLY_LANGUAGES.map(item => ({
        text: item.id === replyLanguage ? `✓ ${item.label}` : item.label,
        onPress: () => dispatch(setAiGuruLanguage(item.id)),
      })),
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  const openAppLanguage = () =>
    navigation.navigate('language', { fromSettings: true });

  const openAppSettings = () =>
    Linking.openSettings().catch(() =>
      Alert.alert(t('common.settings'), t('profile.settings_fallback')),
    );

  /*
  |--------------------------------------------------------------------------
  | MENU ITEMS
  |--------------------------------------------------------------------------
  */

  const accountItems = [
    {
      id: 'personal-details',
      title: t('profile.personal_details'),
      subtitle: [profileName, phoneNumber].filter(Boolean).join(' • '),
      Icon: UserRound,
      iconColor: '#16A34A',
      iconBackground: '#DDF8E8',
      onPress: editProfile,
    },
    {
      id: 'app-language',
      title: t('menu.app_language'),
      subtitle: getLanguageLabel(i18n.language).native,
      Icon: Globe,
      iconColor: '#0D9488',
      iconBackground: '#E6FAF7',
      onPress: openAppLanguage,
    },
    {
      id: 'addresses',
      title: t('profile.farm_address'),
      subtitle: locationText || t('profile.add_village_district'),
      Icon: MapPin,
      iconColor: '#D89200',
      iconBackground: '#FFF7D9',
      onPress: editProfile,
    },
    {
      id: 'language',
      title: t('profile.ai_guru_language'),
      subtitle: t('profile.replies_in', { language: replyLanguageLabel }),
      Icon: Languages,
      iconColor: '#9333EA',
      iconBackground: '#F5E8FF',
      onPress: chooseReplyLanguage,
    },
  ];

  const activityItems = [
    {
      id: 'orders',
      title: t('menu.my_orders'),
      Icon: Package,
      iconColor: '#F59E0B',
      iconBackground: '#FFF9E8',
      route: 'MyOrders',
      badge: countBadge(t('common.active_count', { n: activeOrders }), activeOrders),
    },
    {
      id: 'machinery',
      title: t('menu.machinery_bookings'),
      Icon: Settings,
      iconColor: '#FB4B69',
      iconBackground: '#FFF0F3',
      route: 'MachineryMyBookings',
      badge: countBadge(t('common.active_count', { n: activeMachinery }), activeMachinery),
    },
    {
      id: 'labour',
      title: t('menu.labour_bookings'),
      Icon: UsersRound,
      iconColor: '#3B82F6',
      iconBackground: '#EFF6FF',
      route: 'MyBookings',
      badge: countBadge(t('common.active_count', { n: activeLabour }), activeLabour),
    },
    {
      id: 'consultations',
      title: t('menu.doctor_consultations'),
      Icon: Stethoscope,
      iconColor: '#0D9488',
      iconBackground: '#E6FAF7',
      route: DOCTOR_ROUTES.MY_CONSULTATIONS,
      badge: countBadge(t('common.active_count', { n: activeConsultations }), activeConsultations),
    },
    {
      id: 'deals',
      title: t('menu.market_deals'),
      Icon: Handshake,
      iconColor: '#7C3AED',
      iconBackground: '#F3EEFF',
      route: MARKET_ROUTES.DEALS,
      badge: countBadge(t('common.open_count', { n: activeDeals }), activeDeals),
    },
  ];

  const settingsItems = [
    {
      id: 'notifications',
      title: t('menu.notifications'),
      subtitle: t('menu.notifications_sub'),
      Icon: Bell,
      iconColor: '#F97316',
      iconBackground: '#FFF3E8',
      onPress: openAppSettings,
    },
  ];

  const supportItems = [
    {
      id: 'help',
      title: t('menu.help_center'),
      subtitle: t('menu.help_center_sub'),
      Icon: LifeBuoy,
      iconColor: '#5B5FF0',
      iconBackground: '#EEF0FF',
      route: 'AIGuru',
    },
    SUPPORT_EMAIL && {
      id: 'email',
      title: t('menu.email_us'),
      subtitle: SUPPORT_EMAIL,
      Icon: Mail,
      iconColor: '#0EA5E9',
      iconBackground: '#ECF9FF',
      onPress: emailSupport,
    },
    SUPPORT_PHONE && {
      id: 'call',
      title: t('menu.call_us'),
      subtitle: SUPPORT_PHONE,
      Icon: Phone,
      iconColor: '#16A34A',
      iconBackground: '#ECFDF3',
      onPress: callSupport,
    },
    canRateApp && {
      id: 'rate',
      title: t('menu.rate_khetimaster'),
      Icon: Star,
      iconColor: '#D99A00',
      iconBackground: '#FFF9DF',
      onPress: openStoreListing,
    },
    TERMS_URL && {
      id: 'terms',
      title: t('menu.terms_policies'),
      Icon: FileText,
      iconColor: '#64748B',
      iconBackground: '#EEF2F7',
      onPress: openTerms,
    },
  ].filter(Boolean);

  const handleItemPress = item => {
    if (item.onPress) {
      item.onPress();
      return;
    }

    navigation.navigate(item.route);
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const goToLogin = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });

  const handleLogout = () => {
    if (loggingOut) {
      return;
    }

    Alert.alert(t('common.logout'), t('profile.logout_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.logout'),
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await dispatch(logout());
          } catch (error) {
            console.log('Logout screen error:', error);
          }
          // local session is cleared either way
          goToLogin();
        },
      },
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openAppSettings}
          style={styles.settingsButton}
          accessibilityLabel={t('profile.app_settings')}
        >
          <Settings2 size={rf(21)} color={DARK} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={GREEN}
            colors={[GREEN]}
          />
        }
      >
        {/* PROFILE HERO */}

        <View style={styles.profileHero}>
          <View style={styles.heroDecorCircleOne} />
          <View style={styles.heroDecorCircleTwo} />

          <View style={styles.avatarWrapper}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require('../../assets/images/farmerr.jpg')
              }
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>

          <Text numberOfLines={1} style={styles.profileName}>
            {profileName}
          </Text>

          {!!locationText && (
            <View style={styles.locationRow}>
              <MapPin
                size={rf(13)}
                color="rgba(255,255,255,0.8)"
                strokeWidth={2.3}
              />
              <Text numberOfLines={1} style={styles.locationText}>
                {locationText}
              </Text>
            </View>
          )}

          {/* BADGES */}

          <View style={styles.badgesRow}>
            <TouchableOpacity
              activeOpacity={profileCompleted ? 1 : 0.85}
              onPress={profileCompleted ? undefined : editProfile}
              style={styles.verifiedBadge}
            >
              {profileCompleted ? (
                <BadgeCheck
                  size={rf(13)}
                  color="#FFFFFF"
                  fill="#FFFFFF"
                  strokeWidth={2.4}
                />
              ) : (
                <CircleAlert size={rf(13)} color="#FDE68A" strokeWidth={2.4} />
              )}

              <Text style={styles.verifiedBadgeText}>
                {profileCompleted
                  ? t('profile.verified_farmer')
                  : t('profile.complete_profile')}
              </Text>
            </TouchableOpacity>

            {memberSince && (
              <View style={styles.memberBadge}>
                <CalendarDays size={rf(13)} color="#FFFFFF" strokeWidth={2.4} />

                <Text style={styles.memberBadgeText}>
                  {t('profile.member_since', { year: memberSince })}
                </Text>
              </View>
            )}
          </View>

          {/* LIVE STATS */}

          <View style={styles.statsRow}>
            <HeroStat
              value={farmCount}
              label={farmCount === 1 ? t('common.farm') : t('common.farms')}
              onPress={() => navigation.navigate('MyFarms')}
            />
            <View style={styles.statDivider} />
            <HeroStat
              value={totalAcres.toFixed(1)}
              label={t('common.acres')}
              onPress={() => navigation.navigate('MyFarms')}
            />
            <View style={styles.statDivider} />
            <HeroStat
              value={openBookings}
              label={t('common.bookings')}
              onPress={() => navigation.navigate('MachineryMyBookings')}
            />
            <View style={styles.statDivider} />
            <HeroStat
              value={activeOrders}
              label={t('common.orders')}
              onPress={() => navigation.navigate('MyOrders')}
            />
          </View>

          {/* EDIT PROFILE */}

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={editProfile}
            style={styles.editProfileButton}
          >
            <Pencil size={rf(17)} color={GREEN} strokeWidth={2.3} />

            <Text style={styles.editProfileText}>{t('profile.edit_profile')}</Text>
          </TouchableOpacity>
        </View>

        <ProfileSection
          title={t('menu.account')}
          items={accountItems}
          onPress={handleItemPress}
        />

        <ProfileSection
          title={t('menu.my_activity')}
          items={activityItems}
          onPress={handleItemPress}
        />

        <ProfileSection
          title={t('menu.settings')}
          items={settingsItems}
          onPress={handleItemPress}
        />

        <ProfileSection
          title={t('menu.support')}
          items={supportItems}
          onPress={handleItemPress}
        />

        {/* LOGOUT */}

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleLogout}
          disabled={loggingOut}
          style={[
            styles.logoutButton,
            loggingOut && styles.logoutButtonDisabled,
          ]}
        >
          <LogOut size={rf(19)} color={RED} strokeWidth={2.3} />

          <Text style={styles.logoutText}>
            {loggingOut ? t('common.logging_out') : t('common.logout')}
          </Text>
        </TouchableOpacity>

        {/* VERSION */}

        <View style={styles.versionRow}>
          <Info size={rf(13)} color="#A4ACB8" fill="#A4ACB8" />

          <Text style={styles.versionText}>
            {t('common.app_version', { version: APP_VERSION })}
          </Text>
        </View>
      </ScrollView>

      <BottomTabBar navigation={navigation} active="Profile" />
    </SafeAreaView>
  );
}

function HeroStat({ value, label, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/*
|--------------------------------------------------------------------------
| PROFILE SECTION
|--------------------------------------------------------------------------
*/

function ProfileSection({ title, items, onPress }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <ProfileMenuItem
            key={item.id}
            item={item}
            onPress={() => onPress(item)}
            isLast={index === items.length - 1}
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

function ProfileMenuItem({ item, onPress, isLast }) {
  const Icon = item.Icon;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: item.iconBackground,
          },
        ]}
      >
        <Icon size={rf(21)} color={item.iconColor} strokeWidth={2.2} />
      </View>

      <View style={styles.menuTextBox}>
        <Text numberOfLines={1} style={styles.menuTitle}>
          {item.title}
        </Text>

        {!!item.subtitle && (
          <Text numberOfLines={1} style={styles.menuSubtitle}>
            {item.subtitle}
          </Text>
        )}
      </View>

      {!!item.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}

      <ChevronRight size={rf(20)} color="#9AA9BC" strokeWidth={2.2} />
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
    // clears the floating bottom bar
    paddingBottom: 120,
  },

  locationRow: {
    marginTop: 6,
    maxWidth: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  locationText: {
    flexShrink: 1,
    fontSize: rf(12),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.82)',
  },

  statsRow: {
    marginTop: 20,
    alignSelf: 'stretch',
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    fontSize: rf(18),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  statLabel: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
  },

  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  badge: {
    marginRight: 8,
    paddingHorizontal: 9,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#FFF0C8',
    justifyContent: 'center',
  },

  badgeText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#D97706',
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
    shadowOpacity: Platform.OS === 'ios' ? 0.18 : 0.25,
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
    backgroundColor: 'rgba(255,255,255,0.035)',
  },

  heroDecorCircleTwo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    left: -63,
    bottom: -80,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },

  avatarWrapper: {
    width: width < 360 ? 86 : 94,
    height: width < 360 ? 86 : 94,
    borderRadius: 13,
    backgroundColor: '#E6C196',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
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
    backgroundColor: 'rgba(255,255,255,0.24)',
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
    color: 'rgba(255,255,255,0.76)',
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
    shadowOpacity: Platform.OS === 'ios' ? 0.035 : 0.07,
    shadowRadius: 11,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  menuItem: {
    minHeight: width < 360 ? 69 : 73,
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
