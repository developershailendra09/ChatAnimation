import React, {useState, useRef, useEffect} from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Animated,
  PanResponder,
  Dimensions,
  Pressable,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Easing,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Images} from '../../assets';
import EmojiSelector from 'react-native-emoji-selector';
import {Message} from '../../types/Message';
import {
  Confetti,
  BirthdayBanner,
  AnimatedReactionBubble,
  TypingIndicator,
  FancyInput,
  MessageStatus,
  ReactionBar,
  AnimatedImageBubble,
} from '../../components';
import {styles} from './styles';
import LinearGradient from 'react-native-linear-gradient';
import ActionIndicator from '../../components/ActionIndicator';

const CHAT_BG = Images.theme1;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

function ChatScreen(): React.JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const messageAnimations = useRef<{[key: string]: Animated.Value}>({}).current;
  const swipeAnimations = useRef<{[key: string]: Animated.Value}>({}).current;
  const [reactionBar, setReactionBar] = useState<{
    visible: boolean;
    message: Message | null;
    y: number;
    x: number;
  }>({visible: false, message: null, y: 0, x: 0});
  const reactionBarAnim = useRef(new Animated.Value(0)).current;
  const [showBirthday, setShowBirthday] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  // New recording animation states
  const recordingPulse = useRef(new Animated.Value(1)).current;
  const recordingDuration = useRef(new Animated.Value(0)).current;
  const [recordingTime, setRecordingTime] = useState('00:00');
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);
  const micShakeAnimation = useRef(new Animated.Value(0)).current;
  const autoStopTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState<{[key: string]: boolean}>({});
  const [playTime, setPlayTime] = useState<{[key: string]: string}>({});
  const playbackAnimation = useRef<{[key: string]: Animated.Value}>({}).current;

  // New state for special effects
  const [specialEffects, setSpecialEffects] = useState<{[key: string]: string}>(
    {},
  );
  const reactionRainRef = useRef<{[key: string]: NodeJS.Timeout}>({}).current;
  const messageShakeRef = useRef<{[key: string]: Animated.Value}>({}).current;

  // Special keywords that trigger effects
  const SPECIAL_KEYWORDS: {[key: string]: string} = {
    wow: 'rainbow',
    congratulations: 'sparkle',
    amazing: 'bounce',
    awesome: 'shake',
    love: 'heart',
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
          setReplyingTo(message);
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

  const animateMessage = (messageId: string) => {
    // Create new animated values for the message
    messageAnimations[messageId] = new Animated.Value(0);
    swipeAnimations[messageId] = new Animated.Value(20);

    // Entrance animation
    Animated.parallel([
      Animated.spring(messageAnimations[messageId], {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(swipeAnimations[messageId], {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSendMessage = () => {
    setReplyingTo(null);

    if (!inputText.trim()) return;

    const text = inputText.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: Date.now(),
      status: 'sent',
      reactions: {},
    };

    // Check for special keywords
    const matchedKeyword = Object.keys(SPECIAL_KEYWORDS).find(keyword =>
      text.toLowerCase().includes(keyword),
    );

    if (matchedKeyword && matchedKeyword in SPECIAL_KEYWORDS) {
      setSpecialEffects(prev => ({
        ...prev,
        [newMessage.id]: SPECIAL_KEYWORDS[matchedKeyword],
      }));

      // Clear effect after animation
      setTimeout(() => {
        setSpecialEffects(prev => {
          const newEffects = {...prev};
          delete newEffects[newMessage.id];
          return newEffects;
        });
      }, 0);
    }

    // Create exit animation for previous messages with enhanced slide and fade
    messages.forEach(msg => {
      const animation = messageAnimations[msg.id];
      if (animation) {
        Animated.parallel([
          Animated.timing(animation, {
            toValue: 0.3, // More pronounced fade
            duration: 400, // Longer duration for smoother effect
            useNativeDriver: true,
          }),
          Animated.timing(swipeAnimations[msg.id], {
            toValue: -50, // More pronounced slide
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    // Add new message with enhanced entrance animation
    setMessages(prev => [...prev, newMessage]);

    // Enhanced entrance animation
    messageAnimations[newMessage.id] = new Animated.Value(0);
    swipeAnimations[newMessage.id] = new Animated.Value(50); // Start from right

    Animated.parallel([
      Animated.spring(messageAnimations[newMessage.id], {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(swipeAnimations[newMessage.id], {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // After animation, reset previous messages with spring effect
    setTimeout(() => {
      messages.forEach(msg => {
        const animation = messageAnimations[msg.id];
        if (animation) {
          Animated.parallel([
            Animated.spring(animation, {
              toValue: 1,
              friction: 6,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.spring(swipeAnimations[msg.id], {
              toValue: 0,
              friction: 6,
              tension: 40,
              useNativeDriver: true,
            }),
          ]).start();
        }
      });
    }, 400);

    scrollViewRef.current?.scrollToEnd({animated: true});

    // Simulate delivered status after 1 second
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? {...msg, status: 'delivered'} : msg,
        ),
      );

      // Simulate read status after another 1 second
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id ? {...msg, status: 'read'} : msg,
          ),
        );
      }, 1000);
    }, 1000);

    // Simulate bot typing and response
    setTimeout(() => {
      setIsTyping(true);
    }, 2000);

    setTimeout(() => {
      setIsTyping(false);
      typingAnimation.setValue(0);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I received your message: "${text}"`,
        sender: 'bot',
        timestamp: Date.now(),
        reactions: {},
      };

      setMessages(prev => [...prev, botMessage]);
      animateMessage(botMessage.id);
    }, 3000);

    setInputText('');
  };

  const handleReaction = (reaction: string) => {
    if (!reactionBar.message) return;

    const currentUserId = 'user';
    const messageId = reactionBar.message.id;

    // Count recent reactions in last 2 seconds
    const recentReactionsCount = Object?.values(
      reactionBar?.message?.reactions,
    )?.reduce(
      (count, data) =>
        count + (data.timestamp && Date.now() - data.timestamp < 2000 ? 1 : 0),
      0,
    );

    // Trigger rain effect if many quick reactions
    if (recentReactionsCount >= 2) {
      triggerReactionRain(messageId);
    }

    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = {...msg.reactions};

          // Check if user already has ANY reaction on this message
          const userExistingReaction = Object.entries(reactions).find(
            ([_, data]) => data.users.includes(currentUserId),
          );

          // If clicking the same reaction they already made, remove it
          if (userExistingReaction && userExistingReaction[0] === reaction) {
            const [existingEmoji] = userExistingReaction;
            if (reactions[existingEmoji].users.length === 1) {
              // If this was the only user, remove the reaction entirely
              delete reactions[existingEmoji];
            } else {
              // Otherwise just remove the user and decrease count
              reactions[existingEmoji] = {
                count: reactions[existingEmoji].count - 1,
                users: reactions[existingEmoji].users.filter(
                  id => id !== currentUserId,
                ),
              };
            }
          }
          // If user already has a different reaction, remove it and add the new one
          else if (userExistingReaction) {
            const [existingEmoji] = userExistingReaction;
            // Remove old reaction
            if (reactions[existingEmoji].users.length === 1) {
              delete reactions[existingEmoji];
            } else {
              reactions[existingEmoji] = {
                count: reactions[existingEmoji].count - 1,
                users: reactions[existingEmoji].users.filter(
                  id => id !== currentUserId,
                ),
              };
            }
            // Add new reaction
            if (reaction in reactions) {
              reactions[reaction] = {
                count: reactions[reaction].count + 1,
                users: [...reactions[reaction].users, currentUserId],
              };
            } else {
              reactions[reaction] = {
                count: 1,
                users: [currentUserId],
              };
            }
          }
          // If user has no reaction yet, add new reaction
          else {
            if (reaction in reactions) {
              reactions[reaction] = {
                count: reactions[reaction].count + 1,
                users: [...reactions[reaction].users, currentUserId],
              };
            } else {
              reactions[reaction] = {
                count: 1,
                users: [currentUserId],
              };
            }
          }

          // Add timestamp to reaction
          if (reaction in reactions) {
            reactions[reaction] = {
              ...reactions[reaction],
              count: reactions[reaction].count + 1,
              users: [...reactions[reaction].users, currentUserId],
              timestamp: Date.now(),
            };
          } else {
            reactions[reaction] = {
              count: 1,
              users: [currentUserId],
              timestamp: Date.now(),
            };
          }

          return {...msg, reactions};
        }
        return msg;
      }),
    );
    hideReactionBar();
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  const renderReactions = (message: Message) => {
    if (!message.reactions || Object.keys(message.reactions).length === 0)
      return null;

    const currentUserId = 'user'; // In a real app, get this from auth/context

    // Find which emoji the current user has reacted with, if any
    const userReaction = Object.entries(message.reactions).find(([_, data]) =>
      data.users.includes(currentUserId),
    )?.[0];

    return (
      <View style={styles.reactionsContainer}>
        {Object.entries(message.reactions).map(([reaction, data]) => (
          <AnimatedReactionBubble
            key={reaction}
            reaction={reaction}
            count={data.count}
            isSelected={reaction === userReaction}
          />
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

    const effectStyle = {};

    const swipeStyle = {
      transform: [{scale}, {translateX: swipeAnimations[message.id] || 0}],
      opacity: animation || 1,
      ...effectStyle,
    };

    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageBubble,
          message.sender === 'user' ? styles.userBubble : styles.botBubble,
          swipeStyle,
        ]}
        {...panResponder.panHandlers}>
        {isPlaying[message.id] && (
          <ImageBackground
            source={Images.musicGIF}
            style={styles.audioBackgroundGif}
            resizeMode="cover"
          />
        )}

        {/* Audio message rendering */}
        {message.attachment && message.attachment.type === 'audio' && (
          <View
            style={[
              styles.audioContainer,
              isPlaying[message.id] && styles.audioContainerPlaying,
            ]}>
            <TouchableOpacity
              onPress={() => togglePlayback(message.id)}
              style={styles.audioPlayButton}>
              <Text style={styles.audioPlayIcon}>
                {isPlaying[message.id] ? '⏸️' : '▶️'}
              </Text>
            </TouchableOpacity>
            <View style={styles.audioProgressBarBg}>
              <Animated.View
                style={[
                  styles.audioProgressBarFg,
                  {
                    width:
                      playbackAnimation[message.id]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }) || '0%',
                  },
                ]}
              />
            </View>
            <Text style={styles.audioTime}>
              {playTime[message.id] || '00:10'}
            </Text>
          </View>
        )}
        {message.attachment && message.attachment.type === 'image' && (
          <AnimatedImageBubble
            uri={message?.attachment?.uri?.uri}
            style={styles.attachmentImageContainer}
          />
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
            const target = event.target;
            if (target) {
              target.measureInWindow((x, y, width, height) => {
                const reactionY = y - 60;
                const reactionX = x + width / 2;
                showReactionBar(message, reactionY, reactionX);
              });
            }
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
        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.timestamp,
              {
                color: message.sender === 'user' ? Colors.white : Colors.grey,
              },
            ]}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {message.sender === 'user' && message.status && (
            <MessageStatus status={message.status} size={16} />
          )}
          {renderReactions(message)}
        </View>
      </Animated.View>
    );
  };

  // WhatsApp-style reaction bar show/hide
  const showReactionBar = (message: Message, y: number, x: number) => {
    setReactionBar({visible: true, message, y, x});
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
      setReactionBar({visible: false, message: null, y: 0, x: 0});
    });
  };

  // Show birthday overlay when a message contains 'happy birthday'
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.text && lastMsg.text.toLowerCase().includes('happy birthday')) {
      setShowBirthday(true);
      const timer = setTimeout(() => setShowBirthday(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Add these functions before startRecording
  const startRecordingAnimation = () => {
    // Reset animations
    recordingPulse.setValue(1);
    recordingDuration.setValue(0);

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordingPulse, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(recordingPulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Start duration counter
    startTime.current = Date.now();
    recordingTimer.current = setInterval(() => {
      const duration = Math.floor((Date.now() - startTime.current) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      setRecordingTime(
        `${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`,
      );
    }, 1000);
  };

  const stopRecordingAnimation = () => {
    // Stop animations
    recordingPulse.stopAnimation();
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
    }
  };

  // Add this function for mic shake animation
  const startMicShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(micShakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(micShakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(micShakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(micShakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Update startRecording function
  const startRecording = async () => {
    setIsRecording(true);
    startRecordingAnimation();

    // Set timer for auto-stop after 5 seconds
    autoStopTimer.current = setInterval(() => {
      startMicShakeAnimation();
    }, 3000);
  };

  // Update stopRecording function
  const stopRecording = async () => {
    // Clear auto-stop timer if exists
    if (autoStopTimer.current) {
      clearTimeout(autoStopTimer.current);
      autoStopTimer.current = null;
    }

    stopRecordingAnimation();
    setIsRecording(false);
    setRecordingTime('00:00');

    // Simulate sending the recorded audio as a message
    const audioMessage: Message = {
      id: Date.now().toString(),
      text: '',
      sender: 'user',
      timestamp: Date.now(),
      attachment: {
        type: 'audio',
        uri: 'temp://audio.m4a',
        duration: recordingTime,
      },
      status: 'sent',
      reactions: {},
    };

    setMessages(prev => [...prev, audioMessage]);
    animateMessage(audioMessage.id);
    playbackAnimation[audioMessage.id] = new Animated.Value(0);
  };

  // Add playback animation functions
  const togglePlayback = (messageId: string) => {
    const currentlyPlaying = isPlaying[messageId];

    // Stop any other playing audio
    Object.keys(isPlaying).forEach(id => {
      if (id !== messageId && isPlaying[id]) {
        stopPlayback(id);
      }
    });

    if (currentlyPlaying) {
      stopPlayback(messageId);
    } else {
      startPlayback(messageId);
    }
  };

  const startPlayback = (messageId: string) => {
    setIsPlaying(prev => ({...prev, [messageId]: true}));

    if (!playbackAnimation[messageId]) {
      playbackAnimation[messageId] = new Animated.Value(0);
    }

    // Reset progress
    playbackAnimation[messageId].setValue(0);

    // Simulate 10 second audio duration
    Animated.timing(playbackAnimation[messageId], {
      toValue: 1,
      duration: 10000, // 10 seconds
      useNativeDriver: false,
    }).start(({finished}) => {
      if (finished) {
        stopPlayback(messageId);
      }
    });

    // Update progress and time
    const interval = setInterval(() => {
      const currentValue = playbackAnimation[messageId].__getValue();
      const duration = Math.floor(currentValue * 10);
      const seconds = duration % 60;
      setPlayTime(prev => ({
        ...prev,
        [messageId]: `00:${seconds.toString().padStart(2, '0')}`,
      }));
    }, 100);

    return () => clearInterval(interval);
  };

  const stopPlayback = (messageId: string) => {
    setIsPlaying(prev => ({...prev, [messageId]: false}));
    playbackAnimation[messageId]?.stopAnimation();
    setPlayTime(prev => ({...prev, [messageId]: '00:00'}));
  };

  // Function to trigger reaction rain effect
  const triggerReactionRain = (messageId: string) => {
    if (reactionRainRef[messageId]) {
      clearTimeout(reactionRainRef[messageId]);
    }

    setSpecialEffects(prev => ({...prev, [messageId]: 'reaction-rain'}));
    reactionRainRef[messageId] = setTimeout(() => {
      setSpecialEffects(prev => {
        const newEffects = {...prev};
        delete newEffects[messageId];
        return newEffects;
      });
    }, 2000);
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo' || 'video' || 'pdf',
      selectionLimit: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        // setShowAttachmentModal(false);
        // Simulate picking an image from gallery
        // const imageUri = require('./assets/a.jpg'); // Use your own image or a remote URL

        const newMessage: Message = {
          id: Date.now().toString(),
          text: 'Upload Image User',
          sender: 'user',
          // timestamp: new Date(),
          attachment: {
            type: 'image',
            uri: response.assets[0],
          },
          status: 'sent',
        };
        setMessages(prev => [...prev, newMessage]);
        animateMessage(newMessage.id);
        // Use this URI in an <Image> component or upload
      }
    });
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setReactionBar({visible: false, message: null, y: 0, x: 0});
        setShowEmojiPicker(false);
        Keyboard.dismiss();
      }}>
      <SafeAreaView edges={[]} style={styles.container}>
        {showBirthday && (
          <View style={styles.banner}>
            <Confetti />
            <BirthdayBanner />
          </View>
        )}

        <ImageBackground
          source={CHAT_BG as any}
          style={styles.backgroundImage}
          resizeMode="cover">
          <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
            <Animated.View style={{flex: 1}}>
              <StatusBar
                barStyle={'light-content'}
                backgroundColor={Colors.dark}
              />
              <View style={{paddingTop: 70}}></View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={[
                  styles.messagesContent,
                  {paddingBottom: replyingTo ? 80 : 60},
                ]}>
                {messages?.length === 0 ? (
                  <View style={styles.noText}>
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: '600',
                        fontSize: 22,
                      }}>
                      No messages here yet......
                    </Text>
                    <Text
                      style={{
                        top: 10,
                        color: 'white',
                        fontWeight: '300',
                        fontSize: 18,
                      }}>
                      Start a conversation !!
                    </Text>
                  </View>
                ) : (
                  <>
                    {messages.map(renderMessageBubble)}
                    {isTyping && (
                      <View style={styles.typingBubble}>
                        <View style={styles.typingContainer}>
                          <TypingIndicator />
                        </View>
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
              <ActionIndicator
                replyingTo={replyingTo}
                onCancel={() => {
                  setReplyingTo(null);
                }}
              />

              <ReactionBar
                visible={reactionBar.visible}
                message={reactionBar.message}
                position={{x: reactionBar.x, y: reactionBar.y}}
                onReactionSelect={handleReaction}
                onClose={hideReactionBar}
              />

              <FancyInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                placeholderTextColor={Colors.light}
                onEmojiPress={() => {
                  Keyboard.dismiss();
                  setShowEmojiPicker(!showEmojiPicker);
                }}
                onFocus={() => {
                  setShowEmojiPicker(false);
                  scrollViewRef.current?.scrollToEnd({animated: true});
                }}
                editable={!isRecording}
                handleAttachments={openGallery}
                onSendPress={handleSendMessage}
                onAudioPress={isRecording ? stopRecording : startRecording}
                isRecording={isRecording}
                micShakeAnimation={micShakeAnimation}
              />

              {isRecording && (
                <View style={styles.recordingOverlay}>
                  <LinearGradient
                    colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                    start={{x: 0, y: 0}}
                    end={{x: 2, y: 0}}
                    style={[styles.recordingGradient]}>
                    <Animated.View
                      style={[
                        styles.recordingPulse,
                        {
                          transform: [
                            {
                              scale: recordingPulse,
                            },
                          ],
                        },
                      ]}>
                      <View style={styles.recordingDot} />
                    </Animated.View>
                    <Text style={styles.recordingTime}>{recordingTime}</Text>
                  </LinearGradient>
                </View>
              )}

              {showEmojiPicker && (
                <View style={styles.emojiPickerContainer}>
                  <EmojiSelector
                    onEmojiSelected={emoji =>
                      setInputText(prev => prev + emoji)
                    }
                    showSearchBar={false}
                    showTabs={true}
                    showHistory={true}
                    columns={8}
                  />
                </View>
              )}
            </Animated.View>
          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

export default ChatScreen;
