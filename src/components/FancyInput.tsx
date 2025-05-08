import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import {Icons} from '../assets';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import type {FancyInputProps} from '../types/chatTypes';

const FancyInput: React.FC<FancyInputProps> = ({
  value,
  onChangeText,
  placeholder,
  onEmojiPress,
  onSendPress,
  onAudioPress,
  onFocus,
  handleAttachments,
  isRecording,
  micShakeAnimation,
  editable,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton} onPress={onEmojiPress}>
          <Icons.EmojiIcon
            width={24}
            height={24}
            color="rgba(255,255,255,0.8)"
          />
        </TouchableOpacity>

        <View style={styles.textInputWrapper}>
          <TextInput
            editable={editable}
            style={styles.input}
            onFocus={onFocus}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.5)"
            numberOfLines={1}
            maxLength={1000}
          />
        </View>

        <View style={[styles.inputContainer, {gap: 10}]}>
          {!isRecording && (
            <TouchableOpacity onPress={handleAttachments} hitSlop={10}>
              <Icons.AttachmentIcon
                width={22}
                height={22}
                color={Colors.white}
              />
            </TouchableOpacity>
          )}
          <Animated.View
            style={{
              transform: [
                {
                  translateX: micShakeAnimation || 0,
                },
              ],
            }}>
            {value ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.sendButton]}
                onPress={onSendPress}>
                <Icons.SendIcon width={22} height={22} color={Colors.white} />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.sendButton,
                    isRecording && styles.recordingButton,
                  ]}
                  onPress={onAudioPress}>
                  <Icons.MicIcon width={22} height={22} color={Colors.white} />
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInputWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  input: {
    color: Colors.white,
    fontSize: 16,
  },
  attachButton: {
    padding: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#007AFF',
  },
  sendButton: {
    backgroundColor: '#007AFF',
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
});

export default FancyInput;
