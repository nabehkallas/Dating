import { Story } from '@/constants/Story';
import { fetchStoriesFeed } from '@/services/StoryService';
import { useRouter } from 'expo-router'; // <--- 1. Use Expo Router
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function StoriesRail({ currentUserId }: { currentUserId: string }) {
  const { t } = useTranslation();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); 

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const data = await fetchStoriesFeed(currentUserId);
      setStories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePressStory = (story: Story) => {
    
    router.push({
      pathname: "/story_view",
      params: { userId: story.userId } 
    });
  };

  const renderItem = ({ item }: { item: Story }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handlePressStory(item)}>
      
      
      <View style={styles.borderContainer}>
        <View style={styles.whiteSpacing}>
         
          <Image 
            source={{ uri: item.userAvatar || item.imageUrl }} 
            style={styles.avatar} 
          />
        </View>
      </View>
      
      <Text style={styles.username} numberOfLines={1}>
        {item.userName || "User"}
      </Text>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ margin: 20 }} color="#fe3c72" />;
  if (stories.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{t('Recent Stories')}</Text>
      <FlatList
        data={stories}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 15,
  },
  itemContainer: {
    alignItems: 'center',
    marginRight: 15,
    width: 70,
  },
  borderContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fe3c72',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteSpacing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
    resizeMode: 'cover',
  },
  username: {
    marginTop: 5,
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  }
});