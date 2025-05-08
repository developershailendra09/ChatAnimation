import React, {useState, useRef, useEffect, memo} from 'react';
import {
  Animated,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const AnimatedImageBubble: React.FC<{uri: string; style: object}> = memo(
  ({uri, style}) => {
    const [expanded, setExpanded] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 60,
      }).start();
    }, [uri]);
    const width = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [120, expanded ? SCREEN_WIDTH - 180 : 180],
    });
    const height = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [80, expanded ? SCREEN_WIDTH - 20 : 120],
    });
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setExpanded(e => !e)}>
        <Animated.View
          style={[
            style,
            {
              width,
              height,
              opacity: anim,
              borderRadius: 12,
              overflow: 'hidden',
            },
          ]}>
          <Image
            source={{uri}}
            style={styles.image}
            resizeMode={expanded ? 'contain' : 'cover'}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});

export default AnimatedImageBubble;
