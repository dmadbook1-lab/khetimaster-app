import React from 'react';
import {View, StyleSheet, StatusBar, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import CommunityHeader from '../../components/community/CommunityHeader';
import CommunityTabs from '../../components/community/CommunityTabs';
import VideoCard from '../../components/community/VideoCard';
import {COLORS, PAGE_PADDING} from '../../components/community/theme';
import {COMMUNITY_IMAGES} from '../../components/community/communityImages';

const VIDEOS = [
  {
    id: 'v1',
    image: COMMUNITY_IMAGES.community7,
    title: 'How to Identify & Treat Bollworm in Cotton',
    views: '28.1K views',
    author: 'KhetiMaster',
    verified: true,
    duration: '8:15',
  },
  {
    id: 'v2',
    image: COMMUNITY_IMAGES.community8,
    title: 'Paddy Blast Disease: Early Signs & Organic Cure',
    views: '9.7K views',
    author: 'Agri Expert',
    verified: false,
    duration: '5:30',
  },
  {
    id: 'v3',
    image: COMMUNITY_IMAGES.community9,
    title: 'Drone Spraying: Complete Setup for Small Farms',
    views: '42.3K views',
    author: 'KhetiMaster',
    verified: true,
    duration: '3:12',
  },
];

export default function VideosScreen({navigation, embedded = false}) {
  const content = (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      {VIDEOS.map(v => <VideoCard key={v.id} item={v} />)}
    </ScrollView>
  );

  if (embedded) {
    return <View style={styles.embeddedContainer}>{content}</View>;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommunityHeader navigation={navigation} />
      <CommunityTabs navigation={navigation} activeRoute="Videos" />

      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 14,
    paddingBottom: 120,
    backgroundColor: COLORS.PAGE_BG,
  },
});