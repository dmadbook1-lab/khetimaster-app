import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Search,
  MessageCircle,
  Camera,
  HelpCircle,
  Mic,
  MapPin,
  CheckCircle,
  Sparkles,
  Bookmark,
  ThumbsUp,
  Plus,
} from 'lucide-react-native';
import CommunityHeader from '../../components/community/CommunityHeader';
import CommunityTabs from '../../components/community/CommunityTabs';
import { COLORS, rf, PAGE_PADDING } from '../../components/community/theme';
import { COMMUNITY_IMAGES } from '../../components/community/communityImages';
const QUICK_ASK = [
  {
    id: 'photo',
    title: 'Ask with Photo',
    Icon: Camera,
  },
  {
    id: 'q',
    title: 'Ask Question',
    Icon: HelpCircle,
  },
  {
    id: 'voice',
    title: 'Ask with Voice',
    Icon: Mic,
  },
];
const FILTER_TABS = [
  {
    id: 'all',
    label: 'All',
  },
  {
    id: 'answered',
    label: 'Answered',
  },
  {
    id: 'unanswered',
    label: 'Unanswered',
  },
  {
    id: 'expert',
    label: 'Expert Answered',
  },
];
const QUESTIONS = [
  {
    id: 'q1',
    name: 'Ramesh Yadav',
    location: 'Pune, Maharashtra',
    time: '1 hour ago',
    verified: true,
    cropTag: 'Wheat',
    cropColor: COLORS.ORANGE,
    cropBg: '#FFF7ED',
    title: 'गेहूं में पीला रतुआ – किस दवा का छिड़काव करें?',
    subtitle:
      'फसल के पत्तों पर पीले धब्बे दिख रहे हैं. क्या यह Yellow Rust है? कौन सा fungicide सबसे असरदार है?',
    answers: 18,
    helpful: 42,
    expertAnswer: true,
    image: COMMUNITY_IMAGES.community4,
  },
  {
    id: 'q2',
    name: 'Priya Kumari',
    location: 'Varanasi, UP',
    time: '3 hours ago',
    cropTag: 'Tomato',
    cropColor: COLORS.DARK_GREEN,
    cropBg: '#EAFBF0',
    title: 'Leaves turning yellow at edges — nutrient deficiency or disease?',
    subtitle:
      'My tomato plants (20 days old) show yellow margins on lower leaves. Soil tested normal last week. What should I do?',
    answers: 9,
    helpful: 21,
    aiSuggested: true,
    image: COMMUNITY_IMAGES.community5,
  },
  {
    id: 'q3',
    name: 'Gurpreet Singh',
    location: 'Amritsar, Punjab',
    time: 'Yesterday',
    verified: true,
    cropTag: 'Rice',
    cropColor: COLORS.BLUE,
    cropBg: '#EFF6FF',
    title: 'Rice crop lodging problem — how to prevent before harvesting?',
    subtitle:
      'Paddy plants in my 2-acre field are falling due to wind. Crop is 90 days old. Is there any fix at this stage?',
    answers: 24,
    helpful: 68,
    expertAnswer: true,
    aiSuggested: true,
  },
  {
    id: 'q4',
    name: 'Anita Devi',
    location: 'Jaipur, Rajasthan',
    time: '2 days ago',
    cropTag: 'Onion',
    cropColor: COLORS.PURPLE,
    cropBg: '#F5F3FF',
    title: 'Onion bulbs very small despite 70 days — what went wrong?',
    subtitle:
      'Used proper fertilizer schedule but onion bulb size is much smaller than expected. Soil is sandy loam.',
    answers: 6,
    helpful: 15,
    image: COMMUNITY_IMAGES.community6,
  },
];
const TRENDING = [
  '#YellowRust',
  '#TomatoBlight',
  '#SoilHealth',
  '#DripIrrigation',
  '#OrganicFarming',
];
export default function QuestionsScreen({ navigation, embedded = false }) {
  const [filter, setFilter] = useState('all');
  const content = (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={rf(14)} color={COLORS.MUTED} strokeWidth={2.3} />
          <TextInput
            placeholder="Search crops, diseases or farming questions..."
            placeholderTextColor={COLORS.MUTED}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity activeOpacity={0.85}>
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {}
      <LinearGradient
        colors={['#22A957', '#158B3D']}
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 1,
          y: 1,
        }}
        style={styles.quickAskCard}
      >
        <View style={styles.quickAskLabelRow}>
          <MessageCircle size={rf(13)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.quickAskLabel}>QUICK ASK</Text>
        </View>

        <Text style={styles.quickAskTitle}>Need help with your crop?</Text>

        <View style={styles.quickAskActionsRow}>
          {QUICK_ASK.map(action => {
            const Icon = action.Icon;
            const handlePress = () => {
              if (action.id === 'photo') {
                navigation?.navigate('AskWithPhoto');
              } else if (action.id === 'q') {
                navigation?.navigate('AskQuestion');
              } else if (action.id === 'voice') {
                navigation?.navigate('AskByVoice');
              }
            };
            return (
              <TouchableOpacity
                key={action.id}
                activeOpacity={0.85}
                onPress={handlePress}
                style={styles.quickAskAction}
              >
                <View style={styles.quickAskIconBox}>
                  <Icon size={rf(22)} color="#FFFFFF" strokeWidth={2.2} />
                </View>
                <Text style={styles.quickAskActionText}>{action.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>

      {}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Questions</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {}
      <View style={styles.filterTabsRow}>
        {FILTER_TABS.map(tab => {
          const isActive = tab.id === filter;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.85}
              onPress={() => setFilter(tab.id)}
              style={[styles.filterTab, isActive && styles.activeFilterTab]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  isActive && styles.activeFilterTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {}
      {QUESTIONS.map(q => (
        <View key={q.id} style={styles.qCard}>
          <View style={styles.qHeaderRow}>
            <View style={styles.qAvatar}>
              <Text style={styles.qAvatarText}>👤</Text>
              {q.verified && <View style={styles.verifiedDot} />}
            </View>

            <View style={styles.qUserBox}>
              <View style={styles.qNameRow}>
                <Text style={styles.userName}>{q.name}</Text>
                {q.verified && (
                  <View style={styles.verifiedPill}>
                    <Text style={styles.verifiedPillText}>Verified</Text>
                  </View>
                )}
              </View>
              <View style={styles.qLocRow}>
                <MapPin size={rf(9)} color={COLORS.RED} strokeWidth={2.3} />
                <Text style={styles.qLocText}>
                  {q.location} · {q.time}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.cropTag,
                {
                  backgroundColor: q.cropBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.cropTagText,
                  {
                    color: q.cropColor,
                  },
                ]}
              >
                {q.cropTag}
              </Text>
            </View>
          </View>

          <View style={styles.qBodyRow}>
            <View style={styles.qBodyTextBox}>
              <Text style={styles.qBodyTitle}>{q.title}</Text>
              <Text style={styles.qBodySubtitle}>{q.subtitle}</Text>
            </View>
            {q.image && <Image source={q.image} style={styles.qBodyImage} />}
          </View>

          <View style={styles.qFooter}>
            <View style={styles.qFooterStats}>
              <View style={styles.qFooterStat}>
                <MessageCircle
                  size={rf(12)}
                  color={COLORS.MUTED}
                  strokeWidth={2.2}
                />
                <Text style={styles.qFooterStatText}>{q.answers} Answers</Text>
              </View>
              <View style={styles.qFooterStat}>
                <ThumbsUp
                  size={rf(12)}
                  color={COLORS.MUTED}
                  strokeWidth={2.2}
                />
                <Text style={styles.qFooterStatText}>{q.helpful} Helpful</Text>
              </View>
            </View>

            <View style={styles.qFooterBadges}>
              {q.expertAnswer && (
                <View style={styles.expertBadge}>
                  <CheckCircle
                    size={rf(10)}
                    color={COLORS.DARK_GREEN}
                    strokeWidth={2.4}
                  />
                  <Text style={styles.expertBadgeText}>Expert Answer</Text>
                </View>
              )}
              {q.aiSuggested && (
                <View style={styles.aiBadge}>
                  <Sparkles
                    size={rf(10)}
                    color={COLORS.BLUE}
                    strokeWidth={2.4}
                  />
                  <Text style={styles.aiBadgeText}>AI Suggested</Text>
                </View>
              )}
              <TouchableOpacity activeOpacity={0.7} style={styles.bookmarkBtn}>
                <Bookmark
                  size={rf(13)}
                  color={COLORS.MUTED}
                  strokeWidth={2.2}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {}
      <Text style={styles.trendingTitle}>Trending Topics</Text>
      <View style={styles.trendingRow}>
        {TRENDING.map(t => (
          <View key={t} style={styles.trendPill}>
            <Text style={styles.trendPillText}>{t}</Text>
          </View>
        ))}
      </View>

      {}
      <TouchableOpacity activeOpacity={0.9} style={styles.askFAB}>
        <Plus size={rf(14)} color="#FFFFFF" strokeWidth={2.6} />
        <Text style={styles.askFABText}>Ask Question</Text>
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
      <CommunityTabs navigation={navigation} activeRoute="Questions" />

      {content}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  embeddedContainer: {
    flex: 1,
    backgroundColor: COLORS.PAGE_BG,
  },
  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 14,
    paddingBottom: 120,
    backgroundColor: COLORS.PAGE_BG,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
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
  searchInput: {
    flex: 1,
    fontSize: rf(11),
    color: COLORS.DARK,
    padding: 0,
  },
  filterText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  quickAskCard: {
    marginTop: 14,
    padding: 18,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.DARK_GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },
  quickAskLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickAskLabel: {
    fontSize: rf(9.5),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  quickAskTitle: {
    marginTop: 8,
    fontSize: rf(18),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  quickAskActionsRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickAskAction: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  quickAskIconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAskActionText: {
    fontSize: rf(10),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: rf(15),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  seeAll: {
    fontSize: rf(11),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterTab: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  activeFilterTab: {
    backgroundColor: COLORS.DARK_GREEN,
  },
  filterTabText: {
    fontSize: rf(10.5),
    fontWeight: '900',
    color: '#64748B',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  qCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  qHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  qAvatarText: {
    fontSize: rf(18),
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.DARK_GREEN,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  qUserBox: {
    flex: 1,
  },
  qNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: rf(12),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  verifiedPill: {
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: '#EAFBF0',
    justifyContent: 'center',
  },
  verifiedPillText: {
    fontSize: rf(8.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  qLocRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qLocText: {
    fontSize: rf(9.5),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  cropTag: {
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 11,
    justifyContent: 'center',
  },
  cropTagText: {
    fontSize: rf(9),
    fontWeight: '900',
  },
  qBodyRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  qBodyTextBox: {
    flex: 1,
  },
  qBodyTitle: {
    fontSize: rf(12.5),
    lineHeight: rf(17),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  qBodySubtitle: {
    marginTop: 5,
    fontSize: rf(10.5),
    lineHeight: rf(15),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  qBodyImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  qFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  qFooterStats: {
    flexDirection: 'row',
    gap: 14,
  },
  qFooterStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qFooterStatText: {
    fontSize: rf(10),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  qFooterBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expertBadge: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expertBadgeText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  aiBadge: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiBadgeText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: COLORS.BLUE,
  },
  bookmarkBtn: {
    padding: 4,
  },
  trendingTitle: {
    marginTop: 20,
    marginBottom: 12,
    fontSize: rf(14),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  trendingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendPill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#EAFBF0',
    justifyContent: 'center',
  },
  trendPillText: {
    fontSize: rf(10.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  askFAB: {
    alignSelf: 'flex-end',
    marginTop: 20,
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 21,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: COLORS.DARK_GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },
  askFABText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
