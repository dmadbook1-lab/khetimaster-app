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
import {
  Search,
  AlertTriangle,
  Camera,
  MapPin,
  CheckCircle,
  BadgeCheck,
  Flame,
  Sparkle,
  ArrowRight,
} from 'lucide-react-native';
import CommunityHeader from '../../components/community/CommunityHeader';
import CommunityTabs from '../../components/community/CommunityTabs';
import VideoCard from '../../components/community/VideoCard';
import SuccessStoryCard from '../../components/community/SuccessStoryCard';
import { COLORS, rf, PAGE_PADDING } from '../../components/community/theme';
import { COMMUNITY_IMAGES } from '../../components/community/communityImages';
const VIDEOS = [
  {
    id: 'v1',
    image: COMMUNITY_IMAGES.community4,
    title: 'How to Identify & Treat Bollworm in Cotton',
    views: '28.1K views',
    author: 'KhetiMaster',
    verified: true,
    duration: '8:15',
  },
  {
    id: 'v2',
    image: COMMUNITY_IMAGES.community5,
    title: 'Paddy Blast Disease: Early Signs & Organic Cure',
    views: '9.7K views',
    author: 'Agri Expert',
    verified: false,
    duration: '5:30',
  },
];
const SUCCESS = {
  id: 's1',
  name: 'Sukhdev Singh',
  location: 'Amritsar, Punjab',
  image: COMMUNITY_IMAGES.community3,
  emoji: '👨',
  before: '30%',
  after: '0%',
  unit: 'crop loss',
  savings: 'ZERO',
  title: 'Beat wheat rust with expert spray schedule',
  desc: 'Lost 30% of my wheat to rust disease last year. This season I followed the spray schedule shared by Dr. Rajesh here. Zero disease, best yield in 5 years! 🙌',
  likes: '512',
  comments: '48',
};
export default function DiseaseScreen({ navigation, embedded = false }) {
  const [feedFilter, setFeedFilter] = useState('trending');
  const content = (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {}
      <View style={styles.searchBox}>
        <Search size={rf(14)} color={COLORS.MUTED} strokeWidth={2.3} />
        <TextInput
          placeholder="Search diseases, pests or symptoms..."
          placeholderTextColor={COLORS.MUTED}
          style={styles.searchInput}
        />
      </View>

      {}
      <View style={styles.alertCard}>
        <Image source={COMMUNITY_IMAGES.community6} style={styles.alertImage} />

        <View style={styles.alertBody}>
          <View style={styles.alertTagsRow}>
            <View style={styles.alertTag}>
              <AlertTriangle
                size={rf(10)}
                color={COLORS.RED}
                strokeWidth={2.4}
              />
              <Text style={styles.alertTagText}>DISEASE ALERT</Text>
            </View>
            <View style={styles.riskTag}>
              <Text style={styles.riskTagText}>HIGH RISK</Text>
            </View>
          </View>

          <Text style={styles.alertName}>Pink Bollworm</Text>

          <View style={styles.alertCropRow}>
            <Text style={styles.alertCropEmoji}>🌾</Text>
            <Text style={styles.alertCropLabel}>Affected Crop:</Text>
            <Text style={styles.alertCropValue}>Cotton</Text>
          </View>

          <Text style={styles.alertText}>
            Reports from 340+ farms in Vidarbha. Protect your crop now.
          </Text>

          <TouchableOpacity activeOpacity={0.9} style={styles.readAdvBtn}>
            <Text style={styles.readAdvBtnText}>Read Advisory</Text>
            <ArrowRight size={rf(13)} color="#FFFFFF" strokeWidth={2.6} />
          </TouchableOpacity>
        </View>
      </View>

      {}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Community Feed</Text>

        <View style={styles.feedToggle}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setFeedFilter('trending')}
            style={[
              styles.toggleBtn,
              feedFilter === 'trending' && styles.toggleActive,
            ]}
          >
            <Flame
              size={rf(11)}
              color={feedFilter === 'trending' ? COLORS.ORANGE : COLORS.MUTED}
              strokeWidth={2.4}
            />
            <Text
              style={[
                styles.toggleText,
                feedFilter === 'trending' && {
                  color: COLORS.ORANGE,
                },
              ]}
            >
              Trending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setFeedFilter('latest')}
            style={[
              styles.toggleBtn,
              feedFilter === 'latest' && styles.toggleActive,
            ]}
          >
            <Sparkle
              size={rf(11)}
              color={feedFilter === 'latest' ? COLORS.DARK_GREEN : COLORS.MUTED}
              strokeWidth={2.4}
            />
            <Text
              style={[
                styles.toggleText,
                feedFilter === 'latest' && {
                  color: COLORS.DARK_GREEN,
                },
              ]}
            >
              Latest
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <VideoCard item={VIDEOS[0]} />

      {}
      <View style={styles.postCard}>
        <View style={styles.postHeaderRow}>
          <View style={styles.postAvatar}>
            <Text
              style={{
                fontSize: rf(18),
              }}
            >
              👤
            </Text>
          </View>
          <View style={styles.postUserBox}>
            <Text style={styles.userName}>Ramesh Yadav</Text>
            <View style={styles.locRow}>
              <MapPin size={rf(10)} color={COLORS.RED} strokeWidth={2.3} />
              <Text style={styles.locText}>Pune, Maharashtra</Text>
            </View>
          </View>
          <Text style={styles.timeText}>2h ago</Text>
        </View>

        <Text style={styles.postDesc}>
          My tomato leaves are turning yellow from the bottom. Applied DAP 10
          days ago. What is the reason and remedy?
        </Text>

        <Image source={COMMUNITY_IMAGES.community5} style={styles.postImage} />

        <View style={styles.postFooter}>
          <View style={styles.footerLeft}>
            <View style={styles.repliesTag}>
              <Text style={styles.repliesText}>💬 14 Replies</Text>
            </View>
            <View style={styles.answeredTag}>
              <CheckCircle
                size={rf(10)}
                color={COLORS.DARK_GREEN}
                strokeWidth={2.4}
              />
              <Text style={styles.answeredText}>Expert Answered</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAnswer}>See Answer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {}
      <View style={styles.expertAnsCard}>
        <View style={styles.expertBar} />

        <View style={styles.expertContent}>
          <View style={styles.expertHeaderRow}>
            <View style={styles.expertAvatar}>
              <Text
                style={{
                  fontSize: rf(18),
                }}
              >
                👩‍⚕️
              </Text>
            </View>
            <View style={styles.expertNameWrap}>
              <View style={styles.expertNameRow}>
                <Text style={styles.userName}>Dr. Meena Iyer</Text>
                <BadgeCheck
                  size={rf(12)}
                  color={COLORS.DARK_GREEN}
                  strokeWidth={2.4}
                  fill={COLORS.DARK_GREEN}
                />
              </View>
              <Text style={styles.expertRole}>Plant Pathologist</Text>
            </View>
            <View style={styles.expertTipPill}>
              <Text style={styles.expertTipPillText}>Expert Tip</Text>
            </View>
          </View>

          <Text style={styles.expertQuote}>
            "For powdery mildew on cucurbits, spray 5ml neem oil + 2ml liquid
            soap per litre of water early morning. Repeat every 7 days for 3
            weeks. Never spray in afternoon heat."
          </Text>

          <View style={styles.expertFooter}>
            <View style={styles.expertCropTag}>
              <Text style={styles.expertCropTagEmoji}>🌱</Text>
              <Text style={styles.expertCropText}>Cucurbits & Gourds</Text>
            </View>
            <View style={styles.expertFooterRight}>
              <Text style={styles.likesText}>👍 328</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.saveTipText}>Save Tip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <VideoCard item={VIDEOS[1]} />

      <SuccessStoryCard story={SUCCESS} />

      {}
      <TouchableOpacity activeOpacity={0.9} style={styles.reportBtn}>
        <Camera size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
        <Text style={styles.reportBtnText}>Report Crop Problem</Text>
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
      <CommunityTabs navigation={navigation} activeRoute="Disease" />

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
  searchBox: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 22,
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
  alertCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    gap: 12,
  },
  alertImage: {
    width: 88,
    height: 88,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  alertBody: {
    flex: 1,
  },
  alertTagsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  alertTag: {
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 5,
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  alertTagText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: COLORS.RED,
  },
  riskTag: {
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 5,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
  },
  riskTagText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: COLORS.RED,
  },
  alertName: {
    marginTop: 6,
    fontSize: rf(15),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  alertCropRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alertCropEmoji: {
    fontSize: rf(11),
  },
  alertCropLabel: {
    fontSize: rf(10),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  alertCropValue: {
    fontSize: rf(10),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  alertText: {
    marginTop: 4,
    fontSize: rf(10),
    lineHeight: rf(14),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  readAdvBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.RED,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readAdvBtnText: {
    fontSize: rf(10.5),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sectionHeader: {
    marginTop: 20,
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
  feedToggle: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 2,
  },
  toggleBtn: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: COLORS.MUTED,
  },
  postCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postUserBox: {
    flex: 1,
  },
  userName: {
    fontSize: rf(12),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  locRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locText: {
    fontSize: rf(9.5),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  timeText: {
    fontSize: rf(9.5),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  postDesc: {
    marginTop: 10,
    fontSize: rf(11),
    lineHeight: rf(16),
    fontWeight: '500',
    color: COLORS.DARK,
  },
  postImage: {
    marginTop: 12,
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  postFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  repliesTag: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  repliesText: {
    fontSize: rf(9.5),
    fontWeight: '700',
    color: COLORS.DARK,
  },
  answeredTag: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  answeredText: {
    fontSize: rf(9.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  seeAnswer: {
    fontSize: rf(10.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  expertAnsCard: {
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: '#F0FBF3',
    borderWidth: 1,
    borderColor: '#C9EED6',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  expertBar: {
    width: 4,
    backgroundColor: COLORS.DARK_GREEN,
  },
  expertContent: {
    flex: 1,
    padding: 14,
  },
  expertNameWrap: {
    flex: 1,
  },
  expertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expertAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expertNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expertRole: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  expertTipPill: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: '#EAFBF0',
    borderWidth: 1,
    borderColor: '#BBF0CC',
    justifyContent: 'center',
  },
  expertTipPillText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  expertQuote: {
    marginTop: 10,
    fontSize: rf(11),
    lineHeight: rf(16),
    fontWeight: '600',
    color: COLORS.DARK,
    fontStyle: 'italic',
  },
  expertFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  expertCropTag: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expertCropTagEmoji: {
    fontSize: rf(10),
  },
  expertCropText: {
    fontSize: rf(9.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  expertFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  likesText: {
    fontSize: rf(10),
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  saveTipText: {
    fontSize: rf(10.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  reportBtn: {
    marginTop: 12,
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: COLORS.DARK_GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },
  reportBtnText: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
