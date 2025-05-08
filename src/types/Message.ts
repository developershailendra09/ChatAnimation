import {MessageStatusType} from '../components/MessageStatus';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  reactions: {
    [key: string]: {
      count: number;
      users: string[];
      timestamp?: number;
    }
  };
  replyTo?: Message;
  status?: MessageStatusType;
  attachment?: {
    type: 'image' | 'video' | 'audio' | 'file';
    uri: string;
    name?: string;
    duration?: string;
  };
} 