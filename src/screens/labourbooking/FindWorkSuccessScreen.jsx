import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Check,
  Bell,
  Handshake,
  IndianRupee,
  Lightbulb,
  PartyPopper,
  ArrowRight,
  MapPin,
  Briefcase,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size, Math.min(size * scale, size + 3));
};
const GREEN = '#16A34A';
const DARK = '#172033';
const MUTED = '#7C8596';
export default function FindWorkSuccessScreen({ navigation, route }) {
  const labourer = route?.params?.labourer || {};
  const name = labourer?.fullName || 'Worker';
  const village = labourer?.village || '';
  const district = labourer?.district || '';
  const state = labourer?.state || '';
  const location = [village, district, state].filter(Boolean).join(', ');
  const skills = Array.isArray(labourer?.skills) ? labourer.skills : [];
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {}

        <View style={styles.activePill}>
          <View style={styles.dot} />

          <Text style={styles.activeText}>Active</Text>
        </View>

        {}

        <ImageBackground
          source={require('../../assets/labour/worker-1.jpg')}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.checkCircle}>
            <Check size={rf(28)} color="#FFFFFF" strokeWidth={3.5} />
          </View>
        </ImageBackground>

        {}

        <View style={styles.partyIcon}>
          <PartyPopper size={rf(34)} color="#F97316" strokeWidth={2.2} />
        </View>

        <Text style={styles.title}>Ready to Earn, {name}!</Text>

        <Text style={styles.subtitle}>
          Your labour profile has been created successfully.
          {'\n'}
          Farmers can now find you and send work requests.
        </Text>

        {}

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileIcon}>
              <Briefcase size={rf(19)} color={GREEN} strokeWidth={2.4} />
            </View>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text style={styles.profileName}>{name}</Text>

              <Text style={styles.profileType}>
                {labourer?.labourType || 'Farm Labourer'}
              </Text>
            </View>

            <View style={styles.activeSmallPill}>
              <View style={styles.smallDot} />

              <Text style={styles.activeSmallText}>Active</Text>
            </View>
          </View>

          {}

          {location ? (
            <View style={styles.infoRow}>
              <MapPin size={rf(16)} color={GREEN} strokeWidth={2.3} />

              <Text style={styles.infoText}>{location}</Text>
            </View>
          ) : null}

          {}

          {skills.length > 0 ? (
            <View style={styles.skillsContainer}>
              <Text style={styles.skillsTitle}>Work Types</Text>

              <View style={styles.skillsRow}>
                {skills.map((skill, index) => (
                  <View key={`${skill}-${index}`} style={styles.skillPill}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {}

        <View style={styles.serviceCard}>
          <View style={styles.serviceCheck}>
            <Check size={rf(15)} color="#FFFFFF" strokeWidth={3} />
          </View>

          <View
            style={{
              flex: 1,
              marginLeft: 12,
            }}
          >
            <Text style={styles.serviceTitle}>Your service is active</Text>

            <Text style={styles.serviceSub}>
              Farmers can now find your profile.
            </Text>
          </View>
        </View>

        {}

        <View style={styles.nextCard}>
          <Text style={styles.nextTitle}>What's Next?</Text>

          <View style={styles.stepsRow}>
            <NextStep
              Icon={Bell}
              label="Job Alerts"
              color="#DBEAFE"
              iconColor="#3B82F6"
            />

            <ArrowRight size={rf(16)} color={MUTED} style={styles.arrow} />

            <NextStep
              Icon={Handshake}
              label="Accept Work"
              color="#DCFCE7"
              iconColor={GREEN}
            />

            <ArrowRight size={rf(16)} color={MUTED} style={styles.arrow} />

            <NextStep
              Icon={IndianRupee}
              label="Start Earning"
              color="#FFEDD5"
              iconColor="#F97316"
            />
          </View>
        </View>

        {}

        <View style={styles.tipCard}>
          <Lightbulb size={rf(17)} color="#F97316" strokeWidth={2.4} />

          <View
            style={{
              flex: 1,
              marginLeft: 9,
            }}
          >
            <Text style={styles.tipTitle}>Keep your phone on</Text>

            <Text style={styles.tipText}>
              Accept work quickly when farmers send requests.
            </Text>
          </View>
        </View>

        {}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('FindWorkStep1')}
          style={styles.viewJobsBtn}
        >
          <Text style={styles.viewJobsText}>View Jobs</Text>

          <ArrowRight size={rf(17)} color="#FFFFFF" strokeWidth={2.6} />
        </TouchableOpacity>

        {}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('LabourBooking')}
          style={styles.homeBtn}
        >
          <Text style={styles.homeText}>Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
function NextStep({ Icon, label, color, iconColor }) {
  return (
    <View style={styles.nextStep}>
      <View
        style={[
          styles.stepIcon,
          {
            backgroundColor: color,
          },
        ]}
      >
        <Icon size={rf(19)} color={iconColor} strokeWidth={2.4} />
      </View>

      <Text style={styles.stepLabel}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: width * 0.037,
    alignItems: 'center',
    paddingBottom: 35,
  },
  activePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  activeText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: GREEN,
  },
  hero: {
    marginTop: 12,
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  heroImage: {
    borderRadius: 16,
  },
  checkCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: -29,
  },
  partyIcon: {
    marginTop: 42,
  },
  title: {
    marginTop: 8,
    fontSize: rf(25),
    fontWeight: '900',
    color: DARK,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: rf(13),
    color: MUTED,
    textAlign: 'center',
    lineHeight: rf(19),
  },
  profileCard: {
    marginTop: 20,
    width: '100%',
    padding: 16,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBED',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  profileName: {
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },
  profileType: {
    marginTop: 2,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },
  activeSmallPill: {
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  smallDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },
  activeSmallText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: GREEN,
  },
  infoRow: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  infoText: {
    flex: 1,
    fontSize: rf(12),
    color: MUTED,
    fontWeight: '600',
  },
  skillsContainer: {
    marginTop: 13,
  },
  skillsTitle: {
    fontSize: rf(11),
    fontWeight: '800',
    color: DARK,
    marginBottom: 7,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  skillPill: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillText: {
    fontSize: rf(10),
    fontWeight: '800',
    color: GREEN,
  },
  serviceCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  serviceCheck: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  serviceSub: {
    marginTop: 2,
    fontSize: rf(11),
    color: '#DCFCE7',
    fontWeight: '500',
  },
  nextCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBED',
    width: '100%',
  },
  nextTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
    textAlign: 'center',
  },
  stepsRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextStep: {
    alignItems: 'center',
    flex: 1,
  },
  arrow: {
    marginBottom: 14,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    marginTop: 6,
    fontSize: rf(10),
    fontWeight: '800',
    color: DARK,
    textAlign: 'center',
  },
  tipCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFEDD5',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  tipTitle: {
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },
  tipText: {
    marginTop: 2,
    fontSize: rf(11),
    color: '#78716C',
    fontWeight: '500',
  },
  viewJobsBtn: {
    marginTop: 20,
    height: 54,
    width: '100%',
    borderRadius: 27,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  viewJobsText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  homeBtn: {
    marginTop: 12,
    height: 54,
    width: '100%',
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: GREEN,
  },
});
