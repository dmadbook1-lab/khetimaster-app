import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
  RefreshCw,
  Check,
  ChevronDown,
  Pencil,
  Sparkles,
  ArrowRight,
  Zap,
  User,
  FileText,
  Shield,
} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';
import {tOpt} from '../../utils/tOpt';
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
const SERVICES = [
  {
    id: 'pest',
    name: 'Pesticide Spraying',
    get desc() {
    return i18n.t('bookDroneService.targetedPestControlCoverage');
  },
    price: '750',
  },
  {
    id: 'liq',
    name: 'Liquid Fertilizer',
    get desc() {
    return i18n.t('bookDroneService.uniformNutrientDistribution');
  },
    price: '700',
  },
  {
    id: 'micro',
    name: 'Micronutrient Spray',
    get desc() {
    return i18n.t('bookDroneService.zincBoronIronTreatment');
  },
    price: '720',
  },
  {
    id: 'bio',
    name: 'Bio-Stimulant Spray',
    get desc() {
    return i18n.t('bookDroneService.naturalGrowthEnhancerSpray');
  },
    price: '800',
  },
  {
    id: 'survey',
    name: 'Crop Survey & Mapping',
    get desc() {
    return i18n.t('bookDroneService.aerialNdviRgbMapping');
  },
    price: '650',
  },
];
const DATES = [
  {
    day: 'TUE',
    date: '20',
    get label() {
    return i18n.t('common.today');
  },
  },
  {
    day: 'WED',
    date: '21',
    get label() {
    return i18n.t('bookDroneService.aiPick');
  },
    selected: true,
  },
  {
    day: 'THU',
    date: '22',
  },
  {
    day: 'FRI',
    date: '23',
  },
  {
    day: 'SAT',
    date: '24',
  },
];
const TIMES = ['05:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM'];
export default function BookDroneServiceScreen({ navigation }) {
  const {t} = useTranslation();
  const [service, setService] = useState('pest');
  const [material, setMaterial] = useState('provide');
  const [date, setDate] = useState('21');
  const [time, setTime] = useState('05:00 AM');
  const [instructions, setInstructions] = useState('');
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {}
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
          <Text style={styles.headerTitle}>{t('bookDroneService.bookDroneService')}</Text>
          <Text style={styles.headerSub}>{t('bookDroneService.skyagriDroneServices')}</Text>
        </View>
        <View style={styles.progressPill} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {}
        <View style={styles.opCard}>
          <View style={styles.opInitial}>
            <Text style={styles.opInitialText}>{t('bookDroneService.sa')}</Text>
          </View>
          <View
            style={{
              flex: 1,
              marginLeft: 12,
            }}
          >
            <Text style={styles.opName}>{t('bookDroneService.skyagriDroneServices')}</Text>
            <View style={styles.opMetaRow}>
              <Star
                size={rf(11)}
                color="#F59E0B"
                fill="#F59E0B"
                strokeWidth={1.5}
              />
              <Text style={styles.opRating}>4.9</Text>
              <View style={styles.dgca}>
                <BadgeCheck size={rf(10)} color={GREEN} strokeWidth={2.4} />
                <Text style={styles.dgcaText}>{t('bookDroneService.dgcaCertified')}</Text>
              </View>
            </View>
            <View style={styles.availPill}>
              <View style={styles.availDot} />
              <Text style={styles.availText}>{t('bookDroneService.availableTomorrow')}</Text>
            </View>
          </View>
          <View
            style={{
              alignItems: 'flex-end',
            }}
          >
            <Text style={styles.opPrice}>₹750</Text>
            <Text style={styles.opUnit}>{t('bookDroneService.acre')}</Text>
          </View>
        </View>

        {}
        <Text style={styles.sectionLabel}>{t('bookDroneService.selectFarm')}</Text>
        <View style={styles.farmCard}>
          <View style={styles.farmHeader}>
            <View>
              <Text style={styles.farmName}>{t('bookDroneService.patil')}{'\n'}{t('common.farm')}</Text>
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 14,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <MapPin size={rf(12)} color={MUTED} strokeWidth={2.4} />
                <Text style={styles.farmLoc}>{t('bookDroneService.ahmednagar')}{'\n'}{t('bookDroneService.maharashtra')}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.changeBtn}>
              <RefreshCw size={rf(11)} color={DARK_GREEN} strokeWidth={2.4} />
              <Text style={styles.changeText}>{t('bookDroneService.change')}{'\n'}{t('common.farm')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.farmStats}>
            <View style={styles.farmStat}>
              <Text style={styles.farmStatVal}>{t('bookDroneService.soybean')}</Text>
              <Text style={styles.farmStatLbl}>{t('bookDroneService.cropType')}</Text>
            </View>
            <View style={styles.farmStat}>
              <Text style={styles.farmStatVal}>{t('bookDroneService.234Acres')}</Text>
              <Text style={styles.farmStatLbl}>{t('bookDroneService.totalArea')}</Text>
            </View>
            <View style={styles.farmStat}>
              <Text style={styles.farmStatVal}>{t('bookDroneService.42Days')}</Text>
              <Text style={styles.farmStatLbl}>{t('bookDroneService.cropAge')}</Text>
            </View>
          </View>
        </View>

        {}
        <Text style={styles.sectionLabel}>{t('bookDroneService.serviceType')}</Text>
        {SERVICES.map(s => {
          const active = service === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => setService(s.id)}
              activeOpacity={0.85}
              style={[styles.serviceCard, active && styles.serviceCardActive]}
            >
              <View style={styles.serviceIcon}>
                <Zap
                  size={rf(16)}
                  color={active ? GREEN : MUTED}
                  strokeWidth={2.2}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  marginLeft: 12,
                }}
              >
                <Text style={styles.serviceName}>{tOpt(s.name)}</Text>
                <Text style={styles.serviceDesc}>{s.desc}</Text>
              </View>
              <Text
                style={[
                  styles.servicePrice,
                  active && {
                    color: GREEN,
                  },
                ]}
              >
                {t('bookDroneService.ac', {price: s.price})}
              </Text>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && (
                  <Check size={rf(12)} color="#FFFFFF" strokeWidth={3} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {}
        <Text style={styles.sectionLabel}>{t('bookDroneService.sprayMaterial')}</Text>
        <TouchableOpacity
          onPress={() => setMaterial('provide')}
          activeOpacity={0.85}
          style={[
            styles.matCard,
            material === 'provide' && styles.matCardActive,
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={styles.matIcon}>
              <FileText size={rf(15)} color={GREEN} strokeWidth={2.2} />
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 10,
              }}
            >
              <Text style={styles.matTitle}>{t('bookDroneService.iWillProvideMaterial')}</Text>
              <Text style={styles.matSub}>
                {t('bookDroneService.youBringTheChemicalFertilizer')}
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                material === 'provide' && styles.radioActive,
              ]}
            >
              {material === 'provide' && (
                <Check size={rf(12)} color="#FFFFFF" strokeWidth={3} />
              )}
            </View>
          </View>

          {material === 'provide' && (
            <>
              <Text style={styles.fieldLabel}>{t('bookDroneService.chemical')}</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownText}>{t('bookDroneService.chlorpyrifos20Ec')}</Text>
                <ChevronDown size={rf(14)} color={MUTED} />
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>{t('bookDroneService.quantity')}</Text>
              <View style={styles.dropdown}>
                <Text style={styles.dropdownText}>{t('bookDroneService.2LitresPerAcre')}</Text>
                <Pencil size={rf(13)} color={MUTED} />
              </View>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMaterial('operator')}
          activeOpacity={0.85}
          style={[
            styles.matCard,
            {
              marginTop: 10,
            },
            material === 'operator' && styles.matCardActive,
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={styles.matIcon}>
              <User size={rf(15)} color={MUTED} strokeWidth={2.2} />
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 10,
              }}
            >
              <Text style={styles.matTitle}>{t('bookDroneService.operatorWillProvide')}</Text>
              <Text style={styles.matSub}>{t('bookDroneService.preMixedMaterial200Acre')}</Text>
            </View>
            <View
              style={[
                styles.radio,
                material === 'operator' && styles.radioActive,
              ]}
            >
              {material === 'operator' && (
                <Check size={rf(12)} color="#FFFFFF" strokeWidth={3} />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {}
        <Text style={styles.sectionLabel}>{t('bookDroneService.bookingDate')}</Text>
        <View style={styles.dateRow}>
          {DATES.map(d => {
            const active = date === d.date;
            return (
              <TouchableOpacity
                key={d.date}
                onPress={() => setDate(d.date)}
                style={[styles.dateCard, active && styles.dateCardActive]}
              >
                <Text
                  style={[
                    styles.dateDay,
                    active && {
                      color: '#FFFFFF',
                    },
                  ]}
                >
                  {d.day}
                </Text>
                <Text
                  style={[
                    styles.dateNum,
                    active && {
                      color: '#FFFFFF',
                    },
                  ]}
                >
                  {d.date}
                </Text>
                {d.label && (
                  <Text
                    style={[
                      styles.dateLbl,
                      active && {
                        color: '#FEF08A',
                      },
                    ]}
                  >
                    {d.label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {}
        <Text style={styles.sectionLabel}>{t('bookDroneService.timeSlot')}</Text>
        <View style={styles.timeGrid}>
          {TIMES.map(t => {
            const active = time === t;
            const ai = t === '05:00 AM' || t === '07:00 AM';
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setTime(t)}
                style={[styles.timeCard, active && styles.timeCardActive]}
              >
                {ai && <View style={styles.aiTimeDot} />}
                <Text
                  style={[
                    styles.timeText,
                    active && {
                      color: '#FFFFFF',
                    },
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.aiNote}>
          <View style={styles.aiNoteDot} />
          <Text style={styles.aiNoteText}>
            {t('bookDroneService.orangeDotAiRecommendedTime')}
          </Text>
        </View>

        {}
        <LinearGradient
          colors={['#16A34A', '#15803D']}
          style={styles.smartCard}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={styles.smartIcon}>
              <Zap size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 10,
              }}
            >
              <Text style={styles.smartTitle}>{t('bookDroneService.smartSprayPlan')}</Text>
              <Text style={styles.smartSub}>{t('bookDroneService.patilFarmSoybean')}</Text>
            </View>
            <View style={styles.idealPill}>
              <Star
                size={rf(9)}
                color="#FFFFFF"
                fill="#FFFFFF"
                strokeWidth={1.5}
              />
              <Text style={styles.idealText}>{t('bookDroneService.ideal')}</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              marginTop: 12,
            }}
          >
            <View style={styles.smartStat}>
              <Text style={styles.smartLbl}>{t('bookDroneService.bestTime')}</Text>
              <Text style={styles.smartVal}>{t('bookDroneService.0630Am')}</Text>
            </View>
            <View style={styles.smartStat}>
              <Text style={styles.smartLbl}>{t('bookDroneService.windSpeed')}</Text>
              <Text style={styles.smartVal}>{t('bookDroneService.lowIdeal')}</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              marginTop: 8,
            }}
          >
            <View style={styles.smartStat}>
              <Text style={styles.smartLbl}>{t('bookDroneService.area')}</Text>
              <Text style={styles.smartVal}>{t('bookDroneService.234Acres')}</Text>
            </View>
            <View style={styles.smartStat}>
              <Text style={styles.smartLbl}>{t('bookDroneService.recommended')}</Text>
              <Text style={styles.smartVal}>{t('bookDroneService.pesticide')}</Text>
            </View>
          </View>

          <View style={styles.smartMetrics}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
              }}
            >
              <Text style={styles.smartMetricVal}>{t('bookDroneService.35Min')}</Text>
              <Text style={styles.smartMetricLbl}>{t('bookDroneService.duration')}</Text>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
              }}
            >
              <Text style={styles.smartMetricVal}>90%</Text>
              <Text style={styles.smartMetricLbl}>{t('bookDroneService.waterSaving')}</Text>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
              }}
            >
              <Text style={styles.smartMetricVal}>98%</Text>
              <Text style={styles.smartMetricLbl}>{t('bookDroneService.accuracy')}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.whyBtn}>
            <Text style={styles.whyText}>{t('bookDroneService.whyThisRecommendation')}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {}
        <Text style={styles.sectionLabel}>{t('bookDroneService.farmMap')}</Text>
        <View style={styles.mapCard}>
          <ImageBackground
            source={require('../../assets/drone/farm-map.png')}
            style={styles.mapImg}
            imageStyle={{
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          />
          <View style={styles.mapFooter}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <MapPin size={rf(14)} color={GREEN} strokeWidth={2.4} />
              <View
                style={{
                  marginLeft: 8,
                }}
              >
                <Text style={styles.mapName}>{t('bookDroneService.patilFarm')}</Text>
                <Text style={styles.mapMeta}>{t('bookDroneService.234AcresAhmednagar')}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewFarmBtn}>
              <Text style={styles.viewFarmText}>{t('bookDroneService.viewFullFarm')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {}
        <Text style={styles.sectionLabel}>{t('bookDroneService.priceSummary')}</Text>
        <View style={styles.priceBox}>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceKey}>{t('bookDroneService.droneService')}</Text>
              <Text style={styles.priceSub}>{t('bookDroneService.750234Acres')}</Text>
            </View>
            <Text style={styles.priceVal}>₹1,755</Text>
          </View>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceKey}>{t('bookDroneService.travelCharge')}</Text>
              <Text style={styles.priceSub}>{t('bookDroneService.within5KmFree')}</Text>
            </View>
            <Text
              style={[
                styles.priceVal,
                {
                  color: GREEN,
                },
              ]}
            >
              {t('bookDroneService.free')}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceKey}>{t('bookDroneService.platformFee')}</Text>
            <Text style={styles.priceVal}>₹99</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceKey}>{t('bookDroneService.gst18')}</Text>
            <Text style={styles.priceVal}>₹176</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalKey}>{t('bookDroneService.grandTotal')}</Text>
            <Text style={styles.totalVal}>₹2,030</Text>
          </View>
        </View>

        {}
        <Text style={styles.sectionLabel}>{t('bookDroneService.serviceIncludes')}</Text>
        <View style={styles.incGrid}>
          {[
            {
              Icon: User,
              label: t('bookDroneService.certifiedPilot'),
            },
            {
              Icon: Zap,
              label: t('bookDroneService.droneEquipment'),
            },
            {
              Icon: Shield,
              label: t('bookDroneService.safetyGear'),
            },
            {
              Icon: FileText,
              label: t('bookDroneService.sprayReport'),
            },
          ].map(i => {
            const Icon = i.Icon;
            return (
              <View key={i.label} style={styles.incCard}>
                <Icon size={rf(14)} color={GREEN} strokeWidth={2.4} />
                <Text style={styles.incText}>{i.label}</Text>
              </View>
            );
          })}
        </View>

        {}
        <Text style={styles.sectionLabel}>{t('bookDroneService.specialInstructions')}</Text>
        <View style={styles.instBox}>
          <TextInput
            value={instructions}
            onChangeText={setInstructions}
            placeholder={t('bookDroneService.addInstructionsForTheDrone')}
            placeholderTextColor="#94A3B8"
            multiline
            style={styles.instInput}
            maxLength={500}
          />
          <Text style={styles.instCount}>{instructions.length} / 500</Text>
        </View>
      </ScrollView>

      {}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLbl}>{t('bookDroneService.totalAmount')}</Text>
          <Text style={styles.bottomAmt}>₹2,030</Text>
          <Text style={styles.bottomSub}>{t('bookDroneService.inclGstPlatformFee')}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ConfirmDroneBooking')}
          style={styles.continueBtn}
        >
          <Text style={styles.continueText}>{t('common.continue')}</Text>
          <ArrowRight size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
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
  progressPill: {
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: GREEN,
  },
  scroll: {
    padding: width * 0.037,
    paddingBottom: 120,
  },
  opCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  opInitial: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opInitialText: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  opName: {
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },
  opMetaRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  opRating: {
    fontSize: rf(11),
    fontWeight: '800',
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
  availPill: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F97316',
  },
  availText: {
    fontSize: rf(10),
    fontWeight: '800',
    color: '#F97316',
  },
  opPrice: {
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },
  opUnit: {
    fontSize: rf(9),
    color: MUTED,
    fontWeight: '600',
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: rf(11),
    fontWeight: '900',
    color: MUTED,
    letterSpacing: 0.5,
  },
  farmCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: GREEN,
  },
  farmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmName: {
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
    lineHeight: rf(19),
  },
  farmLoc: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
    lineHeight: rf(15),
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
  },
  changeText: {
    fontSize: rf(10),
    fontWeight: '800',
    color: DARK_GREEN,
    lineHeight: rf(13),
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
    backgroundColor: '#ECFDF5',
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
  serviceCard: {
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceCardActive: {
    borderColor: GREEN,
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
  },
  serviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  serviceDesc: {
    marginTop: 2,
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
  },
  servicePrice: {
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
    marginRight: 8,
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
  matCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  matCardActive: {
    borderColor: GREEN,
    borderWidth: 2,
  },
  matIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matTitle: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  matSub: {
    marginTop: 2,
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
  },
  fieldLabel: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: rf(10),
    fontWeight: '800',
    color: MUTED,
    letterSpacing: 0.3,
  },
  dropdown: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  dropdownText: {
    fontSize: rf(12),
    fontWeight: '700',
    color: DARK,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
  },
  dateCardActive: {
    backgroundColor: DARK_GREEN,
    borderColor: DARK_GREEN,
  },
  dateDay: {
    fontSize: rf(10),
    fontWeight: '700',
    color: MUTED,
  },
  dateNum: {
    marginTop: 3,
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
  },
  dateLbl: {
    marginTop: 3,
    fontSize: rf(9),
    fontWeight: '900',
    color: '#F97316',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeCard: {
    width: (width - width * 0.074 - 16) / 3,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timeCardActive: {
    backgroundColor: DARK_GREEN,
    borderColor: DARK_GREEN,
  },
  aiTimeDot: {
    position: 'absolute',
    top: 6,
    left: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F97316',
  },
  timeText: {
    fontSize: rf(11),
    fontWeight: '800',
    color: DARK,
  },
  aiNote: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiNoteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F97316',
  },
  aiNoteText: {
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
  },
  smartCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
  },
  smartIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smartTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  smartSub: {
    marginTop: 2,
    fontSize: rf(10),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  idealPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  idealText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  smartStat: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  smartLbl: {
    fontSize: rf(9),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  smartVal: {
    marginTop: 3,
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  smartMetrics: {
    marginTop: 12,
    flexDirection: 'row',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  smartMetricVal: {
    fontSize: rf(18),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  smartMetricLbl: {
    marginTop: 2,
    fontSize: rf(9),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  whyBtn: {
    marginTop: 12,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyText: {
    fontSize: rf(12),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mapCard: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
  },
  mapImg: {
    height: 130,
  },
  mapFooter: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapName: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  mapMeta: {
    marginTop: 2,
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
  },
  viewFarmBtn: {
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewFarmText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK_GREEN,
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
    marginTop: 8,
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
    borderStyle: 'dashed',
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
  incGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  incCard: {
    width: (width - width * 0.074 - 8) / 2,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  incText: {
    fontSize: rf(11),
    fontWeight: '800',
    color: DARK,
  },
  instBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    minHeight: 100,
  },
  instInput: {
    fontSize: rf(12),
    color: DARK,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  instCount: {
    alignSelf: 'flex-end',
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
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
  continueBtn: {
    height: 52,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
