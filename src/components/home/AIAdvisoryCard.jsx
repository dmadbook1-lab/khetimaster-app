import React from 'react';
import {
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');

export default function AIAdvisoryCard() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('AIGuru')}
      style={styles.cardContainer}>
      <Image
        source={require('../../assets/homescreen/aibanner.png')}
        style={styles.bannerImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: 30,
    height: width < 360 ? 140 : 155,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#16A34A',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 6,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
});