import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Icons} from '../assets';

const ActionIndicator: React.FC<{
  replyingTo: any;
  onCancel: () => void;
}> = ({replyingTo, onCancel}) => {
  if (!replyingTo) return null;

  return (
    <View style={styles.actionIndicator}>
      <View style={styles.actionIndicatorContent}>
        <View
          style={{
            width: 3,
            backgroundColor: '#8E44AD',
            position: 'absolute',
            left: 0,
            top: 4,
            bottom: 4,
            borderRadius: 2,
          }}
        />
        <Text style={styles.actionLabel}>
          {replyingTo ? 'Reply' : 'Forward'}
        </Text>
        <Text style={styles.actionText} numberOfLines={1}>
          {replyingTo?.text}
        </Text>
        <TouchableOpacity style={styles.closeActionButton} onPress={onCancel}>
          <Icons.CloseIcon
            width={16}
            height={16}
            color="rgba(255,255,255,0.8)"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionIndicator: {
    backgroundColor: '#1F1F1F',
    padding: 8,
    position: 'absolute',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    bottom: 75,
    width: '100%',
    zIndex: 999,
  },

  closeActionButton: {
    borderRadius: 50,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionIndicatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionLabel: {
    fontSize: 14,
    color: '#8E44AD',
    fontWeight: '600',
    marginRight: 8,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 20,
    color: '#333',
  },
});

export default ActionIndicator;
