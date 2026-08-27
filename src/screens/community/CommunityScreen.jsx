import React, {useEffect, useState} from 'react';
import {
  BackHandler,
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Video, Camera, HelpCircle, Mic} from 'lucide-react-native';

import CommunityHeader from '../../components/community/CommunityHeader';
import CommunityTabs from '../../components/community/CommunityTabs';
import PostCard from '../../components/community/PostCard';
import QuestionCard from '../../components/community/QuestionCard';
import ExpertTipCard from '../../components/community/ExpertTipCard';
import SuccessStoryCard from '../../components/community/SuccessStoryCard';
import VideosScreen from './VideosScreen';
import QuestionsScreen from './QuestionsScreen';
import ExpertsScreen from './ExpertsScreen';
import DiseaseScreen from './DiseaseScreen';
import {COLORS, rf, PAGE_PADDING} from '../../components/community/theme';
import {COMMUNITY_IMAGES} from '../../components/community/communityImages';

const QUICK_ACTIONS = [
  {id: 'reel', title: 'Share Reel', Icon: Video, color: COLORS.DARK_GREEN, bg: '#EAFBF0'},
  {id: 'photo', title: 'Ask with Photo', Icon: Camera, color: COLORS.ORANGE, bg: '#FFF7ED'},
  {id: 'q', title: 'Ask Question', Icon: HelpCircle, color: COLORS.BLUE, bg: '#EFF6FF'},
  {id: 'voice', title: 'Ask by Voice', Icon: Mic, color: COLORS.PURPLE, bg: '#F5F3FF'},
];

const POSTS = [
  {
    id: 'p1',
    name: 'Ramesh Patel',
    location: 'Madhya Pradesh',
    time: '2 hours ago',
    tag: 'PROGRESSIVE FARMER',
    title: 'How I doubled my wheat yield with zero-till farming technique',
    desc: 'After struggling with soil erosion for 3 seasons, I tried zero-till sowing and the results are...',
    image: COMMUNITY_IMAGES.community1,
    duration: '2:34',
    views: '18.4k',
    hashtags: ['#ZeroTill', '#गेहूं', '#SoilHealth', '#KhetiMaster'],
    likes: '2.1K',
    comments: '42',
  },
];

const QUESTIONS = [
  {
    id: 'q1',
    name: 'Priya Sharma',
    location: 'Rajasthan',
    time: '5 hours ago',
    badge: 'Disease',
    title: 'Why are my soybean leaves turning yellow from the edges?',
    desc: 'My 2-acre soybean field is showing yellowing on leaf edges. Started 10 days ago, spreading fast. Soil pH 6.8. Any idea what this could be?',
    crop: 'Soybean',
    expertAvailable: true,
    likes: '89',
    replies: '14',
    views: '3.2K',
  },
];

const EXPERT_TIPS = [
  {
    id: 't1',
    name: 'Dr. Anita Verma',
    role: 'Agronomist · ICAR',
    time: '1 day ago',
    title: 'Best time to apply foliar spray for maximum absorption',
    desc: 'Foliar sprays are 3x more effective when applied between 6–9 AM or after 5 PM. Stomata are fully open, temperature is low, and wind is minimal. Avoid afternoon spraying.',
    category: 'Crop Nutrition',
  },
];

const POSTS_2 = [
  {
    id: 'p2',
    name: 'Suresh Kumar',
    location: 'Uttar Pradesh',
    time: '8 hours ago',
    tag: 'PROGRESSIVE FARMER',
    title: 'Drone spraying: Complete setup and cost breakdown for 1 acre',
    desc: 'I rented a 10-litre drone for ₹400/acre. Covered 5 acres in 40 minutes. Full cost breakdown and...',
    image: COMMUNITY_IMAGES.community2,
    duration: '3:12',
    views: '42.3k',
    hashtags: ['#DroneKheti', '#SmartFarming', '#ड्रोन'],
    likes: '5.8K',
    comments: '118',
  },
];

const SUCCESS_STORIES = [
  {
    id: 's1',
    name: 'Kiran Devi',
    location: 'Punjab',
    image: COMMUNITY_IMAGES.community3,
    before: '18',
    after: '34',
    unit: 'q/acre',
    savings: '45%',
    title: 'From 18 to 34 quintals/acre — My organic transformation story',
    desc: 'Switched to completely organic methods two seasons ago. No chemical fertilizer, only vermicompost and neem cake. Wheat yield nearly doubled and input cost dropped by 45%.',
    likes: '1.8K',
    comments: '67',
  },
];

export default function CommunityScreen({navigation}) {
  const [activeTab, setActiveTab] = useState('Community');
  const [tabHistory, setTabHistory] = useState(['Community']);

  const handleTabChange = routeName => {
    if (routeName === activeTab) return;

    setTabHistory(prev => [...prev, activeTab]);
    setActiveTab(routeName);
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeTab !== 'Community') {
        const previousTab = tabHistory[tabHistory.length - 1] || 'Community';
        setActiveTab(previousTab);
        setTabHistory(prev => prev.slice(0, -1));
        return true;
      }

      return false;
    });

    return () => backHandler.remove();
  }, [activeTab, tabHistory]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Videos':
        return <VideosScreen navigation={navigation} embedded />;
      case 'Questions':
        return <QuestionsScreen navigation={navigation} embedded />;
      case 'Experts':
        return <ExpertsScreen navigation={navigation} embedded />;
      case 'Disease':
        return <DiseaseScreen navigation={navigation} embedded />;
      default:
        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Quick Actions */}
            <View style={styles.actionsRow}>
              {QUICK_ACTIONS.map(item => {
                const Icon = item.Icon;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    style={styles.actionCol}>
                    <View style={[styles.actionCircle, {backgroundColor: item.bg}]}> 
                      <Icon size={rf(20)} color={item.color} strokeWidth={2.3} />
                    </View>
                    <Text style={[styles.actionLabel, {color: item.color}]}> 
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Section header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWrap}>
                <View style={styles.sectionBar} />
                <Text style={styles.sectionTitle}>Latest from Community</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            {POSTS.map(p => <PostCard key={p.id} post={p} />)}
            {QUESTIONS.map(q => <QuestionCard key={q.id} item={q} />)}
            {EXPERT_TIPS.map(t => <ExpertTipCard key={t.id} tip={t} />)}
            {POSTS_2.map(p => <PostCard key={p.id} post={p} />)}
            {SUCCESS_STORIES.map(s => <SuccessStoryCard key={s.id} story={s} />)}
          </ScrollView>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommunityHeader navigation={navigation} />
      <CommunityTabs
        navigation={navigation}
        activeRoute={activeTab}
        onTabChange={handleTabChange}
      />

      <View style={styles.contentContainer}>{renderTabContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  contentContainer: {flex: 1, backgroundColor: COLORS.PAGE_BG},
  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 14,
    paddingBottom: 120,
    backgroundColor: COLORS.PAGE_BG,
  },
  actionsRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
  actionCol: {flex: 1, alignItems: 'center', gap: 6},
  actionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {fontSize: rf(10), fontWeight: '900'},
  sectionHeader: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleWrap: {flexDirection: 'row', alignItems: 'center', gap: 8},
  sectionBar: {width: 3, height: 18, borderRadius: 2, backgroundColor: COLORS.DARK_GREEN},
  sectionTitle: {fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  seeAll: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK_GREEN},
});