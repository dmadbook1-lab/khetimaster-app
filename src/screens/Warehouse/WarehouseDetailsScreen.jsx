import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  ExternalLink,
  Hash,
  Landmark,
  Mail,
  MapPin,
  Navigation,
  Package,
  Phone,
  ShieldAlert,
  Weight,
} from 'lucide-react-native';

import { useLocation } from '../../context/LocationContext';
import { TopInset } from '../../components/market/MarketHero';
import { openExternal } from '../../components/warehouse/openExternal';
import {
  CATEGORY_META,
  WAREHOUSE_ART,
  WH,
  WH_GRADIENT,
  WH_SHADOW,
} from '../../components/warehouse/theme';
import {
  dialUrl,
  directionsUrl,
  distanceBetween,
  formatCapacity,
  formatDistance,
  formatPreparedDate,
  sourceUrlOf,
  warehouseById,
} from '../../utils/warehouseData';
import {useTranslation} from 'react-i18next';

function InfoRow({ Icon, label, value, note, onPress, last }) {
  const body = (
    <>
      <View style={styles.rowIcon}>
        <Icon size={16} color={WH.steel} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, onPress && styles.rowLink]}>
          {value}
        </Text>
        {!!note && <Text style={styles.rowNote}>{note}</Text>}
      </View>
    </>
  );

  const style = [styles.row, !last && styles.rowDivider];

  return onPress ? (
    <TouchableOpacity activeOpacity={0.75} style={style} onPress={onPress}>
      {body}
    </TouchableOpacity>
  ) : (
    <View style={style}>{body}</View>
  );
}

export default function WarehouseDetailsScreen({ navigation, route }) {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const { location } = useLocation();
  const item = warehouseById(route.params?.warehouseId);

  if (!item) {
    return (
      <SafeAreaView style={[styles.container, styles.missing]}>
        <Text style={styles.missingText}>{t('warehouseDetails.thisWarehouseIsNotListed')}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>{t('warehouseDetails.goBack')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const category = CATEGORY_META[item.category];
  const phones = item.phones || [];
  const capacity = formatCapacity(item.capacity);
  const distance =
    typeof location?.latitude === 'number' && typeof item.lat === 'number'
      ? formatDistance(
          distanceBetween(
            location.latitude,
            location.longitude,
            item.lat,
            item.lng,
          ),
        )
      : '';
  const area = [item.village, item.district, item.state]
    .filter((part, index, parts) => part && parts.indexOf(part) === index)
    .join(', ');
  const sourceUrl = sourceUrlOf(item);

  const facts = [
    distance && { value: distance, label: t('warehouseDetails.fromYou') },
    capacity && { value: capacity, label: t('warehouseDetails.capacity') },
  ].filter(Boolean);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <LinearGradient
          colors={WH_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Image
            source={WAREHOUSE_ART}
            style={styles.art}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.glass}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <ArrowLeft size={20} color={WH.white} />
          </TouchableOpacity>

          <View style={styles.heroText}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{category.label}</Text>
            </View>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.operator}>{item.operator}</Text>
          </View>

          {facts.length > 0 && (
            <View style={styles.facts}>
              {facts.map(fact => (
                <View key={fact.label} style={styles.fact}>
                  <Text style={styles.factValue} numberOfLines={1}>
                    {fact.value}
                  </Text>
                  <Text style={styles.factLabel}>{fact.label}</Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.section}>{t('warehouseDetails.location')}</Text>
          <View style={styles.card}>
            <InfoRow
              Icon={MapPin}
              label={t('warehouseDetails.address')}
              value={item.address || area}
              note={
                item.address
                  ? ''
                  : t('warehouseDetails.fullStreetAddressIsNot')
              }
              last={!item.address}
            />
            {!!item.address && (
              <InfoRow Icon={Landmark} label={t('warehouseDetails.area')} value={area} last />
            )}
          </View>

          <Text style={styles.section}>{t('warehouseDetails.storage')}</Text>
          <View style={styles.card}>
            <InfoRow
              Icon={Package}
              label={t('warehouseDetails.commodities')}
              value={item.commodity}
              note={
                item.commodityGeneral
                  ? t('warehouseDetails.generalListingConfirmYourCrop')
                  : ''
              }
              last={!capacity && !item.code}
            />
            {!!capacity && (
              <InfoRow
                Icon={Weight}
                label={t('warehouseDetails.listedCapacity')}
                value={capacity}
                note={t('warehouseDetails.totalSizeNotSpaceFree')}
                last={!item.code}
              />
            )}
            {!!item.code && (
              <InfoRow Icon={Hash} label={t('warehouseDetails.warehouseCode')} value={item.code} last />
            )}
          </View>

          <Text style={styles.section}>{t('warehouseDetails.contact')}</Text>
          <View style={styles.card}>
            {phones.map((phone, index) => (
              <InfoRow
                key={phone}
                Icon={Phone}
                label={phones.length > 1 ? `Phone ${index + 1}` : t('warehouseDetails.phone')}
                value={phone}
                onPress={() => openExternal(dialUrl(phone))}
                last={index === phones.length - 1 && !item.email}
              />
            ))}
            {!!item.email && (
              <InfoRow
                Icon={Mail}
                label={t('warehouseDetails.email')}
                value={item.email}
                onPress={() => openExternal(`mailto:${item.email}`)}
                last
              />
            )}
            {!phones.length && !item.email && (
              <Text style={styles.noContact}>
                {t('warehouseDetails.thisFacilitysPhoneAndEmail')}
              </Text>
            )}
          </View>

          <View style={styles.notice}>
            <ShieldAlert size={18} color={WH.amberDark} />
            <Text style={styles.noticeText}>
              {t('warehouseDetails.fromPublicRecordsCompiledOn', {v1: formatPreparedDate()})}
            </Text>
          </View>

          {!!sourceUrl && (
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.source}
              onPress={() => openExternal(sourceUrl)}
            >
              <ExternalLink size={14} color={WH.steel} />
              <Text style={styles.link}>{t('warehouseDetails.viewOfficialSource')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) + 4 },
        ]}
      >
        {phones.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.action, styles.actionSoft]}
            onPress={() => openExternal(dialUrl(phones[0]))}
          >
            <Phone size={18} color={WH.steelDark} />
            <Text style={styles.actionSoftText}>{t('warehouseDetails.call')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.action, styles.actionMain]}
          onPress={() => openExternal(directionsUrl(item))}
        >
          <Navigation size={18} color={WH.white} />
          <Text style={styles.actionMainText}>{t('warehouseDetails.getDirections')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WH.bg },
  flex: { flex: 1 },
  content: { paddingBottom: 24 },
  missing: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  missingText: { fontSize: 15, fontWeight: '700', color: WH.text },

  hero: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  art: {
    position: 'absolute',
    right: 0,
    top: 4,
    width: 128,
    height: 192,
  },
  glass: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { marginTop: 14, paddingRight: 112 },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  pillText: {
    color: WH.white,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 11,
    color: WH.white,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  operator: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.84)',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  facts: { marginTop: 18, flexDirection: 'row', gap: 8 },
  fact: {
    flex: 1,
    padding: 11,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  factValue: {
    color: WH.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  factLabel: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10.5,
    fontWeight: '700',
  },

  body: { paddingHorizontal: 16, paddingTop: 6 },
  section: {
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 2,
    fontSize: 15,
    fontWeight: '900',
    color: WH.ink,
    letterSpacing: -0.2,
  },
  card: {
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: WH.white,
    borderWidth: 1,
    borderColor: WH.line,
    ...WH_SHADOW,
  },
  row: {
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: WH.line },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: WH.steelSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: 11, fontWeight: '700', color: WH.muted },
  rowValue: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: WH.ink,
  },
  rowLink: { color: WH.steel },
  rowNote: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '600',
    color: WH.muted,
  },
  noContact: {
    paddingVertical: 14,
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '600',
    color: WH.muted,
  },
  notice: {
    marginTop: 16,
    padding: 13,
    borderRadius: 16,
    backgroundColor: WH.amberSoft,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    color: WH.amberDark,
  },
  source: {
    marginTop: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  link: { fontSize: 13, fontWeight: '800', color: WH.steel },

  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: WH.white,
    borderTopWidth: 1,
    borderTopColor: WH.line,
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionSoft: { flex: 1, backgroundColor: WH.steelSoft },
  actionSoftText: { fontSize: 15, fontWeight: '900', color: WH.steelDark },
  actionMain: { flex: 2, backgroundColor: WH.navy },
  actionMainText: { fontSize: 15, fontWeight: '900', color: WH.white },
});
