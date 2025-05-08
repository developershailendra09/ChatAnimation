import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import {Message} from '../types/Message';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '👏'];
const REACTION_BAR_WIDTH = 320;
const POINTER_SIZE = 10;

interface ReactionBarProps {
  visible: boolean;
  message: Message | null;
  position: {
    x: number;
    y: number;
  };
  onReactionSelect: (reaction: string) => void;
  onClose: () => void;
}

const ReactionBar: React.FC<ReactionBarProps> = ({
  visible,
  message,
  position,
  onReactionSelect,
  onClose,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(anim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible || !message) return null;

  // Calculate position to ensure bar stays within screen bounds
  let barX = Math.max(
    20,
    Math.min(
      position.x - REACTION_BAR_WIDTH / 2,
      screenWidth - REACTION_BAR_WIDTH - 20,
    ),
  );

  // Calculate pointer position relative to the bar
  const pointerLeftPosition = Math.max(
    POINTER_SIZE,
    Math.min(
      position.x - barX - POINTER_SIZE,
      REACTION_BAR_WIDTH - POINTER_SIZE * 2,
    ),
  );

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
      <Animated.View
        style={[
          styles.container,
          {
            top: position.y,
            left: message?.sender === 'bot' ? 10 : 'auto',
            right: message?.sender === 'bot' ? 'auto' : 10,
            opacity: anim,
            transform: [
              {scale: anim},
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}>
        <View style={styles.bar}>
          {REACTIONS.map(reaction => (
            <TouchableOpacity
              key={reaction}
              style={styles.reactionButton}
              onPress={() => onReactionSelect(reaction)}
              activeOpacity={0.7}>
              <Animated.Text
                style={[
                  styles.reactionEmoji,
                  {
                    transform: [
                      {
                        scale: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1],
                        }),
                      },
                    ],
                  },
                ]}>
                {reaction}
              </Animated.Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // width: REACTION_BAR_WIDTH,
    alignItems: 'center',
    zIndex: 1000,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2C',
    borderRadius: 24,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  reactionButton: {
    width: 40,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionEmoji: {
    fontSize: 22,
  },
  pointer: {
    position: 'absolute',
    bottom: 0,
    top: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: POINTER_SIZE,
    borderRightWidth: POINTER_SIZE,
    borderTopWidth: POINTER_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#2C2C2C',
    transform: [{translateX: -POINTER_SIZE}],
  },
});

export default ReactionBar;
