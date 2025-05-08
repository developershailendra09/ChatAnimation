import React, {useRef, useEffect, memo} from 'react';
import {Animated, View, Text, StyleSheet} from 'react-native';

interface AnimatedReactionBubbleProps {
  reaction: string;
  count: number;
  isSelected?: boolean;
}

const AnimatedReactionBubble: React.FC<AnimatedReactionBubbleProps> = memo(
  ({reaction, count, isSelected = false}) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 60,
      }).start();
    }, [reaction, count]);

    return (
      <View>
        <Animated.View
          style={[
            styles.reactionBubble,
            isSelected && styles.selectedBubble,
            {
              transform: [{scale: anim}],
              opacity: anim,
            },
          ]}>
          <Text style={styles.reactionEmoji}>{reaction}</Text>
        </Animated.View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  reactionBubble: {
    borderRadius: 50,
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBubble: {
    backgroundColor: '#e3f2fd',
  },
  reactionEmoji: {
    fontSize: 11,
  },
});

export default AnimatedReactionBubble;
