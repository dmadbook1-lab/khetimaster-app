import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import {Users} from 'lucide-react-native';

const {width} = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size, Math.min(size * scale, size + 3));
};

export default function UrgentBookingCTA({onPress}) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Users size={rf(26)} color="#16A34A" strokeWidth={2.4} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Need many workers urgently?</Text>
        <Text style={styles.subtitle}>We can help you.</Text>
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.btn}>
        <Text style={styles.btnText}>Urgent Booking</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#172033',
  },
  subtitle: {
    marginTop: 4,
    fontSize: rf(11),
    color: '#5B6575',
    fontWeight: '500',
  },
  btn: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});