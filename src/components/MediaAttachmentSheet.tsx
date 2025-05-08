import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import {BottomSheet} from './BottomSheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface MediaAttachmentSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectImage: () => void;
  onSelectVideo: () => void;
  onSelectFile: () => void;
}

export const MediaAttachmentSheet: React.FC<MediaAttachmentSheetProps> = ({
  isVisible,
  onClose,
  onSelectImage,
  onSelectVideo,
  onSelectFile,
}) => {
  const options = [
    {
      icon: 'image',
      label: 'Photo',
      onPress: onSelectImage,
    },
    {
      icon: 'video',
      label: 'Video',
      onPress: onSelectVideo,
    },
    {
      icon: 'file-document',
      label: 'Document',
      onPress: onSelectFile,
    },
  ];

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose} height={240}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Attachment</Text>
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => {
                option.onPress();
                onClose();
              }}>
              <View style={styles.iconContainer}>
                <Icon name={option.icon} size={28} color="#007AFF" />
              </View>
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  option: {
    alignItems: 'center',
    width: 80,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Platform.select({
      ios: '#E5E5EA',
      android: '#F5F5F5',
    }),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },
});
