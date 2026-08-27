import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import {ChevronLeft, Bell} from 'lucide-react-native';

const {width} = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size, Math.min(size * scale, size + 3));
};

export default function LabourBookingHeader({navigation, onNotificationPress}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.goBack()}
        style={styles.iconWrap}>
        <ChevronLeft size={rf(26)} color="#16A34A" strokeWidth={2.6} />
      </TouchableOpacity>

      <Text style={styles.title}>Hire Labour</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onNotificationPress}
        style={styles.iconWrap}>
        <Bell size={rf(22)} color="#16A34A" strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: rf(19),
    fontWeight: '800',
    color: '#172033',
  },
});