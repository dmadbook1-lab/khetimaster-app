import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Star,
  BadgeCheck,
  MapPin,
  Calendar,
  Clock,
  Zap,
  Check,
  ChevronDown,
  Sparkles,
  CreditCard,
  Wallet,
  Smartphone,
  ShieldCheck,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16A34A';
const DARK_GREEN = '#15803D';
const DARK = '#111827';
const MUTED = '#64748B';
const BORDER = '#E5E7EB';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function ConfirmDroneBookingScreen({ navigation }) {
  const [payment, setPayment] = useState('cod');
  const [agree, setAgree] = useState(true);
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <ArrowLeft size={rf(20)} color={DARK} strokeWidth={2.4} />
        </TouchableOpacity>
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <Text style={styles.headerTitle}>Confirm Drone Booking</Text>
          <Text style={styles.headerSub}>Review your booking details</Text>
        </View>
        <View
          style={{
            width: 40,
          }}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {}
        <View style={styles.opCard}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={styles.opInitial}>
              <Text style={styles.opInitialText}>SA</Text>
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 12,
              }}
            >
              <Text style={styles.opName}>SkyAgri Drone Services</Text>
              <View
                style={{
                  marginTop: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <View style={styles.starPill}>
                  <Star
                    size={rf(10)}
                    color="#F59E0B"
                    fill="#F59E0B"
                    strokeWidth={1.5}
                  />
                  <Text style={styles.starTxt}>4.9</Text>
                </View>
                <View style={styles.dgca}>
                  <BadgeCheck size={rf(10)} color={GREEN} strokeWidth={2.4} />
                  <Text style={styles.dgcaText}>DGCA Certified</Text>
                </View>
              </View>
              <Text style={styles.opMeta}>
                186 Reviews · 5+ Years in Service
              </Text>
            </View>
          </View>
          <View style={styles.pilotRow}>
            <Image
              source={require('../../assets/drone/hero.jpg')}
              style={styles.pilotAv}
            />
            <View
              style={{
                flex: 1,
                marginLeft: 10,
              }}
            >
              <Text style={styles.pilotName}>Rahul Patil</Text>
              <Text style={styles.pilotRole}>Certified Drone Pilot</Text>
            </View>
            <View style={styles.morningPill}>
              <Text style={styles.morningText}>● Tomorrow Morning</Text>
            </View>
          </View>
        </View>

        {}
        <Text style={styles.sectionLabel}>FARM DETAILS</Text>
        <ImageBackground
          source={require('../../assets/drone/farm-map.png')}
          style={styles.farmMap}
          imageStyle={{
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <View style={styles.gpsPill}>
            <MapPin size={rf(10)} color={DARK_GREEN} strokeWidth={2.4} />
            <Text style={styles.gpsText}>GPS Boundary Verified</Text>
          </View>
        </ImageBackground>
        <View style={styles.farmInfo}>
          <Text style={styles.farmName}>Patil Farm</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 3,
              gap: 4,
            }}
          >
            <MapPin size={rf(11)} color={MUTED} strokeWidth={2.4} />
            <Text style={styles.farmLoc}>Ahmednagar, Maharashtra</Text>
          </View>
          <View style={styles.farmStats}>
            {[
              {
                v: 'Soybean',
                l: 'Crop',
              },
              {
                v: '2.34 Ac',
                l: 'Area',
              },
              {
                v: '42 Days',
                l: 'Crop Age',
              },
            ].map(s => (
              <View key={s.l} style={styles.farmStat}>
                <Text style={styles.farmStatVal}>{s.v}</Text>
                <Text style={styles.farmStatLbl}>{s.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {}
        <Text style={styles.sectionLabel}>BOOKING DETAILS</Text>
        <View style={styles.detailCard}>
          {[
            {
              Icon: Calendar,
              label: 'DATE',
              val: 'Wednesday, 21 May 2025',
              sub: 'AI Recommended Date',
              pill: 'AI Pick',
            },
            {
              Icon: Clock,
              label: 'TIME SLOT',
              val: '06:00 AM - 07:00 AM',
              sub: 'Early morning - Best for spraying',
            },
            {
              Icon: Zap,
              label: 'SERVICE TYPE',
              val: 'Pesticide Spraying',
              sub: 'Targeted pest control · ₹750/Acre',
            },
            {
              Icon: Zap,
              label: 'SPRAY MATERIAL',
              val: 'I Will Provide Material',
              sub: 'Chlorpyrifos 20 EC · 2 L/Acre',
            },
          ].map((d, i) => {
            const Icon = d.Icon;
            return (
              <View
                key={i}
                style={[
                  styles.detailRow,
                  i > 0 && {
                    borderTopWidth: 1,
                    borderTopColor: '#F1F5F9',
                    paddingTop: 12,
                    marginTop: 12,
                  },
                ]}
              >
                <View style={styles.detailIcon}>
                  <Icon size={rf(14)} color={GREEN} strokeWidth={2.4} />
                </View>
                <View
                  style={{
                    flex: 1,
                    marginLeft: 12,
                  }}
                >
                  <Text style={styles.detailLabel}>{d.label}</Text>
                  <Text style={styles.detailVal}>{d.val}</Text>
                  <Text style={styles.detailSub}>{d.sub}</Text>
                </View>
                {d.pill && (
                  <View style={styles.aiPickPill}>
                    <Text style={styles.aiPickText}>{d.pill}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {}
        <Text style={styles.sectionLabel}>AI SMART SPRAY ANALYSIS</Text>
        <LinearGradient colors={['#16A34A', '#15803D']} style={styles.aiCard}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={styles.aiIcon}>
              <Sparkles size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 10,
              }}
            >
              <Text style={styles.aiTitle}>AI Smart Spray{'\n'}Analysis</Text>
              <Text style={styles.aiSub}>
                Patil Farm · Soybean · 2.34 Acres
              </Text>
            </View>
            <View style={styles.approvedPill}>
              <Text style={styles.approvedText}>AI{'\n'}APPROVED</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              gap: 6,
              marginTop: 12,
            }}
          >
            {[
              {
                l: 'WEATHER',
                v: 'Ideal',
              },
              {
                l: 'WIND',
                v: 'Low',
              },
              {
                l: 'TEMP',
                v: '27°C',
              },
              {
                l: 'HUMIDITY',
                v: 'Perfect',
              },
            ].map(s => (
              <View key={s.l} style={styles.aiChip}>
                <Text style={styles.aiChipVal}>{s.v}</Text>
                <Text style={styles.aiChipLbl}>{s.l}</Text>
              </View>
            ))}
          </View>
          <View style={styles.aiInfoRow}>
            {[
              {
                l: 'GROWTH STAGE',
                v: 'Vegetative',
              },
              {
                l: 'BEST TIME',
                v: '06:30 AM',
              },
              {
                l: 'DURATION',
                v: '35 Min',
              },
            ].map(s => (
              <View
                key={s.l}
                style={{
                  flex: 1,
                  alignItems: 'center',
                }}
              >
                <Text style={styles.aiInfoVal}>{s.v}</Text>
                <Text style={styles.aiInfoLbl}>{s.l}</Text>
              </View>
            ))}
          </View>
          <View
            style={{
              marginTop: 10,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={styles.effLabel}>Spray Efficiency</Text>
              <Text style={styles.effLabel}>98%</Text>
            </View>
            <View style={styles.effBar}>
              <View style={styles.effFill} />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              marginTop: 12,
            }}
          >
            {[
              {
                v: '96%',
                l: 'EFFICIENCY',
              },
              {
                v: '90%',
                l: 'WATER SAVED',
              },
              {
                v: '35 Min',
                l: 'EST. DURATION',
              },
            ].map(s => (
              <View key={s.l} style={styles.effStat}>
                <Text style={styles.effStatVal}>{s.v}</Text>
                <Text style={styles.effStatLbl}>{s.l}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.whyBtn}>
            <Text style={styles.whyText}>ⓘ Why this recommendation? ›</Text>
          </TouchableOpacity>
        </LinearGradient>

        {}
        <Text style={styles.sectionLabel}>PRICE SUMMARY</Text>
        <View style={styles.priceBox}>
          {[
            {
              k: 'Drone Service',
              s: '750 × 2.34 Acres',
              v: '₹1,755',
            },
            {
              k: 'Travel Charge',
              s: 'Within 5 km · Free',
              v: 'FREE',
              green: true,
            },
            {
              k: 'Platform Fee',
              v: '₹99',
            },
            {
              k: 'GST (18%)',
              v: '₹176',
            },
          ].map((p, i) => (
            <View key={i} style={styles.priceRow}>
              <View>
                <Text style={styles.priceKey}>{p.k}</Text>
                {p.s && <Text style={styles.priceSub}>{p.s}</Text>}
              </View>
              <Text
                style={[
                  styles.priceVal,
                  p.green && {
                    color: GREEN,
                  },
                ]}
              >
                {p.v}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalKey}>Grand Total</Text>
            <Text style={styles.totalVal}>₹2,030</Text>
          </View>
        </View>

        {}
        <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
        {[
          {
            id: 'cod',
            Icon: Wallet,
            title: 'Pay After Service',
            sub: 'Cash on delivery · Recommended',
            pill: 'DEFAULT',
          },
          {
            id: 'upi',
            Icon: Smartphone,
            title: 'UPI',
            sub: 'GPay, PhonePe, Paytm',
          },
          {
            id: 'card',
            Icon: CreditCard,
            title: 'Credit / Debit Card',
            sub: 'Visa, Mastercard, RuPay',
          },
          {
            id: 'wallet',
            Icon: Wallet,
            title: 'KhetiMaster Wallet',
            sub: 'Balance: ₹450',
          },
        ].map(p => {
          const Icon = p.Icon;
          const active = payment === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => setPayment(p.id)}
              style={[styles.payCard, active && styles.payCardActive]}
            >
              <View style={styles.payIcon}>
                <Icon
                  size={rf(15)}
                  color={active ? GREEN : MUTED}
                  strokeWidth={2.2}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  marginLeft: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Text style={styles.payTitle}>{p.title}</Text>
                  {p.pill && (
                    <View style={styles.defaultPill}>
                      <Text style={styles.defaultText}>{p.pill}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.paySub}>{p.sub}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && (
                  <Check size={rf(12)} color="#FFFFFF" strokeWidth={3} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {}
        <Text style={styles.sectionLabel}>CANCELLATION POLICY</Text>
        <View style={styles.cancelCard}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Clock size={rf(15)} color="#F97316" strokeWidth={2.4} />
            <Text style={styles.cancelTitle}>Free Cancellation Policy</Text>
            <View
              style={{
                flex: 1,
              }}
            />
            <ChevronDown size={rf(14)} color={MUTED} />
          </View>
          <Text style={styles.cancelText}>
            <Text
              style={{
                color: GREEN,
                fontWeight: '900',
              }}
            >
              Free cancellation
            </Text>{' '}
            up to{' '}
            <Text
              style={{
                fontWeight: '900',
                color: DARK,
              }}
            >
              3 hours
            </Text>{' '}
            before scheduled service. After that, a{' '}
            <Text
              style={{
                color: GREEN,
                fontWeight: '900',
              }}
            >
              50% cancellation fee
            </Text>{' '}
            applies.
          </Text>
        </View>

        {}
        <Text style={styles.sectionLabel}>TERMS & SAFETY</Text>
        <TouchableOpacity
          onPress={() => setAgree(!agree)}
          style={styles.termRow}
        >
          <View style={[styles.checkbox, agree && styles.checkboxActive]}>
            {agree && <Check size={rf(11)} color="#FFFFFF" strokeWidth={3} />}
          </View>
          <Text style={styles.termText}>
            I agree to the{' '}
            <Text
              style={{
                color: GREEN,
                fontWeight: '900',
              }}
            >
              drone service terms
            </Text>{' '}
            and{' '}
            <Text
              style={{
                color: GREEN,
                fontWeight: '900',
              }}
            >
              safety guidelines
            </Text>{' '}
            set by KhetiMaster and the operator.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLbl}>TOTAL AMOUNT</Text>
          <Text style={styles.bottomAmt}>₹2,030</Text>
          <Text style={styles.bottomSub}>Incl. GST & Platform Fee</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.replace('DroneBookingSuccess')}
          style={styles.confirmBtn}
        >
          <Text style={styles.confirmText}>Confirm Booking</Text>
          <ShieldCheck size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    height: 60,
    paddingHorizontal: width * 0.037,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },
  headerSub: {
    marginTop: 2,
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
  },
  scroll: {
    padding: width * 0.037,
    paddingBottom: 130,
  },
  opCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  opInitial: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opInitialText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  opName: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },
  starPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFBEB',
  },
  starTxt: {
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK,
  },
  dgca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ECFDF5',
  },
  dgcaText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: GREEN,
  },
  opMeta: {
    marginTop: 4,
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
  },
  pilotRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pilotAv: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E5E7EB',
  },
  pilotName: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  pilotRole: {
    marginTop: 2,
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
  },
  morningPill: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
  },
  morningText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#F97316',
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: rf(11),
    fontWeight: '900',
    color: MUTED,
    letterSpacing: 0.5,
  },
  farmMap: {
    height: 130,
    justifyContent: 'flex-start',
    padding: 10,
  },
  gpsPill: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  gpsText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK_GREEN,
  },
  farmInfo: {
    padding: 14,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderTopWidth: 0,
  },
  farmName: {
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },
  farmLoc: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },
  farmStats: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  farmStat: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
  },
  farmStatVal: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK_GREEN,
  },
  farmStatLbl: {
    marginTop: 2,
    fontSize: rf(9),
    color: MUTED,
    fontWeight: '600',
  },
  detailCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: rf(9),
    fontWeight: '800',
    color: MUTED,
    letterSpacing: 0.3,
  },
  detailVal: {
    marginTop: 3,
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },
  detailSub: {
    marginTop: 2,
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
  },
  aiPickPill: {
    paddingHorizontal: 8,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiPickText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: GREEN,
  },
  aiCard: {
    padding: 16,
    borderRadius: 16,
  },
  aiIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: rf(18),
  },
  aiSub: {
    marginTop: 3,
    fontSize: rf(10),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  approvedPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
  },
  approvedText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  aiChip: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  aiChipVal: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiChipLbl: {
    marginTop: 2,
    fontSize: rf(8),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
  },
  aiInfoRow: {
    marginTop: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  aiInfoVal: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiInfoLbl: {
    marginTop: 2,
    fontSize: rf(8),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
  },
  effLabel: {
    fontSize: rf(10),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  effBar: {
    marginTop: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  effFill: {
    height: '100%',
    width: '98%',
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  effStat: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
  },
  effStatVal: {
    fontSize: rf(16),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  effStatLbl: {
    marginTop: 2,
    fontSize: rf(8),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  whyBtn: {
    marginTop: 12,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyText: {
    fontSize: rf(11),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  priceBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  priceKey: {
    fontSize: rf(12),
    color: DARK,
    fontWeight: '700',
  },
  priceSub: {
    marginTop: 1,
    fontSize: rf(9),
    color: MUTED,
    fontWeight: '500',
  },
  priceVal: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginTop: 12,
  },
  totalKey: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },
  totalVal: {
    fontSize: rf(17),
    fontWeight: '900',
    color: GREEN,
  },
  payCard: {
    padding: 14,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  payCardActive: {
    borderColor: GREEN,
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
  },
  payIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payTitle: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  paySub: {
    marginTop: 2,
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
  },
  defaultPill: {
    paddingHorizontal: 6,
    height: 16,
    borderRadius: 4,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  cancelCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  cancelTitle: {
    marginLeft: 8,
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },
  cancelText: {
    marginTop: 10,
    marginLeft: 24,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
    lineHeight: rf(16),
  },
  termRow: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  termText: {
    flex: 1,
    fontSize: rf(11),
    color: DARK,
    fontWeight: '600',
    lineHeight: rf(16),
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomLbl: {
    fontSize: rf(9),
    color: MUTED,
    fontWeight: '700',
  },
  bottomAmt: {
    fontSize: rf(20),
    fontWeight: '900',
    color: DARK,
  },
  bottomSub: {
    fontSize: rf(9),
    color: MUTED,
    fontWeight: '500',
  },
  confirmBtn: {
    height: 52,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmText: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
