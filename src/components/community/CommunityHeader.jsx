import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Clapperboard, Images, Search, UsersRound } from 'lucide-react-native';
import MarketHero, { GlassButton } from '../market/MarketHero';
import Avatar from './social/Avatar';
import { CARD_GUTTER, CARD_SHADOW, FIELD, rf } from './theme';
import { COMMUNITY_ROUTES } from '../../constants/communityRoutes';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';

export const COMMUNITY_TABS = [
  { id: 'Community', get label() {
    return i18n.t('communityHeader.discover');
  } },
  { id: 'Following', get label() {
    return i18n.t('communityHeader.myCircle');
  } },
  { id: 'Reels', get label() {
    return i18n.t('communityHeader.reels');
  } },
];

const HERO_POINTS = [
  { Icon: Images, get label() {
    return i18n.t('communityHeader.fieldUpdates');
  } },
  { Icon: Clapperboard, get label() {
    return i18n.t('communityHeader.shortReels');
  } },
  { Icon: UsersRound, get label() {
    return i18n.t('communityHeader.farmerCircle');
  } },
];

/*
 * Hero and search box, laid out like the labour, nursery and doctor homes.
 * Scrolls away with the feed.
 */
export default function CommunityHero({ navigation }) {
  const {t} = useTranslation();
  const me = useSelector(state => state.auth.user);

  return (
    <View>
      <MarketHero
        gradient="steel"
        onBack={() => navigation.goBack()}
        eyebrow={t('communityHeader.farmersAcrossIndia')}
        title={t('communityHeader.community')}
        subtitle={t('communityHeader.shareFieldUpdatesWatchReels')}
        right={
          <GlassButton
            onPress={() => navigation.navigate(COMMUNITY_ROUTES.PROFILE)}
          >
            <Avatar user={me && { ...me, _id: me.id }} size={32} />
          </GlassButton>
        }
      >
        <View style={styles.points}>
          {HERO_POINTS.map(({ Icon, label }) => (
            <View key={label} style={styles.point}>
              <Icon size={12} color="#FFD08A" />
              <Text style={styles.pointText}>{label}</Text>
            </View>
          ))}
        </View>
      </MarketHero>

      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.search}
        onPress={() => navigation.navigate(COMMUNITY_ROUTES.SEARCH)}
        accessibilityRole="button"
        accessibilityLabel={t('communityHeader.searchCommunity')}
      >
        <Search size={18} color={FIELD.FOREST} />
        <Text numberOfLines={1} style={styles.searchText}>
          {t('communityHeader.searchFarmersCropsHashtags')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/*
 * Section switcher, pinned under the status strip while the feed scrolls.
 */
export function CommunitySectionTabs({ activeTab, onTabChange }) {
  return (
    <View style={styles.tabs}>
      {COMMUNITY_TABS.map(({ id, label }) => {
        const active = id === activeTab;

        return (
          <Pressable
            key={id}
            onPress={() => onTabChange(id)}
            style={[styles.tab, active && styles.tabActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text
              numberOfLines={1}
              style={[styles.tabText, active && styles.tabTextActive]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  points: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  pointText: { color: '#FFFFFF', fontSize: 10.5, fontWeight: '800' },

  search: {
    marginTop: 16,
    marginHorizontal: CARD_GUTTER,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: FIELD.CARD,
    borderWidth: 1,
    borderColor: FIELD.LINE,
    ...CARD_SHADOW,
  },
  searchText: {
    flex: 1,
    fontSize: rf(14),
    fontWeight: '600',
    color: FIELD.BARK,
  },

  tabs: {
    paddingHorizontal: CARD_GUTTER,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: FIELD.SOIL,
  },
  tab: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FIELD.CARD,
    borderWidth: 1,
    borderColor: FIELD.LINE,
  },
  tabActive: {
    backgroundColor: FIELD.FOREST,
    borderColor: FIELD.FOREST,
  },
  tabText: {
    fontSize: rf(13),
    fontWeight: '800',
    color: FIELD.BARK,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
});
