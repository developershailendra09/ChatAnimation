/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useRef, useEffect, memo} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  Animated,
  Easing,
  PanResponder,
  Dimensions,
  Modal,
  Pressable,
  ImageBackground,
  Image,
  Platform,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const CHAT_BG = require('./assets/c.jpg');
const CHAT_BG_1 = require('./assets/b.jpg');
const CHAT_BG_2 = require('./assets/bg.png');
const CHAT_BG_3 = require('./assets/b.jpg');
const BG_LIST = [CHAT_BG_1, CHAT_BG_2, CHAT_BG_3];

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  replyTo?: Message;
  reactions?: {[key: string]: number};
  attachment?: {type: 'image' | 'audio'; uri: string; duration?: number};
  status: 'sent' | 'delivered' | 'read';
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '👏'];

const audioRecorderPlayer = new AudioRecorderPlayer();

// Animated Reaction Bubble
const AnimatedReactionBubble = memo(({reaction, count}) => {
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
    <Animated.View
      style={{
        transform: [{scale: anim}],
        opacity: anim,
        marginLeft: 4,
        marginTop: 4,
      }}
    >
      <View style={styles.reactionBubble}>
        <Text style={styles.reactionEmoji}>{reaction}</Text>
        <Text style={styles.reactionCount}>{count}</Text>
      </View>
    </Animated.View>
  );
});

// Animated Typing Dot
const AnimatedTypingDot = memo(({delay}) => {
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
      ])
    ).start();
  }, [delay]);
  return (
    <Animated.View
      style={[
        styles.typingDot,
        {
          opacity: anim.interpolate({inputRange: [0, 1], outputRange: [0.3, 1]}),
          transform: [{scale: anim.interpolate({inputRange: [0, 1], outputRange: [1, 1.3]})}],
        },
      ]}
    />
  );
});

// Animated Expandable Image
const AnimatedImageBubble = memo(({uri, style}) => {
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
  const width = anim.interpolate({inputRange: [0, 1], outputRange: [120, expanded ? SCREEN_WIDTH - 20 : 180]});
  const height = anim.interpolate({inputRange: [0, 1], outputRange: [80, expanded ? SCREEN_WIDTH - 20 : 120]});
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => setExpanded(e => !e)}>
      <Animated.View style={[style, {width, height, opacity: anim, borderRadius: 12, overflow: 'hidden'}]}> 
        <Image source={{uri}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
      </Animated.View>
    </TouchableOpacity>
  );
});

// --- Confetti Animation Component ---
const Confetti = memo(() => {
  // Simple emoji confetti
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
        ])
      ).start();
    });
  }, []);

  return (
    <View pointerEvents="none" style={{position: 'absolute', top: 0, left: 0, right: 0, height: 120, zIndex: 100}}>
      {anims.map((anim, i) => {
        const left = (i / confettiCount) * 100 + Math.random() * 5;
        const rotate = anim.interpolate({inputRange: [0, 1], outputRange: ['0deg', `${Math.random() > 0.5 ? 180 : 360}deg`]});
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
              opacity: anim.interpolate({inputRange: [0, 0.1, 1], outputRange: [0, 1, 0]}),
              transform: [
                {translateY: anim.interpolate({inputRange: [0, 1], outputRange: [0, 100 + Math.random() * 40]})},
                {rotate},
              ],
            }}
          >
            {['🎉','🎊','✨','🥳','🎈','🎂'][i % 6]}
          </Animated.Text>
        );
      })}
    </View>
  );
});

// --- Birthday Banner Animation ---
const BirthdayBanner = memo(() => {
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
          {translateY: anim.interpolate({inputRange: [0, 1], outputRange: [-30, 0]})},
        ],
      }}
    >
      <View style={{backgroundColor: '#fffbe7', borderRadius: 18, paddingHorizontal: 24, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8}}>
        <Text style={{fontSize: 20, fontWeight: 'bold', color: '#e67e22', marginRight: 8}}>🎂</Text>
        <Text style={{fontSize: 16, fontWeight: 'bold', color: '#e67e22'}}>Happy Birthday!</Text>
      </View>
    </Animated.View>
  );
});

// Define tick icons for different statuses
const TICK_ICONS = {
  sent: '✔️',
  delivered: '✔️✔️',
  read: '✔️✔️', // Use blue color for read
};

function App(): React.JSX.Element {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    systemColorScheme === 'dark' ? 'dark' : 'light',
  );
  const isDarkMode = theme === 'dark';
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [forwardingTo, setForwardingTo] = useState<Message | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const messageAnimations = useRef<{[key: string]: Animated.Value}>({}).current;
  const swipeAnimations = useRef<{[key: string]: Animated.Value}>({}).current;
  const reactionPickerAnimation = useRef(new Animated.Value(0)).current;
  const reactionAnimations = useRef<{[key: string]: Animated.Value}>(
    {},
  ).current;
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [recordTime, setRecordTime] = useState('00:00');
  const [isPlaying, setIsPlaying] = useState<{[key: string]: boolean}>({});
  const [playTime, setPlayTime] = useState<{[key: string]: string}>({});
  const [playProgress, setPlayProgress] = useState<{[key: string]: number}>({});
  const [reactionBar, setReactionBar] = useState<{
    visible: boolean;
    message: Message | null;
    y: number;
    x: number;
  }>({ visible: false, message: null, y: 0, x: 0 });
  const reactionBarAnim = useRef(new Animated.Value(0)).current;
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalAnim] = useState(new Animated.Value(0));
  const [showBgModal, setShowBgModal] = useState(false);
  const [selectedBg, setSelectedBg] = useState(CHAT_BG);
  const [inputHeight, setInputHeight] = useState(40);
  // Birthday overlay state
  const [showBirthday, setShowBirthday] = useState(false);
  const [bgOpacity] = useState(new Animated.Value(1));

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const createPanResponder = (messageId: string) => {
    if (!swipeAnimations[messageId]) {
      swipeAnimations[messageId] = new Animated.Value(0);
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        swipeAnimations[messageId].setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const message = messages.find(m => m.id === messageId);
        if (!message) return;

        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Left swipe for reply
          setReplyingTo(message);
          Animated.spring(swipeAnimations[messageId], {
            toValue: -SCREEN_WIDTH,
            useNativeDriver: true,
          }).start(() => {
            swipeAnimations[messageId].setValue(0);
          });
        } else if (gestureState.dx > SWIPE_THRESHOLD) {
          // Right swipe for forward
          setForwardingTo(message);
          Animated.spring(swipeAnimations[messageId], {
            toValue: SCREEN_WIDTH,
            useNativeDriver: true,
          }).start(() => {
            swipeAnimations[messageId].setValue(0);
          });
        } else {
          // Return to original position
          Animated.spring(swipeAnimations[messageId], {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });
  };

  const startTypingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnimation, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(typingAnimation, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const animateMessage = (messageId: string) => {
    messageAnimations[messageId] = new Animated.Value(0);
    Animated.spring(messageAnimations[messageId], {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      replyTo: replyingTo || undefined,
      status: 'sent',
    };

    setMessages(prev => [...prev, userMessage]);
    animateMessage(userMessage.id);
    setInputText('');
    setReplyingTo(null);
    setForwardingTo(null);

    setIsTyping(true);
    startTypingAnimation();

    setTimeout(() => {
      setIsTyping(false);
      typingAnimation.setValue(0);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I received your message: "${inputText}"`,
        sender: 'bot',
        timestamp: new Date(),
        replyTo: replyingTo || undefined,
        status: 'delivered',
      };
      setMessages(prev => [...prev, botMessage]);
      animateMessage(botMessage.id);

      // Simulate status change to 'read'
      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === userMessage.id ? {...msg, status: 'read'} : msg
        ));
      }, 2000);
    }, 2000);
  };

  const handleReaction = (reaction: string) => {
    if (!reactionBar.message) return;
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === reactionBar.message!.id) {
          const reactions = { ...msg.reactions };
          if (reactions[reaction]) {
            reactions[reaction]++;
          } else {
            reactions[reaction] = 1;
          }
          return { ...msg, reactions };
        }
        return msg;
      })
    );
    hideReactionBar();
  };

  const showReactionPickerForMessage = (message: Message) => {
    setSelectedMessage(message);
    setShowReactionPicker(true);
    Animated.spring(reactionPickerAnimation, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const hideReactionPicker = () => {
    Animated.spring(reactionPickerAnimation, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      setShowReactionPicker(false);
      setSelectedMessage(null);
    });
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  const renderTypingIndicator = () => {
    return (
      <View style={styles.typingContainer}>
        <AnimatedTypingDot delay={0} />
        <AnimatedTypingDot delay={200} />
        <AnimatedTypingDot delay={400} />
      </View>
    );
  };

  const renderActionIndicator = () => {
    if (!replyingTo && !forwardingTo) return null;

    return (
      <View style={styles.actionIndicator}>
        <View style={styles.actionIndicatorContent}>
          <Text style={styles.actionLabel}>
            {replyingTo ? 'Replying to:' : 'Forwarding:'}
          </Text>
          <Text style={styles.actionText} numberOfLines={1}>
            {(replyingTo || forwardingTo)?.text}
          </Text>
          <TouchableOpacity
            style={styles.closeActionButton}
            onPress={() => {
              setReplyingTo(null);
              setForwardingTo(null);
            }}>
            <Text style={styles.closeActionText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderReactionPicker = () => {
    if (!showReactionPicker || !selectedMessage) return null;

    const scale = reactionPickerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const opacity = reactionPickerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Modal
        transparent
        visible={showReactionPicker}
        onRequestClose={hideReactionPicker}>
        <Pressable
          style={styles.reactionPickerOverlay}
          onPress={hideReactionPicker}>
          <Animated.View
            style={[
              styles.reactionPicker,
              {
                transform: [{scale}],
                opacity,
              },
            ]}>
            {REACTIONS.map(reaction => {
              const scale =
                reactionAnimations[reaction]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1],
                }) || 1;

              return (
                <TouchableOpacity onPress={() => handleReaction(reaction)}>
                  <Animated.View
                    key={reaction}
                    style={[
                      styles.reactionButton,
                      {
                        transform: [{scale}],
                      },
                    ]}>
                    <Text style={styles.reactionEmoji}>{reaction}</Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </Pressable>
      </Modal>
    );
  };

  const renderReactions = (message: Message) => {
    if (!message.reactions || Object.keys(message.reactions).length === 0)
      return null;
    return (
      <View style={styles.reactionsContainer}>
        {Object.entries(message.reactions).map(([reaction, count]) => (
          <AnimatedReactionBubble key={reaction} reaction={reaction} count={count} />
        ))}
      </View>
    );
  };

  const renderMessageBubble = (message: Message) => {
    const animation = messageAnimations[message.id];
    const scale =
      animation?.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1],
      }) || 1;

    const panResponder = createPanResponder(message.id);
    const swipeStyle = {
      transform: [{scale}, {translateX: swipeAnimations[message.id] || 0}],
      opacity: animation || 1,
    };

    // Determine tick color based on sender and status
    const tickColor = message.sender === 'user'
      ? (message.status === 'read' ? '#007AFF' : '#A9A9A9') // Blue for read, gray for others
      : '#32CD32'; // Green for receiver

    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageBubble,
          message.sender === 'user' ? styles.userBubble : styles.botBubble,
          swipeStyle,
        ]}
        {...panResponder.panHandlers}>
        {/* Audio message rendering */}
        {message.attachment && message.attachment.type === 'audio' && (
          <View style={styles.audioContainer}>
            <TouchableOpacity
              onPress={() =>
                isPlaying[message.id]
                  ? onPausePlay(message)
                  : onStartPlay(message)
              }
              style={styles.audioPlayButton}
            >
              <Text style={styles.audioPlayIcon}>
                {isPlaying[message.id] ? '⏸️' : '▶️'}
              </Text>
            </TouchableOpacity>
            <View style={styles.audioProgressBarBg}>
              <View
                style={[
                  styles.audioProgressBarFg,
                  {width: `${(playProgress[message.id] || 0) * 100}%`},
                ]}
              />
            </View>
            <Text style={styles.audioTime}>
              {playTime[message.id] || '00:00'}
            </Text>
          </View>
        )}
        {message.attachment && message.attachment.type === 'image' && (
          <AnimatedImageBubble uri={message.attachment.uri} style={styles.attachmentImageContainer} />
        )}
        {message.replyTo && (
          <View style={styles.replyPreview}>
            <Text style={styles.replyPreviewText} numberOfLines={1}>
              {message.replyTo.text}
            </Text>
          </View>
        )}
        <Pressable
          onLongPress={event => {
            // Get position for reaction bar
            event.target.measure((fx, fy, width, height, px, py) => {
              showReactionBar(message, py, px + width / 2);
            });
          }}
          delayLongPress={300}>
          <Text
            style={[
              styles.messageText,
              {color: message.sender === 'user' ? Colors.white : Colors.black},
            ]}>
            {message.text}
          </Text>
        </Pressable>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        {/* Status indicator with tick icons */}
        <Animated.Text
          style={{
            fontSize: 12,
            color: tickColor,
            opacity: animation || 1,
            alignSelf: 'flex-end',
            marginTop: 4,
          }}>
          {TICK_ICONS[message.status]}
        </Animated.Text>
        {renderReactions(message)}
      </Animated.View>
    );
  };

  const handleSwitchTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Voice note recording handlers
  const onStartRecord = async () => {
    setIsRecording(true);
    setRecordSecs(0);
    setRecordTime('00:00');
    const result = await audioRecorderPlayer.startRecorder();
    audioRecorderPlayer.addRecordBackListener((e) => {
      setRecordSecs(e.current_position);
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.current_position)));
      return;
    });
  };

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);
    setRecordSecs(0);
    setRecordTime('00:00');
    if (result) {
      // Add as a new message
      const newMessage: Message = {
        id: Date.now().toString(),
        text: 'Voice Note',
        sender: 'user',
        timestamp: new Date(),
        attachment: {type: 'audio', uri: result},
        status: 'sent',
      };
      setMessages(prev => [...prev, newMessage]);
      animateMessage(newMessage.id);
    }
  };

  // Voice note playback handlers
  const onStartPlay = async (msg: Message) => {
    if (!msg.attachment?.uri) return;
    setIsPlaying(prev => ({...prev, [msg.id]: true}));
    await audioRecorderPlayer.startPlayer(msg.attachment.uri);
    audioRecorderPlayer.addPlayBackListener((e) => {
      setPlayTime(prev => ({...prev, [msg.id]: audioRecorderPlayer.mmssss(Math.floor(e.current_position))}));
      setPlayProgress(prev => ({...prev, [msg.id]: e.current_position / e.duration}));
      if (e.current_position >= e.duration) {
        audioRecorderPlayer.stopPlayer();
        setIsPlaying(prev => ({...prev, [msg.id]: false}));
        setPlayTime(prev => ({...prev, [msg.id]: '00:00'}));
        setPlayProgress(prev => ({...prev, [msg.id]: 0}));
      }
      return;
    });
  };

  const onPausePlay = async (msg: Message) => {
    await audioRecorderPlayer.pausePlayer();
    setIsPlaying(prev => ({...prev, [msg.id]: false}));
  };

  const onStopPlay = async (msg: Message) => {
    await audioRecorderPlayer.stopPlayer();
    setIsPlaying(prev => ({...prev, [msg.id]: false}));
    setPlayTime(prev => ({...prev, [msg.id]: '00:00'}));
    setPlayProgress(prev => ({...prev, [msg.id]: 0}));
  };

  // WhatsApp-style reaction bar show/hide
  const showReactionBar = (message: Message, y: number, x: number) => {
    setReactionBar({ visible: true, message, y, x });
    Animated.spring(reactionBarAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };
  const hideReactionBar = () => {
    Animated.spring(reactionBarAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start(() => {
      setReactionBar({ visible: false, message: null, y: 0, x: 0 });
    });
  };

  // WhatsApp-style floating reaction bar
  const renderReactionBar = () => {
    if (!reactionBar.visible || !reactionBar.message) return null;
    return (
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={hideReactionBar}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.waReactionBar,
            {
              top: reactionBar.y - 70,
              left: reactionBar.x - 120,
              opacity: reactionBarAnim,
              transform: [
                {scale: reactionBarAnim},
              ],
            },
          ]}
        >
          <View style={styles.waReactionBarContent}>
            {REACTIONS.map(reaction => (
              <TouchableOpacity key={reaction} onPress={() => handleReaction(reaction)}>
                <Text style={styles.waReactionEmoji}>{reaction}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Triangle pointer */}
          <View style={styles.waReactionBarTriangle} />
        </Animated.View>
      </Pressable>
    );
  };

  // Helper to open info modal with animation
  const openInfoModal = () => {
    setShowInfoModal(true);
    infoModalAnim.setValue(0);
    Animated.timing(infoModalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Helper to close info modal with animation
  const closeInfoModal = () => {
    Animated.timing(infoModalAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setShowInfoModal(false));
  };

  // Helper to cycle background images with animation
  const cycleBackground = () => {
    Animated.timing(bgOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedBg(prev => {
        const idx = BG_LIST.indexOf(prev);
        if (idx === -1 || idx === BG_LIST.length - 1) return BG_LIST[0];
        return BG_LIST[idx + 1];
      });
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  // Show birthday overlay when a message contains 'happy birthday'
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg.text &&
      lastMsg.text.toLowerCase().includes('happy birthday')
    ) {
      setShowBirthday(true);
      const timer = setTimeout(() => setShowBirthday(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // For demo, always show birthday celebration
  const isBirthday = true;

  return (
    <SafeAreaView edges={['', '']} style={[styles.container, backgroundStyle]}>
      {/* Birthday wishes overlay for 2 seconds */}
      {showBirthday && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Confetti />
          <BirthdayBanner />
        </View>
      )}
      <Animated.View style={{flex: 1, opacity: bgOpacity}}>
        <ImageBackground
          source={selectedBg}
          style={styles.backgroundImage}
          resizeMode="cover">
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <View style={styles.header}>
            {/* User Profile Avatar */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={{uri: 'https://randomuser.me/api/portraits/men/32.jpg'}}
                style={{width: 40, height: 40, borderRadius: 20, marginRight: 12, borderWidth: 2, borderColor: '#fff'}}
              />
            </View>
            <Text
              style={[
                styles.headerText,
                {color: isDarkMode ? Colors.white : Colors.black},
              ]}>
              Private Chat
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={openInfoModal}
                style={{marginLeft: 8, padding: 4}}>
                <Text style={{fontSize: 22, color: isDarkMode ? Colors.white : Colors.black}}>ℹ️</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}>
            {messages.map(renderMessageBubble)}
            {isTyping && (
              <View style={styles.typingBubble}>{renderTypingIndicator()}</View>
            )}
          </ScrollView>
          {renderActionIndicator()}
          {renderReactionBar()}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDarkMode ? '#222831' : '#f5f6fa',
                borderRadius: 30,
                margin: 16,
                padding: 8,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 8,
                shadowOffset: {width: 0, height: 2},
              },
            ]}>
            {/* Mic button for voice note */}
            {!isRecording ? (
              <TouchableOpacity
                style={styles.attachmentButton}
                onPress={onStartRecord}
              >
                <Text style={{fontSize: 22, color: isDarkMode ? Colors.white : Colors.dark}}>🎤</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.recordingIndicator}>
                <Text style={styles.recordingDot}>●</Text>
                <Text style={styles.recordingTime}>{recordTime}</Text>
                <TouchableOpacity onPress={onStopRecord} style={styles.stopRecordingButton}>
                  <Text style={styles.stopRecordingText}>■</Text>
                </TouchableOpacity>
              </View>
            )}
            <TextInput
              style={[
                styles.input,
                {
              
                  color: isDarkMode ? Colors.white : Colors.black,
                  marginRight: 0,
                  marginLeft: 0,
                  paddingHorizontal: 0,
                  height: Math.min(inputHeight, 40 * 6),
                },
              ]}
              value={inputText}
              onChangeText={setInputText}
              multiline
              numberOfLines={1}
              maxLength={1000}
              onContentSizeChange={e => {
                const newHeight = e.nativeEvent.contentSize.height;
                setInputHeight(Math.max(40, Math.min(newHeight, 40 * 6)));
              }}
              placeholder="Type a message..."
              placeholderTextColor={isDarkMode ? Colors.light : Colors.dark}
            />
            {/* Plus icon for attachments */}
            <TouchableOpacity
              style={styles.plusButton}
              onPress={() => setShowAttachmentModal(true)}
            >
              <Text style={{fontSize: 28, color: isDarkMode ? Colors.white : Colors.dark, fontWeight: 'bold'}}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: isDarkMode ? Colors.white : Colors.black,
                  marginLeft: 8,
                },
              ]}
              onPress={handleSendMessage}>
              <Text
                style={[
                  styles.sendButtonText,
                  {color: isDarkMode ? Colors.black : Colors.white},
                ]}>
                >
              </Text>
            </TouchableOpacity>
          </View>
          {/* Attachment Modal */}
          <Modal
            visible={showAttachmentModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowAttachmentModal(false)}>
            <Pressable
              style={styles.attachmentModalOverlay}
              onPress={() => setShowAttachmentModal(false)}>
              <Pressable style={styles.attachmentModalSheet}>
                <Text style={styles.attachmentModalTitle}>Attach</Text>
                <View style={styles.attachmentOptionsRow}>
                  <TouchableOpacity
                    style={styles.attachmentOption}
                    onPress={() => {
                      setShowAttachmentModal(false);
                      // Simulate picking an image from gallery
                      const imageUri = require('./assets/a.jpg'); // Use your own image or a remote URL
                      const newMessage: Message = {
                        id: Date.now().toString(),
                        text: 'Image Attachment',
                        sender: 'user',
                        timestamp: new Date(),
                        attachment: {
                          type: 'image',
                          uri: Image.resolveAssetSource(imageUri).uri,
                        },
                        status: 'sent',
                      };
                      setMessages(prev => [...prev, newMessage]);
                      animateMessage(newMessage.id);
                    }}>
                    <Text style={styles.attachmentOptionIcon}>🖼️</Text>
                    <Text style={styles.attachmentOptionLabel}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.attachmentOption}
                    onPress={() => {
                      setShowAttachmentModal(false); /* TODO: handle camera */
                    }}>
                    <Text style={styles.attachmentOptionIcon}>📷</Text>
                    <Text style={styles.attachmentOptionLabel}>Camera</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
          {/* Info Modal */}
          <Modal
            visible={showInfoModal}
            transparent
            animationType="none"
            onRequestClose={closeInfoModal}>
            <Pressable
              style={styles.attachmentModalOverlay}
              onPress={closeInfoModal}>
              <Animated.View
                style={[
                  styles.attachmentModalSheet,
                  {
                    transform: [
                      {
                        translateY: infoModalAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [400, 0],
                        }),
                      },
                    ],
                    opacity: infoModalAnim,
                  },
                ]}>
                <Text style={styles.attachmentModalTitle}>Options</Text>
                <View style={styles.infoOptionsRow}>
                  <TouchableOpacity style={styles.infoOption} onPress={() => { closeInfoModal(); setTimeout(() => cycleBackground(), 250); }}>
                    <Text style={styles.infoOptionIcon}>🖼️</Text>
                    <Text style={styles.infoOptionLabel}>Change Background</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.infoOption} onPress={() => { closeInfoModal(); setTimeout(() => handleSwitchTheme(), 250); }}>
                    <Text style={styles.infoOptionIcon}>🎨</Text>
                    <Text style={styles.infoOptionLabel}>Theme</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </Pressable>
          </Modal>
          {/* Background Image Picker Modal */}
          <Modal
            visible={showBgModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowBgModal(false)}>
            <Pressable style={styles.attachmentModalOverlay} onPress={() => setShowBgModal(false)}>
              <View style={[styles.attachmentModalSheet, {alignItems: 'flex-start'}]}>
                <Text style={styles.attachmentModalTitle}>Choose Background</Text>
                <View style={styles.bgPickerRow}>
                  {[CHAT_BG_1, CHAT_BG_2, CHAT_BG_3].map((bg, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.bgThumbWrap, selectedBg === bg && styles.bgThumbSelected]}
                      onPress={() => { setSelectedBg(bg); setShowBgModal(false); }}
                    >
                      <Image source={bg} style={styles.bgThumb} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Pressable>
          </Modal>
        </ImageBackground>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    resizeMode: 'cover',
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 70,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  switchThemeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  switchThemeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  userBubble: {
    backgroundColor: 'rgba(34,40,49,0.7)',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.white,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    bottom: 15,
    flexDirection: 'row',
    padding: 16,

  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    // textAlignVertical: 'top',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    fontWeight: 'bold',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark,
    marginHorizontal: 2,
  },
  typingBubble: {
    backgroundColor: Colors.light,
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  actionIndicator: {
    backgroundColor: Colors.light,
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light,
  },
  actionIndicatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  actionLabel: {
    fontSize: 14,
    color: Colors.dark,
    marginRight: 8,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark,
  },
  closeActionButton: {
    padding: 4,
  },
  closeActionText: {
    fontSize: 20,
    color: Colors.dark,
  },
  replyPreview: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    paddingLeft: 8,
    marginBottom: 8,
  },
  replyPreviewText: {
    fontSize: 14,
    color: Colors.dark,
    opacity: 0.7,
  },
  reactionPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionPicker: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 12,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  reactionButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  reactionCount: {
    fontSize: 12,
    color: Colors.dark,
    textAlign: 'center',
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginLeft: -4,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
    marginTop: 4,
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal styles
  attachmentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  attachmentModalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  attachmentModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  attachmentOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  attachmentOption: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  attachmentOptionIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  attachmentOptionLabel: {
    fontSize: 14,
    color: '#333',
  },
  attachmentImageContainer: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: 180,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
    padding: 8,
  },
  audioPlayButton: {
    marginRight: 8,
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  audioPlayIcon: {
    fontSize: 22,
  },
  audioProgressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  audioProgressBarFg: {
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  audioTime: {
    fontSize: 12,
    color: '#333',
    marginLeft: 8,
    minWidth: 40,
    textAlign: 'right',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.08)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  recordingDot: {
    color: 'red',
    fontSize: 18,
    marginRight: 6,
  },
  recordingTime: {
    fontSize: 14,
    color: '#333',
    marginRight: 12,
    minWidth: 48,
    textAlign: 'center',
  },
  stopRecordingButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginLeft: 4,
    elevation: 2,
  },
  stopRecordingText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  waReactionBar: {
    position: 'absolute',
    width: 320,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 5,
    zIndex: 100,
  },
  waReactionBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  waReactionEmoji: {
    fontSize: 28,
    marginHorizontal: 10,
  },
  waReactionBarTriangle: {
    position: 'absolute',
    left: '50%',
    bottom: -10,
    marginLeft: -10,
    width: 20,
    height: 10,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 10,
    borderTopColor: '#fff',
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
  },
  infoOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  infoOption: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  infoOptionIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  infoOptionLabel: {
    fontSize: 14,
    color: '#333',
  },
  bgPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  bgThumbWrap: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  bgThumbSelected: {
    borderColor: '#007AFF',
  },
  bgThumb: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
  },
  plusButton: {
    padding: 8,
    marginLeft: 4,
    marginRight: 4,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
