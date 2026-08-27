import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {Cloud, Wheat, Bot, ArrowRight} from 'lucide-react-native';

const {width, height} = Dimensions.get('window');

const GREEN = '#159447';

const ProfileFarmScreen = ({navigation}) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(26)).current;
  const scale = useRef(new Animated.Value(0.98)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide, scale]);

  const handleAddFarm = () => {
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.96,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('FarmDetailsScreen');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={styles.scrollContent}>
     <Animated.Image
  source={require('../../assets/images/profile2.png')}
  style={[
    styles.heroImage,
    {
      opacity: fade,
      transform: [{scale}],
    },
  ]}
  resizeMode="stretch"
/>

        <Animated.View
          style={[
            styles.contentCard,
            {
              opacity: fade,
              transform: [{translateY: slide}],
            },
          ]}>
          <Text style={styles.title}>Add Your First Farm</Text>

          <Text style={styles.subtitle}>
            Register your farm to receive personalized weather updates, crop
            monitoring, AI recommendations, and satellite-based insights.
          </Text>

          <View style={styles.cardsRow}>
            <FeatureCard
              icon={<Cloud size={24} color={GREEN} strokeWidth={2.3} />}
              bg="#D9FAE5"
              title={'Weather\nUpdates'}
            />

            <FeatureCard
              icon={<Wheat size={24} color={GREEN} strokeWidth={2.3} />}
              bg="#DDFBE8"
              title={'Crop\nMonitoring'}
            />

            <FeatureCard
              icon={<Bot size={24} color="#B95B18" strokeWidth={2.3} />}
              bg="#FFF0E5"
              title={'AI\nGuidance'}
            />
          </View>

          <Animated.View style={{transform: [{scale: buttonScale}]}}>
            <TouchableOpacity activeOpacity={0.9} onPress={handleAddFarm}>
              <LinearGradient
                colors={['#15883F', '#2BD070']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.button}>
                <Text style={styles.buttonText}>Add My Farm</Text>
                <ArrowRight size={25} color="#FFFFFF" strokeWidth={2.6} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.replace('Home')}>
            <Text style={styles.laterText}>I’ll Do It Later</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const FeatureCard = ({icon, bg, title}) => {
  return (
    <View style={styles.featureCard}>
      <View style={[styles.iconCircle, {backgroundColor: bg}]}>{icon}</View>
      <Text style={styles.featureText}>{title}</Text>
    </View>
  );
};

export default ProfileFarmScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 26,
  },
heroImage: {
  width: width + 2,
  height: height * 0.34,
  marginLeft: -1,
},
  contentCard: {
    marginTop: -10,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    paddingHorizontal: 24,
    paddingTop: 50,
    alignItems: 'center',
    minHeight: height * 0.58,
  },
  title: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900',
    color: '#178A40',
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 20,
    maxWidth: width * 0.82,
    fontSize: 17,
    lineHeight: 27,
    color: '#444D47',
    textAlign: 'center',
    fontWeight: '500',
  },
  cardsRow: {
    marginTop: 34,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 72) / 3,
    height: 132,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#DFE6DF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  featureText: {
    fontSize: 15.5,
    lineHeight: 21,
    color: '#171717',
    textAlign: 'center',
    fontWeight: '700',
  },
  button: {
    marginTop: 62,
    width: width - 48,
    height: 67,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    shadowColor: GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 9},
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  laterText: {
    marginTop: 26,
    fontSize: 16,
    color: '#3C443F',
    fontWeight: '600',
  },
});