import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {Globe2, BadgeCheck, Clock} from 'lucide-react-native';

const actions = [
  {
    title: 'Satellite View',
    type: 'icon',
    Icon: Globe2,
    onKey: 'satellite',
  },
  {
    title: 'Crop Health',
    type: 'icon',
    Icon: BadgeCheck,
  },
  {
    title: 'Weather',
    image: require('../../assets/homescreen/weather.png'),
  },
  {
    title: 'Scan Crop',
    image: require('../../assets/homescreen/cropscan.png'),
  },
  {
    title: 'AI Chat',
    image: require('../../assets/homescreen/bot.png'),
  },
  {
    title: 'Farm History',
    type: 'icon',
    Icon: Clock,
  },
];

export default function FarmQuickActions({onSatellite}) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Quick Actions</Text>

      <View style={styles.grid}>
        {actions.map((item, index) => {
          const Icon = item.Icon;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.85}
              onPress={item.onKey === 'satellite' ? onSatellite : undefined}
              style={styles.action}>
              <View style={styles.iconCircle}>
                {item.image ? (
                  <Image source={item.image} style={styles.image} resizeMode="contain" />
                ) : (
                  <Icon size={25} color="#16A34A" strokeWidth={2.4} />
                )}
              </View>

              <Text style={styles.actionText}>{item.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 26,
  },

  title: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
  },

  grid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 22,
  },

  action: {
    width: '30%',
    alignItems: 'center',
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 2,
  },

  image: {
    width: 45,
    height: 45,
  },

  actionText: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '800',
    color: '#344054',
    textAlign: 'center',
  },
});