import React from 'react';
import {TouchableOpacity, Text, StyleSheet, Platform, View} from 'react-native';

interface MessageReactionProps {
  emoji: string;
  onPress: () => void;
  isSelected: boolean;
}

export const MessageReaction: React.FC<MessageReactionProps> = ({
  emoji,
  onPress,
  isSelected,
}) => {
  if (!emoji) return null;

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={styles.emoji}>{emoji}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.select({
      ios: '#F2F2F7',
      android: '#F5F5F5',
    }),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  emoji: {
    fontSize: 16,
  },
});
