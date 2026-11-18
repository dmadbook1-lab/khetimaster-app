import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Navigation,
  MapPin,
  Package,
  Phone,
  Warehouse,
} from 'lucide-react-native';

import { CATEGORY_META, WH, WH_SHADOW } from './theme';
import { openExternal } from './openExternal';
import {
  dialUrl,
  directionsUrl,
  formatCapacity,
  formatDistance,
  placeLine,
} from '../../utils/warehouseData';
import {useTranslation} from 'react-i18next';

function WarehouseCard({ item, onPress }) {
  const {t} = useTranslation();
  const category = CATEGORY_META[item.category];
  const distance = formatDistance(item.distanceKm);
  const capacity = formatCapacity(item.capacity);
  const phone = item.phones?.[0];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => onPress(item)}
    >
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: category.bg }]}>
          <Warehouse size={25} color={category.color} strokeWidth={2} />
        </View>

        <View style={styles.flex}>
          <Text
            style={[styles.category, { color: category.color }]}
            numberOfLines={1}
          >
            {category.label}
          </Text>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.operator} numberOfLines={1}>
            {item.operator}
          </Text>
        </View>

        {!!distance && (
          <View style={styles.distance}>
            <Text style={styles.distanceText} numberOfLines={1}>
              {distance}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.inline}>
          <MapPin size={13} color={WH.muted} />
          <Text style={styles.detail} numberOfLines={1}>
            {placeLine(item)}
          </Text>
        </View>
        <View style={styles.inline}>
          <Package size={13} color={WH.muted} />
          <Text style={styles.detail} numberOfLines={1}>
            {item.commodity}
          </Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.flex}>
          {capacity ? (
            <>
              <Text style={styles.capacity}>{capacity}</Text>
              <Text style={styles.capacityLabel}>{t('warehouseCard.listedCapacity')}</Text>
            </>
          ) : (
            <Text style={styles.noCapacity}>{t('warehouseCard.capacityNotPublished')}</Text>
          )}
        </View>

        {!!phone && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.round}
            onPress={() => openExternal(dialUrl(phone))}
            accessibilityRole="button"
            accessibilityLabel={t('warehouseCard.call', {name: item.name})}
          >
            <Phone size={17} color={WH.steel} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.directions}
          onPress={() => openExternal(directionsUrl(item))}
          accessibilityRole="button"
          accessibilityLabel={t('warehouseCard.directionsTo', {name: item.name})}
        >
          <Navigation size={15} color={WH.white} />
          <Text style={styles.directionsText}>{t('warehouseCard.directions')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default memo(WarehouseCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: WH.white,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: WH.line,
    ...WH_SHADOW,
  },
  flex: { flex: 1 },
  top: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  category: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  name: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '900',
    color: WH.ink,
    letterSpacing: -0.3,
  },
  operator: { marginTop: 2, fontSize: 12, fontWeight: '600', color: WH.text },
  distance: {
    maxWidth: 92,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: WH.amberSoft,
  },
  distanceText: { fontSize: 12, fontWeight: '900', color: WH.amberDark },
  details: { marginTop: 11, gap: 5 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detail: { flex: 1, fontSize: 12, fontWeight: '600', color: WH.muted },
  bottom: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: WH.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  capacity: { fontSize: 15, fontWeight: '900', color: WH.ink },
  capacityLabel: { fontSize: 10.5, fontWeight: '700', color: WH.muted },
  noCapacity: { fontSize: 11.5, fontWeight: '700', color: WH.placeholder },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WH.steelSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directions: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: WH.navy,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  directionsText: { fontSize: 12.5, fontWeight: '900', color: WH.white },
});
