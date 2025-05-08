import React, {useRef, useEffect} from 'react';
import {Animated, View, Text, StyleSheet} from 'react-native';

const BirthdayBanner: React.FC = () => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 101,
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [-30, 0],
            }),
          },
        ],
      }}>
      <View style={styles.bannerContainer}>
        <Text style={styles.cakeIcon}>🎂</Text>
        <Text style={styles.bannerText}>Happy Birthday!</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#fffbe7',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cakeIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e67e22',
    marginRight: 8,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e67e22',
  },
});

export default BirthdayBanner;
