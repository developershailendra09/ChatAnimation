import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';

interface LinkPreviewProps {
  url: string;
  isDarkMode: boolean;
}

interface PreviewData {
  title: string;
  description: string;
  image: string;
  type: 'youtube' | 'facebook' | 'general';
}

const LinkPreview: React.FC<LinkPreviewProps> = ({url, isDarkMode}) => {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would:
        // 1. Call your backend API to fetch metadata
        // 2. Parse the response
        // 3. Handle different types of URLs differently

        // Mock implementation for demonstration
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          setPreviewData({
            title: 'YouTube Video Title',
            description: 'Video description would go here...',
            image: 'https://via.placeholder.com/300x200',
            type: 'youtube',
          });
        } else if (url.includes('facebook.com')) {
          setPreviewData({
            title: 'Facebook Post',
            description: 'Post content preview...',
            image: 'https://via.placeholder.com/300x200',
            type: 'facebook',
          });
        } else {
          setPreviewData({
            title: 'Website Title',
            description: 'Website description...',
            image: 'https://via.placeholder.com/300x200',
            type: 'general',
          });
        }
      } catch (error) {
        console.error('Error fetching preview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewData();
  }, [url]);

  if (loading || !previewData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, isDarkMode && styles.lightText]}>
          Loading preview...
        </Text>
      </View>
    );
  }

  const getIconForType = (type: PreviewData['type']) => {
    switch (type) {
      case 'youtube':
        return '▶️';
      case 'facebook':
        return 'ⓕ';
      default:
        return '🌐';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isDarkMode && styles.darkContainer]}
      onPress={() => Linking.openURL(url)}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIconForType(previewData.type)}</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text
          style={[styles.title, isDarkMode && styles.lightText]}
          numberOfLines={1}>
          {previewData.title}
        </Text>
        <Text
          style={[styles.description, isDarkMode && styles.lightText]}
          numberOfLines={2}>
          {previewData.description}
        </Text>
      </View>
      {previewData.image && (
        <Image source={{uri: previewData.image}} style={styles.thumbnail} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  darkContainer: {
    backgroundColor: '#2a2a2a',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
  },
  iconContainer: {
    marginRight: 10,
  },
  icon: {
    fontSize: 24,
  },
  contentContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  lightText: {
    color: '#fff',
  },
});

export default LinkPreview;
