import React from 'react';
import {ScrollView, StyleSheet, View, TouchableOpacity, Text, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MessageSquare, ChevronRight} from 'lucide-react-native';

import FarmOverviewHeader from '../../components/farmoverview/FarmOverviewHeader';
import FarmHeroCard from '../../components/farmoverview/FarmHeroCard';
import FarmMetricCards from '../../components/farmoverview/FarmMetricCards';
import FarmAIRecommendation from '../../components/farmoverview/FarmAIRecommendation';
import FarmWeatherCard from '../../components/farmoverview/FarmWeatherCard';
import FarmQuickActions from '../../components/farmoverview/FarmQuickActions';
import FarmRecentActivity from '../../components/farmoverview/FarmRecentActivity';

const {width} = Dimensions.get('window');

const GREEN = '#16883E';

export default function FarmOverviewScreen({navigation, route}) {
  const farm = route?.params?.farm || {
    title: 'Patil Farm',
    crop: 'Soybean',
    area: '2.34 Acres',
    image: require('../../assets/homescreen/farm2.jpg'),
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <FarmOverviewHeader
          title={farm.title}
          onBack={() => navigation.goBack()}
        />

        <FarmHeroCard farm={farm} />

        <FarmMetricCards />

        <FarmAIRecommendation />

        <FarmWeatherCard />

        <FarmQuickActions
          onSatellite={() => navigation.navigate('SatelliteView', {farm})}
        />

        <FarmRecentActivity />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity activeOpacity={0.9} style={styles.askButton}>
          <MessageSquare size={21} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.askText}>Ask AI About This Farm</Text>
          <ChevronRight size={21} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    paddingHorizontal: width * 0.037,
    paddingBottom: 116,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: width * 0.037,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  askButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    shadowColor: GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 7},
    elevation: 8,
  },

  askText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});