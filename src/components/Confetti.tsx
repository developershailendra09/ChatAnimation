import React, {useRef, useEffect} from 'react';
import {Animated, View, Text} from 'react-native';

const Confetti: React.FC = () => {
  const confettiCount = 12;
  const confettiArray = Array.from({length: confettiCount});
  const anims = useRef(confettiArray.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    anims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2200 + Math.random() * 1000,
            delay: i * 120,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, []);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        zIndex: 100,
      }}>
      {anims.map((anim, i) => {
        const left = (i / confettiCount) * 100 + Math.random() * 5;
        const rotate = anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${Math.random() > 0.5 ? 180 : 360}deg`],
        });
        return (
          <Animated.Text
            key={i}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: 20,
              fontSize: 28,
              height: '100%',
              alignSelf: 'center',
              opacity: anim.interpolate({
                inputRange: [0, 0.1, 1],
                outputRange: [0, 1, 0],
              }),
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 100 + Math.random() * 40],
                  }),
                },
                {rotate},
              ],
            }}>
            {['🎉', '🎊', '✨', '🥳', '🎈', '🎂'][i % 6]}
          </Animated.Text>
        );
      })}
    </View>
  );
};

export default Confetti;
