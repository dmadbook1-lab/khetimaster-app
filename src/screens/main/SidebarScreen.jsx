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
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { selectProfileCompleted } from '../../redux/slices/authSlice';
import useAccountSummary from '../../common/useAccountSummary';
import { getLanguageLabel } from '../../utils/languageUtils';
import { COMMUNITY_ROUTES } from '../../constants/communityRoutes';
import { DOCTOR_ROUTES } from '../../constants/doctorRoutes';
import { MARKET_ROUTES } from '../../constants/marketRoutes';
import {
  APP_VERSION,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  callSupport,
  canRateApp,
  emailSupport,
  openStoreListing,
} from '../../constants/appInfo';
import {
  ArrowLeft,
  UserRound,
  BadgeCheck,
  MapPin,
  Zap,
  SlidersHorizontal,
  ChartNoAxesColumnIncreasing,
  Bot,
  Package,
  Settings,
  UsersRound,
  Navigation,
  Sun,
  IndianRupee,
  Landmark,
  MessagesSquare,
  Clapperboard,
  Stethoscope,
  Handshake,
  LifeBuoy,
  Mail,
  Phone,
  Star,
  ChevronRight,
  CircleAlert,
  Languages,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const DARK_GREEN = '#127536';
const DARK = '#172033';
const PAGE_BG = '#F6F8FA';
const BORDER = '#E8EDF1';
const SCREEN_HORIZONTAL_PADDING = Math.max(16, width * 0.045);
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

// Live count badge, hidden when nothing is open
const countBadge = (label, count) =>
  count > 0
    ? {
        badge: label,
        badgeColor: '#D97706',
        badgeBackground: '#FFF0C8',
      }
    : {};

export default function SidebarScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const profileCompleted = useSelector(selectProfileCompleted);
  const {
    user,
    farms,
    farmCount,
    totalAcres,
    crops,
    activeOrders,
    activeMachinery,
    activeLabour,
    activeConsultations,
    activeDeals,
    aiChats,
    refresh,
    refreshing,
  } = useAccountSummary();

  const userName = user?.fullName || user?.name || t('common.farmer');
  const userLocation =
    [user?.village, user?.taluka, user?.district, user?.state]
      .filter(Boolean)
      .join(', ') || t('sidebar.add_village');
  const profileImage = user?.profileImage || user?.profilePicture;
  const displayedCrops = crops.length > 0 ? crops.slice(0, 2) : [t('common.no_crops')];

  const FARM_MENU = [
    {
      id: 'my-farms',
      title: t('menu.my_farms'),
      subtitle:
        farmCount > 0
          ? t(
              farmCount === 1
                ? 'sidebar.field_acres_one'
                : 'sidebar.field_acres_other',
              { n: farmCount, acres: totalAcres.toFixed(2) },
            )
          : t('sidebar.add_first_field'),
      Icon: SlidersHorizontal,
      iconColor: '#16A34A',
      iconBackground: '#ECFDF3',
      route: 'MyFarms',
    },
    {
      id: 'farm-reports',
      title: t('menu.farm_reports'),
      subtitle:
        farmCount === 1
          ? t('sidebar.crop_health_for', {
              name: farms[0]?.fieldName || t('sidebar.your_farm'),
            })
          : t('sidebar.crop_health_reports'),
      Icon: ChartNoAxesColumnIncreasing,
      iconColor: '#2563EB',
      iconBackground: '#EFF6FF',
      // one farm opens its report directly; several go to the farm list
      onPress: () =>
        farmCount === 1
          ? navigation.navigate('FarmOverview', { farm: farms[0] })
          : navigation.navigate('MyFarms'),
    },
    {
      id: 'advisory-history',
      title: t('menu.ai_guru_chats'),
      subtitle:
        aiChats > 0
          ? t(
              aiChats === 1
                ? 'sidebar.past_chats_one'
                : 'sidebar.past_chats_other',
              { n: aiChats },
            )
          : t('sidebar.ask_about_crops'),
      Icon: Bot,
      iconColor: '#6366F1',
      iconBackground: '#EEF2FF',
      route: 'AIGuru',
    },
  ];

  const ACTIVITY_MENU = [
    {
      id: 'orders',
      title: t('menu.my_orders'),
      Icon: Package,
      iconColor: '#F59E0B',
      iconBackground: '#FFF9E8',
      route: 'MyOrders',
      ...countBadge(t('common.active_count', { n: activeOrders }), activeOrders),
    },
    {
      id: 'machinery',
      title: t('menu.machinery_bookings'),
      Icon: Settings,
      iconColor: '#FB4B69',
      iconBackground: '#FFF0F3',
      route: 'MachineryMyBookings',
      ...countBadge(t('common.active_count', { n: activeMachinery }), activeMachinery),
    },
    {
      id: 'labour',
      title: t('menu.labour_bookings'),
      Icon: UsersRound,
      iconColor: '#3B82F6',
      iconBackground: '#EFF6FF',
      route: 'MyBookings',
      ...countBadge(t('common.active_count', { n: activeLabour }), activeLabour),
    },
    {
      id: 'consultations',
      title: t('menu.doctor_consultations'),
      Icon: Stethoscope,
      iconColor: '#0D9488',
      iconBackground: '#E6FAF7',
      route: DOCTOR_ROUTES.MY_CONSULTATIONS,
      ...countBadge(t('common.active_count', { n: activeConsultations }), activeConsultations),
    },
    {
      id: 'deals',
      title: t('menu.market_deals'),
      Icon: Handshake,
      iconColor: '#7C3AED',
      iconBackground: '#F3EEFF',
      route: MARKET_ROUTES.DEALS,
      ...countBadge(t('common.open_count', { n: activeDeals }), activeDeals),
    },
    {
      id: 'drone',
      title: t('menu.drone_services'),
      Icon: Navigation,
      iconColor: '#0EA5E9',
      iconBackground: '#ECF9FF',
      route: 'DroneServices',
    },
  ];

  const SMART_FARMING_MENU = [
    {
      id: 'weather',
      title: t('menu.weather'),
      Icon: Sun,
      iconColor: '#EAB308',
      iconBackground: '#FFFBEA',
      route: 'Weather',
    },
    {
      id: 'mandi',
      title: t('menu.mandi_prices'),
      Icon: IndianRupee,
      iconColor: '#16A34A',
      iconBackground: '#ECFDF3',
      route: 'MandiHome',
    },
    {
      id: 'schemes',
      title: t('menu.government_schemes'),
      Icon: Landmark,
      iconColor: '#A855F7',
      iconBackground: '#FAF5FF',
      route: 'GovernmentSchemes',
    },
    {
      id: 'community',
      title: t('menu.community'),
      Icon: MessagesSquare,
      iconColor: '#F97316',
      iconBackground: '#FFF7ED',
      route: COMMUNITY_ROUTES.HOME,
    },
    {
      id: 'reels',
      title: t('menu.field_reels'),
      Icon: Clapperboard,
      iconColor: '#E11D48',
      iconBackground: '#FFF1F3',
      route: COMMUNITY_ROUTES.REELS,
    },
  ];

  const SUPPORT_MENU = [
    {
      id: 'help',
      title: t('menu.help_center'),
      subtitle: t('menu.help_center_sub'),
      Icon: LifeBuoy,
      iconColor: '#2563EB',
      iconBackground: '#EFF6FF',
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
      id: 'contact',
      title: t('menu.call_us'),
      subtitle: SUPPORT_PHONE,
      Icon: Phone,
      iconColor: '#16A34A',
      iconBackground: '#ECFDF3',
      onPress: callSupport,
    },
    canRateApp && {
      id: 'rate',
      title: t('menu.rate_app'),
      Icon: Star,
      iconColor: '#EAB308',
      iconBackground: '#FFFBEA',
      onPress: openStoreListing,
    },
  ].filter(Boolean);

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };
  const handleMenuPress = item => {
    if (item.onPress) {
      item.onPress();
      return;
    }
    navigation.navigate(item.route);
  };
  const handleChangeLanguage = () =>
    navigation.navigate('language', { fromSettings: true });
  const handleViewProfile = () => {
    navigation.navigate(profileCompleted ? 'Profile' : 'ProfileSetup', {
      mode: 'edit',
    });
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_GREEN} />

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
        <View style={styles.profileHeader}>
          <View style={styles.profileDecorCircleOne} />
          <View style={styles.profileDecorCircleTwo} />

          <View style={styles.profileTopRow}>
            <View style={styles.profileImageWrapper}>
              <Image
                source={
                  profileImage
                    ? {
                        uri: profileImage,
                      }
                    : require('../../assets/images/farmerr.jpg')
                }
                style={styles.profileImage}
                resizeMode="cover"
              />

              <View style={styles.onlineDot} />
            </View>

            <View style={styles.profileDetails}>
              <Text numberOfLines={1} style={styles.profileName}>
                {userName}
              </Text>

              <View style={styles.profileMetaRow}>
                {profileCompleted ? (
                  <BadgeCheck
                    size={rf(15)}
                    color="#FFFFFF"
                    fill="#FFFFFF"
                    strokeWidth={2.4}
                  />
                ) : (
                  <CircleAlert
                    size={rf(15)}
                    color="#FDE68A"
                    strokeWidth={2.4}
                  />
                )}

                <Text style={styles.profileMetaText}>
                  {profileCompleted
                    ? t('sidebar.verified_farmer')
                    : t('sidebar.complete_your_profile')}
                </Text>
              </View>

              <View style={styles.profileMetaRow}>
                <MapPin
                  size={rf(15)}
                  color="rgba(255,255,255,0.86)"
                  strokeWidth={2.3}
                />

                <Text numberOfLines={1} style={styles.profileMetaText}>
                  {userLocation}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBack}
              style={styles.closeButton}
            >
              <ArrowLeft size={rf(22)} color={DARK} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={handleViewProfile}
              style={[styles.headerButton, styles.viewProfileButton]}
            >
              <UserRound size={rf(18)} color="#FFFFFF" strokeWidth={2.3} />

              <Text numberOfLines={1} style={styles.viewProfileText}>
                {profileCompleted
                  ? t('sidebar.view_profile')
                  : t('sidebar.complete_profile')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.86}
              onPress={handleChangeLanguage}
              accessibilityLabel={t('menu.app_language')}
              style={[styles.headerButton, styles.languageButton]}
            >
              <Languages size={rf(18)} color="#FFFFFF" strokeWidth={2.3} />

              <Text numberOfLines={1} style={styles.viewProfileText}>
                {getLanguageLabel(i18n.language).native}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('MyFarms')}
          style={styles.farmingSummaryCard}
        >
          <View style={styles.summaryIdentity}>
            <View style={styles.summaryIconBox}>
              <Zap size={rf(22)} color={GREEN} strokeWidth={2.5} />
            </View>

            <Text style={styles.summaryTitle}>{t('sidebar.my_farming')}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <SummaryStat value={String(farmCount)} label={t('common.farms')} />

          <View style={styles.summaryDivider} />

          <SummaryStat value={totalAcres.toFixed(2)} label={t('common.acres')} />

          <View style={styles.summaryDivider} />

          <View style={styles.cropStat}>
            {displayedCrops.map((crop, index) => (
              <Text
                key={`${crop}-${index}`}
                numberOfLines={1}
                style={styles.cropText}
              >
                {crop}
              </Text>
            ))}
            {crops.length > 2 && (
              <Text style={styles.cropMore}>
                {t('common.more_count', { n: crops.length - 2 })}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.pageContent}>
          <MenuSection
            title={t('menu.my_farm')}
            items={FARM_MENU}
            onPress={handleMenuPress}
          />

          <MenuSection
            title={t('menu.my_activity')}
            items={ACTIVITY_MENU}
            onPress={handleMenuPress}
          />

          <MenuSection
            title={t('menu.smart_farming')}
            items={SMART_FARMING_MENU}
            onPress={handleMenuPress}
          />

          <MenuSection
            title={t('menu.support')}
            items={SUPPORT_MENU}
            onPress={handleMenuPress}
          />

          <View style={styles.brandFooter}>
            <Image
              source={require('../../assets/images/logoo.png')}
              style={styles.footerLogo}
              resizeMode="contain"
            />

            <Text style={styles.versionText}>
              {t('common.version', { version: APP_VERSION })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
function SummaryStat({ value, label }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryStatValue}>{value}</Text>

      <Text style={styles.summaryStatLabel}>{label}</Text>
    </View>
  );
}
function MenuSection({ title, items, onPress }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>

      <View style={styles.menuCard}>
        {items.map((item, index) => (
          <MenuItem
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
function MenuItem({ item, onPress, isLast }) {
  const Icon = item.Icon;
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
    >
      <View
        style={[
          styles.menuIconBox,
          {
            backgroundColor: item.iconBackground,
          },
        ]}
      >
        <Icon size={rf(22)} color={item.iconColor} strokeWidth={2.3} />
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
        <View
          style={[
            styles.menuBadge,
            {
              backgroundColor: item.badgeBackground,
            },
          ]}
        >
          <Text
            style={[
              styles.menuBadgeText,
              {
                color: item.badgeColor,
              },
            ]}
          >
            {item.badge}
          </Text>
        </View>
      )}

      <ChevronRight size={rf(19)} color="#AAB2BE" strokeWidth={2.2} />
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scrollContent: {
    paddingBottom: 30,
    backgroundColor: PAGE_BG,
  },
  profileHeader: {
    minHeight: 218,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: width < 360 ? 20 : 26,
    paddingBottom: 49,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    backgroundColor: DARK_GREEN,
    overflow: 'hidden',
  },
  profileDecorCircleOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -65,
    top: -90,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  profileDecorCircleTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    left: -55,
    bottom: -70,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageWrapper: {
    width: width < 360 ? 62 : 70,
    height: width < 360 ? 62 : 70,
    borderRadius: width < 360 ? 18 : 21,
    backgroundColor: '#F3D3A4',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: width < 360 ? 17 : 20,
  },
  onlineDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: DARK_GREEN,
  },
  profileDetails: {
    flex: 1,
    marginLeft: width < 360 ? 12 : 16,
    marginRight: 8,
  },
  profileName: {
    fontSize: rf(22),
    lineHeight: rf(27),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  profileMetaRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileMetaText: {
    flexShrink: 1,
    fontSize: rf(12),
    lineHeight: rf(16),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.83)',
  },
  closeButton: {
    width: width < 360 ? 42 : 46,
    height: width < 360 ? 42 : 46,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#062F19',
    shadowOpacity: 0.16,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },
  headerActions: {
    marginTop: 25,
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    height: 47,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.34)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  viewProfileButton: {
    flex: 1,
  },
  languageButton: {
    maxWidth: '45%',
    paddingHorizontal: 16,
  },
  viewProfileText: {
    flexShrink: 1,
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  farmingSummaryCard: {
    minHeight: 82,
    marginHorizontal: SCREEN_HORIZONTAL_PADDING + 26,
    marginTop: -23,
    borderRadius: 24,
    paddingHorizontal: width < 360 ? 11 : 15,
    backgroundColor: '#ECFAF1',
    borderWidth: 1.2,
    borderColor: '#C7EFD4',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#15803D',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },
  summaryIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconBox: {
    width: width < 360 ? 39 : 43,
    height: width < 360 ? 39 : 43,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    marginLeft: 9,
    fontSize: rf(12),
    fontWeight: '900',
    color: GREEN,
  },
  summaryDivider: {
    width: 1,
    height: 31,
    marginHorizontal: width < 360 ? 7 : 10,
    backgroundColor: '#BDE8CA',
  },
  summaryStat: {
    minWidth: width < 360 ? 31 : 36,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: rf(15),
    lineHeight: rf(18),
    fontWeight: '900',
    color: DARK,
  },
  summaryStatLabel: {
    marginTop: 2,
    fontSize: rf(8),
    fontWeight: '600',
    color: '#7E8796',
  },
  cropStat: {
    flexShrink: 1,
  },
  cropText: {
    fontSize: rf(9),
    lineHeight: rf(12),
    fontWeight: '900',
    color: DARK,
    textTransform: 'capitalize',
  },
  cropMore: {
    fontSize: rf(8),
    fontWeight: '700',
    color: GREEN,
  },
  pageContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  section: {
    marginTop: 34,
  },
  sectionLabel: {
    marginLeft: 14,
    marginBottom: 13,
    fontSize: rf(11),
    lineHeight: rf(14),
    fontWeight: '900',
    color: '#A1A9B7',
    letterSpacing: 1.1,
  },
  menuCard: {
    borderRadius: 23,
    paddingHorizontal: width < 360 ? 13 : 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#0F172A',
    shadowOpacity: Platform.OS === 'ios' ? 0.045 : 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },
  menuItem: {
    minHeight: width < 360 ? 76 : 84,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F3',
  },
  menuIconBox: {
    width: width < 360 ? 47 : 52,
    height: width < 360 ? 47 : 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextBox: {
    flex: 1,
    marginLeft: width < 360 ? 12 : 15,
    marginRight: 7,
  },
  menuTitle: {
    fontSize: rf(15),
    lineHeight: rf(19),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.15,
  },
  menuSubtitle: {
    marginTop: 3,
    fontSize: rf(11),
    lineHeight: rf(14),
    fontWeight: '500',
    color: '#A0A8B5',
  },
  menuBadge: {
    minHeight: 23,
    marginRight: 10,
    paddingHorizontal: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBadgeText: {
    fontSize: rf(8),
    fontWeight: '900',
  },
  brandFooter: {
    paddingTop: 50,
    paddingBottom: 8,
    alignItems: 'center',
  },
  footerLogo: {
    width: Math.min(width * 0.43, 185),
    height: 68,
  },
  versionText: {
    marginTop: 9,
    fontSize: rf(9),
    fontWeight: '600',
    color: '#CDD2D9',
  },
});
