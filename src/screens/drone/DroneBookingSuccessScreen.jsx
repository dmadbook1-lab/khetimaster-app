// screens/drone/DroneBookingSuccessScreen.js
import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Dimensions, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {Check, Star, BadgeCheck, Calendar, Clock, Zap, MapPin, Sparkles, Droplet, CloudRain, FlaskConical, Hash, Phone, Headphones, FileText, Home} from 'lucide-react-native';

const {width} = Dimensions.get('window');
const GREEN = '#16A34A';
const DARK_GREEN = '#15803D';
const DARK = '#111827';
const MUTED = '#64748B';
const BORDER = '#E5E7EB';
const rf = size => { const scale = width / 390; return Math.max(size - 2, Math.min(size * scale, size + 2)); };

export default function DroneBookingSuccessScreen({navigation}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 130}}>
        <ImageBackground source={require('../../assets/drone/hero.jpg')} style={styles.hero}>
          <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(249,250,251,1)']} style={StyleSheet.absoluteFill} />
        </ImageBackground>

        <View style={styles.checkCircle}>
          <Check size={rf(24)} color="#FFFFFF" strokeWidth={3.5} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Drone Service</Text>
          <Text style={styles.titleGreen}>Booked Successfully!</Text>
          <Text style={styles.desc}>Your booking has been confirmed.{'\n'}The drone operator has accepted your request.</Text>
          <View style={styles.bookingIdPill}>
            <Text style={styles.bookingIdText}>🎯 Booking ID  KM-DRN-2028-00847</Text>
          </View>

          {/* Operator */}
          <Text style={styles.sectionLabel}>DRONE OPERATOR</Text>
          <View style={styles.opCard}>
            <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
              <View style={styles.opInitial}><Text style={styles.opInitialText}>SA</Text></View>
              <View style={{flex: 1, marginLeft: 12}}>
                <Text style={styles.opName}>SkyAgri Drone{'\n'}Services</Text>
                <View style={{flexDirection: 'row', gap: 6, marginTop: 6}}>
                  <View style={styles.starPill}>
                    <Star size={rf(10)} color="#F59E0B" fill="#F59E0B" strokeWidth={1.5} />
                    <Text style={styles.starTxt}>4.9</Text>
                  </View>
                  <View style={styles.dgca}>
                    <BadgeCheck size={rf(10)} color={GREEN} strokeWidth={2.4} />
                    <Text style={styles.dgcaText}>DGCA Certified</Text>
                  </View>
                </View>
              </View>
              <View style={styles.confirmedPill}>
                <View style={styles.confirmedDot} />
                <Text style={styles.confirmedText}>Confirmed</Text>
              </View>
            </View>

            <View style={{marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center'}}>
              <View style={styles.pilotAv} />
              <View style={{flex: 1, marginLeft: 10}}>
                <Text style={styles.pilotName}>Rahul Patil</Text>
                <Text style={styles.pilotRole}>DGCA Certified Drone Pilot</Text>
              </View>
              <View style={styles.verifiedPill}>
                <Check size={rf(10)} color={GREEN} strokeWidth={3} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              {[{v:'⭐ 4.9',l:'Rating'},{v:'520',l:'Services'},{v:'5 Yrs',l:'Experience'}].map(s => (
                <View key={s.l} style={{flex: 1, alignItems: 'center'}}>
                  <Text style={styles.statLbl}>{s.l}</Text>
                  <Text style={styles.statVal}>{s.v}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Schedule */}
          <Text style={styles.sectionLabel}>SERVICE SCHEDULE</Text>
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <Calendar size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
              <View style={{marginLeft: 8}}>
                <Text style={styles.scheduleTitle}>Service Scheduled</Text>
                <Text style={styles.scheduleSub}>Confirmed · Tomorrow Morning</Text>
              </View>
            </View>
            {[
              {Icon: Calendar, label: 'SERVICE DATE', val: '30 June 2026', pill: 'Tuesday'},
              {Icon: Clock, label: 'SCHEDULED TIME', val: '06:30 AM', pill: 'AI Pick'},
              {Icon: Zap, label: 'ESTIMATED DURATION', val: '35 Minutes'},
            ].map((d,i) => {
              const Icon = d.Icon;
              return (
                <View key={i} style={styles.scheduleRow}>
                  <Icon size={rf(15)} color={GREEN} strokeWidth={2.4} />
                  <View style={{flex: 1, marginLeft: 10}}>
                    <Text style={styles.scheduleLbl}>{d.label}</Text>
                    <Text style={styles.scheduleVal}>{d.val}</Text>
                  </View>
                  {d.pill && (
                    <View style={styles.tuePill}><Text style={styles.tueText}>{d.pill}</Text></View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Farm */}
          <Text style={styles.sectionLabel}>FARM DETAILS</Text>
          <ImageBackground source={require('../../assets/drone/farm-map.png')} style={styles.farmMap} imageStyle={{borderTopLeftRadius: 12, borderTopRightRadius: 12}}>
            <View style={styles.gpsPill}>
              <MapPin size={rf(10)} color={DARK_GREEN} strokeWidth={2.4} />
              <Text style={styles.gpsText}>GPS Verified</Text>
            </View>
          </ImageBackground>
          <View style={styles.farmInfo}>
            <Text style={styles.farmName}>Patil Farm</Text>
            <View style={styles.farmTags}>
              <View style={styles.farmTag}><Text style={styles.farmTagText}>🌱 Soybean</Text></View>
              <View style={styles.farmTag}><Text style={styles.farmTagText}>📏 2.34 Acres</Text></View>
              <View style={styles.farmTag}><Text style={styles.farmTagText}>📍 Ahmednagar</Text></View>
            </View>
          </View>

          {/* AI Reminder */}
          <Text style={styles.sectionLabel}>AI REMINDER</Text>
          <LinearGradient colors={['#16A34A', '#15803D']} style={styles.aiCard}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={styles.aiIcon}><Sparkles size={rf(15)} color="#FFFFFF" strokeWidth={2.4} /></View>
              <View style={{flex: 1, marginLeft: 10}}>
                <Text style={styles.aiTitle}>AI Reminder</Text>
                <Text style={styles.aiSub}>Tomorrow Morning · Patil Farm</Text>
              </View>
              <View style={styles.optimalPill}><Text style={styles.optimalText}>Optimal</Text></View>
            </View>
            <Text style={styles.aiHead}>Tomorrow morning has ideal spraying conditions.</Text>
            <Text style={styles.aiDesc}>AI analysis confirms perfect weather, low wind, and optimal humidity for maximum spray efficiency.</Text>
            <View style={styles.aiGrid}>
              <View style={styles.aiCell}>
                <Droplet size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.aiCellVal}>96%</Text>
                <Text style={styles.aiCellLbl}>SPRAY EFFICIENCY</Text>
              </View>
              <View style={styles.aiCell}>
                <Droplet size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.aiCellVal}>90%</Text>
                <Text style={styles.aiCellLbl}>WATER SAVING</Text>
              </View>
            </View>
            <View style={styles.aiGrid}>
              <View style={styles.aiCell}>
                <CloudRain size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.aiCellVal}>Very Low</Text>
                <Text style={styles.aiCellLbl}>RAIN PROBABILITY</Text>
              </View>
              <View style={styles.aiCell}>
                <FlaskConical size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.aiCellVal}>4.8 L</Text>
                <Text style={styles.aiCellLbl}>CHEMICAL</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Summary */}
          <Text style={styles.sectionLabel}>BOOKING SUMMARY</Text>
          <View style={styles.detailCard}>
            {[
              {Icon: Hash, label: 'BOOKING ID', val: 'KM-DRN-2028-00847'},
              {Icon: Zap, label: 'SERVICE TYPE', val: 'Pesticide Spraying'},
              {Icon: BadgeCheck, label: 'OPERATOR', val: 'Rahul Patil - SkyAgri'},
              {Icon: FileText, label: 'PAYMENT METHOD', val: 'Pay After Service', amt: '₹2,030'},
            ].map((d,i) => {
              const Icon = d.Icon;
              return (
                <View key={i} style={[styles.summaryRow, i > 0 && {borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, marginTop: 12}]}>
                  <View style={styles.detailIcon}><Icon size={rf(13)} color={GREEN} strokeWidth={2.4} /></View>
                  <View style={{flex: 1, marginLeft: 12}}>
                    <Text style={styles.detailLabel}>{d.label}</Text>
                    <Text style={styles.detailVal}>{d.val}</Text>
                  </View>
                  {d.amt && <Text style={styles.detailAmt}>{d.amt}</Text>}
                </View>
              );
            })}
          </View>

          {/* Timeline */}
          <Text style={styles.sectionLabel}>SERVICE TIMELINE</Text>
          <View style={styles.timelineCard}>
            {[
              {Icon: Check, label: 'Booking Confirmed', time: 'Just now · 10:24 AM', pill: 'You are here', active: true},
              {Icon: Zap, label: 'Operator Preparing', time: 'Equipment check & calibration'},
              {Icon: MapPin, label: 'Travel to Farm', time: 'En route to Patil Farm · 3.5 km'},
              {Icon: Clock, label: 'Service Starts', time: '06:30 AM · Tomorrow morning'},
              {Icon: Check, label: 'Spray Completed', time: '~07:05 AM · Spray report delivered'},
            ].map((t,i) => {
              const Icon = t.Icon;
              return (
                <View key={i} style={styles.timelineRow}>
                  <View>
                    <View style={[styles.timelineDot, t.active && {backgroundColor: GREEN}]}>
                      <Icon size={rf(11)} color={t.active ? '#FFFFFF' : MUTED} strokeWidth={2.4} />
                    </View>
                    {i < 4 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={{flex: 1, marginLeft: 12, paddingBottom: 16}}>
                    <Text style={styles.timelineLabel}>{t.label}</Text>
                    <Text style={styles.timelineTime}>{t.time}</Text>
                    {t.pill && (
                      <View style={styles.youPill}>
                        <Text style={styles.youText}>✓ {t.pill}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
          <View style={{flexDirection: 'row', gap: 10}}>
            <TouchableOpacity style={styles.quickCard}>
              <View style={[styles.quickIcon, {backgroundColor: '#ECFDF5'}]}>
                <Phone size={rf(18)} color={GREEN} strokeWidth={2.4} />
              </View>
              <Text style={styles.quickTitle}>Contact Operator</Text>
              <Text style={styles.quickSub}>Call Rahul Patil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickCard}>
              <View style={[styles.quickIcon, {backgroundColor: '#FFF7ED'}]}>
                <Headphones size={rf(18)} color="#F97316" strokeWidth={2.4} />
              </View>
              <Text style={styles.quickTitle}>Support</Text>
              <Text style={styles.quickSub}>24/7 Krishi Bazaar Help</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.viewBtn}>
          <FileText size={rf(14)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.viewText}>View Booking Details</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Bazaar')} style={styles.homeBtn}>
          <Home size={rf(14)} color={DARK_GREEN} strokeWidth={2.4} />
          <Text style={styles.homeText}>Back to Bazaar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F9FAFB'},
  hero: {height: 200},
  checkCircle: {position: 'absolute', top: 165, alignSelf: 'center', width: 56, height: 56, borderRadius: 28, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#F9FAFB', zIndex: 5},
  content: {padding: width * 0.037, paddingTop: 30, alignItems: 'center'},
  title: {fontSize: rf(20), fontWeight: '900', color: DARK, textAlign: 'center'},
  titleGreen: {fontSize: rf(20), fontWeight: '900', color: GREEN, textAlign: 'center'},
  desc: {marginTop: 8, fontSize: rf(11), color: MUTED, textAlign: 'center', lineHeight: rf(16), fontWeight: '600'},
  bookingIdPill: {marginTop: 12, paddingHorizontal: 14, height: 32, borderRadius: 16, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', alignItems: 'center', justifyContent: 'center'},
  bookingIdText: {fontSize: rf(11), fontWeight: '900', color: DARK_GREEN},
  sectionLabel: {alignSelf: 'flex-start', marginTop: 22, marginBottom: 8, fontSize: rf(11), fontWeight: '900', color: MUTED, letterSpacing: 0.5},
  opCard: {width: '100%', padding: 14, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER},
  opInitial: {width: 44, height: 44, borderRadius: 10, backgroundColor: DARK_GREEN, alignItems: 'center', justifyContent: 'center'},
  opInitialText: {fontSize: rf(15), fontWeight: '900', color: '#FFFFFF'},
  opName: {fontSize: rf(14), fontWeight: '900', color: DARK, lineHeight: rf(18)},
  starPill: {flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, height: 18, borderRadius: 9, backgroundColor: '#FFFBEB'},
  starTxt: {fontSize: rf(10), fontWeight: '900', color: DARK},
  dgca: {flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, height: 18, borderRadius: 9, backgroundColor: '#ECFDF5'},
  dgcaText: {fontSize: rf(9), fontWeight: '900', color: GREEN},
  confirmedPill: {flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, height: 22, borderRadius: 11, backgroundColor: '#F0FDF4'},
  confirmedDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN},
  confirmedText: {fontSize: rf(10), fontWeight: '900', color: GREEN},
  pilotAv: {width: 38, height: 38, borderRadius: 19, backgroundColor: '#E5E7EB'},
  pilotName: {fontSize: rf(12), fontWeight: '900', color: DARK},
  pilotRole: {marginTop: 2, fontSize: rf(10), color: MUTED, fontWeight: '600'},
  verifiedPill: {flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, height: 22, borderRadius: 11, backgroundColor: '#F0FDF4'},
  verifiedText: {fontSize: rf(10), fontWeight: '900', color: GREEN},
  statsRow: {marginTop: 14, paddingTop: 12, flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9'},
  statLbl: {fontSize: rf(10), color: MUTED, fontWeight: '600'},
  statVal: {marginTop: 3, fontSize: rf(13), fontWeight: '900', color: DARK},
  scheduleCard: {width: '100%', borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER, overflow: 'hidden'},
  scheduleHeader: {padding: 14, backgroundColor: DARK_GREEN, flexDirection: 'row', alignItems: 'center'},
  scheduleTitle: {fontSize: rf(13), fontWeight: '900', color: '#FFFFFF'},
  scheduleSub: {marginTop: 2, fontSize: rf(10), color: 'rgba(255,255,255,0.85)', fontWeight: '600'},
  scheduleRow: {padding: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9'},
  scheduleLbl: {fontSize: rf(9), fontWeight: '800', color: MUTED, letterSpacing: 0.3},
  scheduleVal: {marginTop: 3, fontSize: rf(13), fontWeight: '900', color: DARK},
  tuePill: {paddingHorizontal: 8, height: 22, borderRadius: 11, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center'},
  tueText: {fontSize: rf(10), fontWeight: '900', color: GREEN},
  farmMap: {width: '100%', height: 120, justifyContent: 'flex-start', padding: 10},
  gpsPill: {alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF'},
  gpsText: {fontSize: rf(10), fontWeight: '900', color: DARK_GREEN},
  farmInfo: {width: '100%', padding: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER, borderTopWidth: 0, borderBottomLeftRadius: 12, borderBottomRightRadius: 12},
  farmName: {fontSize: rf(15), fontWeight: '900', color: DARK},
  farmTags: {marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  farmTag: {paddingHorizontal: 10, height: 26, borderRadius: 13, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center'},
  farmTagText: {fontSize: rf(10), fontWeight: '800', color: DARK_GREEN},
  aiCard: {width: '100%', padding: 16, borderRadius: 14},
  aiIcon: {width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center'},
  aiTitle: {fontSize: rf(14), fontWeight: '900', color: '#FFFFFF'},
  aiSub: {marginTop: 2, fontSize: rf(10), color: 'rgba(255,255,255,0.85)', fontWeight: '600'},
  optimalPill: {paddingHorizontal: 10, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center'},
  optimalText: {fontSize: rf(10), fontWeight: '900', color: '#FFFFFF'},
  aiHead: {marginTop: 12, fontSize: rf(14), fontWeight: '900', color: '#FFFFFF'},
  aiDesc: {marginTop: 6, fontSize: rf(11), color: 'rgba(255,255,255,0.9)', lineHeight: rf(16), fontWeight: '500'},
  aiGrid: {marginTop: 10, flexDirection: 'row', gap: 8},
  aiCell: {flex: 1, padding: 12, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)'},
  aiCellVal: {marginTop: 6, fontSize: rf(15), fontWeight: '900', color: '#FFFFFF'},
  aiCellLbl: {marginTop: 2, fontSize: rf(8), fontWeight: '800', color: 'rgba(255,255,255,0.85)'},
  detailCard: {width: '100%', padding: 14, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER},
  summaryRow: {flexDirection: 'row', alignItems: 'center'},
  detailIcon: {width: 30, height: 30, borderRadius: 8, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center'},
  detailLabel: {fontSize: rf(9), fontWeight: '800', color: MUTED, letterSpacing: 0.3},
  detailVal: {marginTop: 2, fontSize: rf(12), fontWeight: '900', color: DARK},
  detailAmt: {fontSize: rf(15), fontWeight: '900', color: GREEN},
  timelineCard: {width: '100%', padding: 14, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER},
  timelineRow: {flexDirection: 'row'},
  timelineDot: {width: 24, height: 24, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center'},
  timelineLine: {position: 'absolute', top: 24, left: 11, width: 2, height: 40, backgroundColor: '#E5E7EB'},
  timelineLabel: {fontSize: rf(12), fontWeight: '900', color: DARK},
  timelineTime: {marginTop: 2, fontSize: rf(10), color: MUTED, fontWeight: '600'},
  youPill: {marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 8, height: 22, borderRadius: 11, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center'},
  youText: {fontSize: rf(9), fontWeight: '900', color: '#FFFFFF'},
  quickCard: {flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER, alignItems: 'center'},
  quickIcon: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
  quickTitle: {marginTop: 10, fontSize: rf(12), fontWeight: '900', color: DARK},
  quickSub: {marginTop: 2, fontSize: rf(10), color: MUTED, fontWeight: '600', textAlign: 'center'},
  bottomBar: {position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: BORDER, gap: 10},
  viewBtn: {height: 50, borderRadius: 12, backgroundColor: DARK_GREEN, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
  viewText: {fontSize: rf(13), fontWeight: '900', color: '#FFFFFF'},
  homeBtn: {height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: DARK_GREEN, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
  homeText: {fontSize: rf(13), fontWeight: '900', color: DARK_GREEN},
});