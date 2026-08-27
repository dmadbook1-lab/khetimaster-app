import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  Languages,
  MessageCircle,
  User,
  BadgeCheck,
  ThumbsUp,
  ArrowRight,
  Plus,
} from 'lucide-react-native';

import CommunityHeader from '../../components/community/CommunityHeader';
import CommunityTabs from '../../components/community/CommunityTabs';
import {COLORS, rf, PAGE_PADDING, width} from '../../components/community/theme';
import {COMMUNITY_IMAGES} from '../../components/community/communityImages';

const FEATURED = [
  {
    id: 'e1',
    name: 'Dr. Rajesh Kumar',
    rating: 4.9,
    exp: '14y exp',
    tag: 'Rice & Wheat',
    verified: true,
    image: COMMUNITY_IMAGES.community8,
  },
];

const DIRECTORY = [
  {
    id: 'd1',
    name: 'Dr. Suresh Patel',
    role: 'Soil & Crop Nutrition',
    rating: 4.8,
    exp: '18 yrs',
    lang: 'Hindi, Gujarati',
    helped: '2,340',
    answers: '1,890',
    response: '97%',
    online: true,
  },
  {
    id: 'd2',
    name: 'Dr. Meena Iyer',
    role: 'Organic & Natural Farming',
    rating: 4.9,
    exp: '13 yrs',
    lang: 'Tamil, Hindi',
    helped: '1,780',
    answers: '2,210',
    response: '99%',
    online: true,
  },
  {
    id: 'd3',
    name: 'Mr. Vikram Singh',
    role: 'Agronomist — Punjab Region',
    rating: 4.7,
    exp: '16 yrs',
    lang: 'Punjabi, Hindi',
    helped: '3,100',
    answers: '980',
    response: '92%',
    online: false,
  },
];

export default function ExpertsScreen({navigation, embedded = false}) {
  const content = (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      {/* Search */}
      <View style={styles.searchBox}>
        <Search size={rf(14)} color={COLORS.MUTED} strokeWidth={2.3} />
        <TextInput
          placeholder="Search experts, crops or specialization..."
          placeholderTextColor={COLORS.MUTED}
          style={styles.searchInput}
        />
      </View>

      {/* Featured */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Experts</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredRow}>
        {FEATURED.map(e => (
          <View key={e.id} style={styles.featuredCard}>
            <View style={styles.featuredImageWrap}>
              <Image source={e.image} style={styles.featuredImage} />
              {e.verified && (
                <View style={styles.featuredVerified}>
                  <BadgeCheck
                    size={rf(10)}
                    color="#FFFFFF"
                    strokeWidth={2.4}
                  />
                  <Text style={styles.featuredVerifiedText}>Verified</Text>
                </View>
              )}
            </View>

            <View style={styles.featuredBody}>
              <Text style={styles.featuredName}>{e.name}</Text>

              <View style={styles.featuredMetaRow}>
                <Star
                  size={rf(11)}
                  color={COLORS.AMBER}
                  fill={COLORS.AMBER}
                  strokeWidth={2}
                />
                <Text style={styles.featuredRating}>{e.rating}</Text>
                <Text style={styles.featuredExp}>· {e.exp}</Text>
              </View>

              <View style={styles.featuredTag}>
                <BadgeCheck
                  size={rf(11)}
                  color={COLORS.DARK_GREEN}
                  strokeWidth={2.4}
                />
                <Text style={styles.featuredTagText}>{e.tag}</Text>
              </View>

              <TouchableOpacity activeOpacity={0.9} style={styles.viewProfileBtn}>
                <Text style={styles.viewProfileText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Directory */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Expert Directory</Text>
        <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn}>
          <SlidersHorizontal size={rf(11)} color={COLORS.DARK} strokeWidth={2.3} />
          <Text style={styles.filterBtnText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {DIRECTORY.map(d => (
        <View key={d.id} style={styles.dirCard}>
          <View style={styles.dirHeader}>
            <View style={styles.dirAvatar}>
              <Text style={styles.dirAvatarEmoji}>👨‍⚕️</Text>
              {d.online && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.dirTextBox}>
              <Text style={styles.dirName}>{d.name}</Text>
              <Text style={styles.dirRole}>{d.role}</Text>

              <View style={styles.dirMetaRow}>
                <View style={styles.dirMetaItem}>
                  <Star size={rf(10)} color={COLORS.AMBER} fill={COLORS.AMBER} strokeWidth={2} />
                  <Text style={styles.dirMetaText}>{d.rating}</Text>
                </View>
                <View style={styles.dirMetaItem}>
                  <Clock size={rf(10)} color={COLORS.MUTED} strokeWidth={2.2} />
                  <Text style={styles.dirMetaText}>{d.exp}</Text>
                </View>
                <View style={styles.dirMetaItem}>
                  <Languages size={rf(10)} color={COLORS.MUTED} strokeWidth={2.2} />
                  <Text style={styles.dirMetaText}>{d.lang}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.onlinePill, !d.online && styles.offlinePill]}>
              <Text
                style={[
                  styles.onlinePillText,
                  !d.online && styles.offlinePillText,
                ]}>
                {d.online ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          <View style={styles.dirStatsRow}>
            <View style={styles.dirStatCol}>
              <Text style={styles.dirStatValue}>{d.helped}</Text>
              <Text style={styles.dirStatLabel}>Helped</Text>
            </View>
            <View style={styles.dirStatDivider} />
            <View style={styles.dirStatCol}>
              <Text style={styles.dirStatValue}>{d.answers}</Text>
              <Text style={styles.dirStatLabel}>Answers</Text>
            </View>
            <View style={styles.dirStatDivider} />
            <View style={styles.dirStatCol}>
              <Text style={styles.dirStatValue}>{d.response}</Text>
              <Text style={styles.dirStatLabel}>Response</Text>
            </View>
          </View>

          <View style={styles.dirBtnsRow}>
            <TouchableOpacity activeOpacity={0.9} style={styles.askBtn}>
              <MessageCircle size={rf(13)} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.askBtnText}>Ask Question</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} style={styles.dirProfileBtn}>
              <User size={rf(13)} color={COLORS.DARK} strokeWidth={2.4} />
              <Text style={styles.dirProfileBtnText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Expert Tip */}
      <LinearGradient
        colors={['#22A957', '#158B3D']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.tipCard}>
        <View style={styles.tipIconBox}>
          <ThumbsUp size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />
        </View>

        <Text style={styles.tipLabel}>EXPERT TIP</Text>

        <Text style={styles.tipText}>
          Soak seeds in cow urine solution for 12 hours before sowing to
          improve germination rate and protect against soil-borne diseases.
        </Text>

        <TouchableOpacity activeOpacity={0.85} style={styles.readMoreRow}>
          <Text style={styles.readMoreText}>Read More</Text>
          <ArrowRight size={rf(13)} color="#FFFFFF" strokeWidth={2.6} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Ask an Expert CTA */}
      <TouchableOpacity activeOpacity={0.9} style={styles.askExpertBtn}>
        <View style={styles.askExpertPlusCircle}>
          <Plus size={rf(14)} color="#FFFFFF" strokeWidth={2.8} />
        </View>
        <Text style={styles.askExpertText}>Ask an Expert</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (embedded) {
    return <View style={styles.embeddedContainer}>{content}</View>;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommunityHeader navigation={navigation} />
      <CommunityTabs navigation={navigation} activeRoute="Experts" />

      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  embeddedContainer: {flex: 1, backgroundColor: COLORS.PAGE_BG},
  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 14,
    paddingBottom: 120,
    backgroundColor: COLORS.PAGE_BG,
  },

  searchBox: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {flex: 1, fontSize: rf(11), color: COLORS.DARK, padding: 0},

  sectionHeader: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  seeAll: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK_GREEN},
  filterBtn: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  filterBtnText: {fontSize: rf(10.5), fontWeight: '800', color: COLORS.DARK},

  featuredRow: {gap: 12, paddingRight: 12},

  featuredCard: {
    width: width - PAGE_PADDING * 2 - 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
  },
  featuredImageWrap: {height: 180, position: 'relative'},
  featuredImage: {width: '100%', height: '100%'},
  featuredVerified: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredVerifiedText: {fontSize: rf(9), fontWeight: '900', color: '#FFFFFF'},
  featuredBody: {padding: 12},
  featuredName: {fontSize: rf(14), fontWeight: '900', color: COLORS.DARK},
  featuredMetaRow: {marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 4},
  featuredRating: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK},
  featuredExp: {fontSize: rf(10), fontWeight: '600', color: COLORS.MUTED},
  featuredTag: {
    marginTop: 8,
    alignSelf: 'flex-start',
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featuredTagText: {fontSize: rf(10), fontWeight: '900', color: COLORS.DARK_GREEN},
  viewProfileBtn: {
    marginTop: 12,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileText: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK_GREEN},

  dirCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  dirHeader: {flexDirection: 'row', gap: 10},
  dirAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dirAvatarEmoji: {fontSize: rf(24)},
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  dirTextBox: {flex: 1},
  dirName: {fontSize: rf(13), fontWeight: '900', color: COLORS.DARK},
  dirRole: {marginTop: 2, fontSize: rf(10.5), fontWeight: '700', color: COLORS.DARK_GREEN},
  dirMetaRow: {marginTop: 6, flexDirection: 'row', gap: 10, flexWrap: 'wrap'},
  dirMetaItem: {flexDirection: 'row', alignItems: 'center', gap: 3},
  dirMetaText: {fontSize: rf(9.5), fontWeight: '600', color: COLORS.MUTED},
  onlinePill: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: '#EAFBF0',
    justifyContent: 'center',
  },
  offlinePill: {backgroundColor: '#F1F5F9'},
  onlinePillText: {fontSize: rf(9), fontWeight: '900', color: COLORS.DARK_GREEN},
  offlinePillText: {color: COLORS.MUTED},

  dirStatsRow: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dirStatCol: {flex: 1, alignItems: 'center', gap: 2},
  dirStatDivider: {width: 1, height: 26, backgroundColor: '#E2E8F0'},
  dirStatValue: {fontSize: rf(12), fontWeight: '900', color: COLORS.DARK},
  dirStatLabel: {fontSize: rf(9), fontWeight: '600', color: COLORS.MUTED},

  dirBtnsRow: {marginTop: 12, flexDirection: 'row', gap: 8},
  askBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  askBtnText: {fontSize: rf(11), fontWeight: '900', color: '#FFFFFF'},
  dirProfileBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dirProfileBtnText: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK},

  tipCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  tipIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipLabel: {
    marginTop: 10,
    fontSize: rf(10),
    fontWeight: '900',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },
  tipText: {
    marginTop: 6,
    fontSize: rf(11.5),
    lineHeight: rf(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  readMoreRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {fontSize: rf(11), fontWeight: '900', color: '#FFFFFF'},

  askExpertBtn: {
    marginTop: 20,
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.ORANGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: COLORS.ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 5,
  },
  askExpertPlusCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  askExpertText: {fontSize: rf(14), fontWeight: '900', color: '#FFFFFF'},
});