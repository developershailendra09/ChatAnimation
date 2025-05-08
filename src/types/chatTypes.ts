import {Animated} from 'react-native';

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

export interface FancyInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  onEmojiPress: () => void;
  onSendPress: () => void;
  onAudioPress: () => void;
  isRecording: boolean;
  onFocus: () => void;
  handleAttachments?: () => void;
  micShakeAnimation?: Animated.Value;
  editable?: boolean
}