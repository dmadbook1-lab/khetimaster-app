import React from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {Dropdown} from 'react-native-element-dropdown';

import {
  CalendarDays,
  ChevronDown,
  Cloud,
  Layers3,
  RefreshCw,
  Satellite,
  Sparkles,
} from 'lucide-react-native';

const GREEN = '#16883E';
const LIGHT_GREEN = '#EAF7EF';
const TEXT = '#142018';
const TEXT_2 = '#334039';
const MUTED = '#728078';
const BORDER = '#E7ECE9';

export default function SatelliteControls({
  selectedSatellite,
  selectedIndex,
  selectedDate,
  indexOptions,
  dates,
  datesLoading,
  datesError,
  cloudCover,
  onSatelliteChange,
  onIndexChange,
  onDateChange,
  onRefresh,
}) {
  const satelliteOptions = [
    {
      label: 'Sentinel-2',
      value: 's2',
    },
    {
      label: 'Sentinel-1',
      value: 's1',
    },
  ];

  return (
    <View style={styles.controlsCard}>
      <View style={styles.controlsHeader}>
        <View style={styles.controlsTitleRow}>
          <View style={styles.controlsIcon}>
            <Layers3
              size={18}
              color={GREEN}
              strokeWidth={2}
            />
          </View>

          <View>
            <Text style={styles.controlsTitle}>
              Image Analysis
            </Text>

            <Text style={styles.controlsSubtitle}>
              Choose imagery and index
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onRefresh}
          style={styles.controlRefresh}
          activeOpacity={0.8}>
          {datesLoading ? (
            <ActivityIndicator
              size="small"
              color={GREEN}
            />
          ) : (
            <RefreshCw
              size={17}
              color={GREEN}
              strokeWidth={2.2}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.controlDivider} />

      <View style={styles.controlBlock}>
        <Text style={styles.controlLabel}>
          Satellite source
        </Text>

        <Dropdown
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={satelliteOptions}
          labelField="label"
          valueField="value"
          value={selectedSatellite}
          onChange={item =>
            onSatelliteChange(item.value)
          }
          renderLeftIcon={() => (
            <Satellite
              size={16}
              color={GREEN}
              strokeWidth={2}
            />
          )}
          renderRightIcon={() => (
            <ChevronDown
              size={17}
              color={MUTED}
            />
          )}
        />
      </View>

      <View style={styles.controlBlock}>
        <Text style={styles.controlLabel}>
          Analysis index
        </Text>

        <Dropdown
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={indexOptions}
          labelField="label"
          valueField="value"
          value={selectedIndex}
          onChange={item =>
            onIndexChange(item.value)
          }
          renderLeftIcon={() => (
            <Sparkles
              size={16}
              color={GREEN}
              strokeWidth={2}
            />
          )}
          renderRightIcon={() => (
            <ChevronDown
              size={17}
              color={MUTED}
            />
          )}
        />
      </View>

      <View style={styles.controlBlock}>
        <View style={styles.dateLabelRow}>
          <Text style={styles.controlLabel}>
            Observation date
          </Text>

          {cloudCover !== null &&
            selectedSatellite === 's2' && (
              <View style={styles.cloudBadge}>
                <Cloud
                  size={12}
                  color={GREEN}
                />

                <Text style={styles.cloudBadgeText}>
                  {cloudCover.toFixed(0)}% cloud
                </Text>
              </View>
            )}
        </View>

        <Dropdown
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={dates.map(item => ({
            label: item.formattedDate,
            value: item.date,
            cloud_cover: item.cloud_cover,
          }))}
          labelField="label"
          valueField="value"
          value={selectedDate}
          placeholder={
            datesLoading
              ? 'Finding satellite dates...'
              : 'Select observation date'
          }
          onChange={item =>
            onDateChange(item.value)
          }
          renderLeftIcon={() => (
            <CalendarDays
              size={16}
              color={GREEN}
              strokeWidth={2}
            />
          )}
          renderItem={item => (
            <View style={styles.dateDropdownItem}>
              <View style={styles.dateItemIcon}>
                <CalendarDays
                  size={15}
                  color={GREEN}
                />
              </View>

              <View style={styles.dateItemContent}>
                <Text style={styles.dateDropdownText}>
                  {item.label}
                </Text>

                {selectedSatellite === 's2' &&
                  item.cloud_cover !== null &&
                  item.cloud_cover !== undefined && (
                    <Text
                      style={
                        styles.cloudDropdownText
                      }>
                      Cloud cover:{' '}
                      {Number(
                        item.cloud_cover,
                      ).toFixed(0)}
                      %
                    </Text>
                  )}
              </View>
            </View>
          )}
          renderRightIcon={() => (
            <ChevronDown
              size={17}
              color={MUTED}
            />
          )}
        />
      </View>

      {datesError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {datesError}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  controlsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: BORDER,
  },

  controlsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  controlsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  controlsIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  controlsTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '900',
  },

  controlsSubtitle: {
    color: MUTED,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },

  controlRefresh: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  controlDivider: {
    height: 1,
    backgroundColor: '#EFF2F0',
    marginVertical: 14,
  },

  controlBlock: {
    marginBottom: 13,
  },

  controlLabel: {
    color: TEXT_2,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 7,
  },

  dropdown: {
    height: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    paddingHorizontal: 12,
    backgroundColor: '#FBFCFB',
  },

  dropdownContainer: {
    borderRadius: 13,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },

  placeholderStyle: {
    fontSize: 11,
    color: '#9AA39D',
    fontWeight: '600',
  },

  selectedTextStyle: {
    fontSize: 12,
    color: TEXT,
    fontWeight: '800',
  },

  dateLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    marginBottom: 7,
  },

  cloudBadgeText: {
    color: GREEN,
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 4,
  },

  dateDropdownItem: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  dateItemContent: {
    flex: 1,
  },

  dateDropdownText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '800',
  },

  cloudDropdownText: {
    color: MUTED,
    fontSize: 9,
    marginTop: 3,
    fontWeight: '600',
  },

  errorBox: {
    marginTop: 2,
    padding: 11,
    borderRadius: 11,
    backgroundColor: '#FFF4F4',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  errorText: {
    color: '#B42318',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 15,
  },
});