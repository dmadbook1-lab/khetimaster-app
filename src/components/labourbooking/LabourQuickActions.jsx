import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import {
  ClipboardList,
  Megaphone,
} from 'lucide-react-native';

const {width} =
  Dimensions.get('window');

const rf = size => {
  const scale =
    width / 390;

  return Math.max(
    size,
    Math.min(
      size * scale,
      size + 3,
    ),
  );
};

const ACTIONS = [
  {
    id: 'bookings',
    label: 'My Bookings',
    Icon: ClipboardList,
  },
  {
    id: 'requests',
    label: 'Requests',
    Icon: Megaphone,
    badge: 3,
  },
];

export default function LabourQuickActions({
  onActionPress,
}) {
  return (
    <View
      style={
        styles.container
      }>

      {ACTIONS.map(
        action => {
          const Icon =
            action.Icon;

          return (
            <TouchableOpacity
              key={
                action.id
              }
              activeOpacity={
                0.85
              }
              onPress={() =>
                onActionPress?.(
                  action.id,
                )
              }
              style={
                styles.item
              }>

              <View
                style={
                  styles.iconBox
                }>

                <Icon
                  size={rf(
                    25,
                  )}
                  color="#16A34A"
                  strokeWidth={
                    2.3
                  }
                />

                {action.badge ? (
                  <View
                    style={
                      styles.badge
                    }>

                    <Text
                      style={
                        styles.badgeText
                      }>
                      {action.badge >
                      9
                        ? '9+'
                        : action.badge}
                    </Text>

                  </View>
                ) : null}

              </View>

              <Text
                style={
                  styles.label
                }>
                {
                  action.label
                }
              </Text>

            </TouchableOpacity>
          );
        },
      )}

    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      marginTop: 22,
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      justifyContent:
        'flex-start',
      paddingHorizontal: 4,
      gap: 18,
    },

    item: {
      width: 82,
      alignItems:
        'center',
    },

    iconBox: {
      width: 60,
      height: 60,
      borderRadius: 15,
      backgroundColor:
        '#FFFFFF',
      borderWidth: 1,
      borderColor:
        '#E7EBED',
      alignItems:
        'center',
      justifyContent:
        'center',
      position:
        'relative',
    },

    badge: {
      position:
        'absolute',
      top: -5,
      right: -5,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      paddingHorizontal: 5,
      backgroundColor:
        '#EF4444',
      alignItems:
        'center',
      justifyContent:
        'center',
      borderWidth: 2,
      borderColor:
        '#FFFFFF',
    },

    badgeText: {
      fontSize: rf(10),
      fontWeight: '900',
      color: '#FFFFFF',
    },

    label: {
      marginTop: 10,
      fontSize: rf(11),
      fontWeight: '700',
      color: '#374151',
      textAlign:
        'center',
    },
  });