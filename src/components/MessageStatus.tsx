import React, {useEffect, useRef} from 'react';
import {Animated, View, StyleSheet} from 'react-native';
import {SingleTickIcon, DoubleTickIcon} from '../assets/icons';

export type MessageStatusType = 'sent' | 'delivered' | 'read';

interface MessageStatusProps {
  status: MessageStatusType;
  size?: number;
}

const MessageStatus: React.FC<MessageStatusProps> = ({status, size = 20}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Reset animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.5);

    // Start new animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [status]);

  const renderIcon = () => {
    const color = status === 'read' ? '#34B7F1' : 'rgba(255,255,255,0.7)';

    switch (status) {
      case 'sent':
        return <SingleTickIcon width={size} height={size} color={color} />;
      case 'delivered':
      case 'read':
        return <DoubleTickIcon width={size} height={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [
              {scale: scaleAnim},
              {
                rotate: scaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['-45deg', '0deg'],
                }),
              },
            ],
          },
        ]}>
        {renderIcon()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MessageStatus;
