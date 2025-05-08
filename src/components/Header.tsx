import React, {useEffect, useRef} from 'react';
import {Animated, View, Text, TouchableOpacity} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const AnimatedUserInfo: React.FC<{isDarkMode: boolean}> = ({isDarkMode}) => {
  const [displayedName, setDisplayedName] = React.useState('');
  const [displayedBio, setDisplayedBio] = React.useState('');
  const fullName = 'John Doe';
  const fullBio = 'Frontend Developer at XYZ';
  const nameIndex = useRef(0);
  const bioIndex = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (nameIndex.current < fullName.length) {
        setDisplayedName(prev => prev + fullName.charAt(nameIndex.current));
        nameIndex.current++;
      } else if (bioIndex.current < fullBio.length) {
        setDisplayedBio(prev => prev + fullBio.charAt(bioIndex.current));
        bioIndex.current++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View style={{flexDirection: 'column', alignItems: 'center'}}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: isDarkMode ? Colors.white : Colors.black,
        }}>
        {displayedName}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: isDarkMode ? Colors.light : Colors.dark,
        }}>
        {displayedBio}
      </Text>
    </View>
  );
};

const AnimatedHeader: React.FC<{
  isDarkMode: boolean;
  openInfoModal: () => void;
}> = ({isDarkMode, openInfoModal}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        paddingTop: 70,
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: Colors.light,
      }}>
      <View style={{flexDirection: 'row'}}>
        <Animated.Image
          source={{uri: 'https://randomuser.me/api/portraits/men/32.jpg'}}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 12,
            borderWidth: 2,
            borderColor: '#fff',
            transform: [{scale: anim}],
          }}
        />
      </View>
      <AnimatedUserInfo isDarkMode={isDarkMode} />
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity
          onPress={openInfoModal}
          style={{marginLeft: 8, padding: 4}}>
          <Animated.Text
            style={{
              fontSize: 22,
              color: isDarkMode ? Colors.white : Colors.black,
              transform: [{scale: anim}],
            }}>
            {/* Placeholder for options icon */}
          </Animated.Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default AnimatedHeader;
