import React from 'react';
import {StyleSheet, View} from 'react-native';

import {vehicleStyle} from './vehicles';

/*
 * Rounded square with the vehicle type's icon.
 */
export default function VehicleBadge({type, size = 44, style}) {
  const {icon: Icon, color, bg} = vehicleStyle(type);

  return (
    <View
      style={[
        styles.badge,
        {width: size, height: size, borderRadius: size * 0.32, backgroundColor: bg},
        style,
      ]}>
      <Icon size={size * 0.5} color={color} strokeWidth={2.2} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {alignItems: 'center', justifyContent: 'center'},
});
