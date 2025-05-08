import React, {memo, useRef, useEffect} from 'react';
import {Animated, View, StyleSheet} from 'react-native';

const AnimatedTypingDot: React.FC<{delay: number}> = memo(({delay}) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [delay]);
  return (
    <Animated.View
      style={[
        typingStyles.typingDot,
        {
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.3],
              }),
            },
          ],
        },
      ]}
    />
  );
});

const TypingIndicator: React.FC = () => {
  return (
    <View style={typingStyles.typingContainer}>
      <AnimatedTypingDot delay={0} />
      <AnimatedTypingDot delay={200} />
      <AnimatedTypingDot delay={400} />
    </View>
  );
};

const typingStyles = StyleSheet.create({
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
    marginHorizontal: 2,
  },
});

export default TypingIndicator;
