import { Story } from '@/constants/Story';
import { fetchStoriesFeed } from '@/services/StoryService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions, Image, StyleSheet,
  Text,
  TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function StoryViewScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();

  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) loadStories();
  }, [userId]);

  const loadStories = async () => {
    try {
      const allStories = await fetchStoriesFeed(userId as string); 
      
      const userStories = allStories.filter(s => s.userId === userId);
      setStories(userStories);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.back(); 
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(0);
    }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator color="#fff"/></View>;
  if (stories.length === 0) return <View style={styles.container}><Text style={{color:'#fff'}}>No stories.</Text></View>;

  const currentStory = stories[currentIndex];

  return (
    <View style={styles.container}>
      
      <Image 
        source={{ uri: currentStory.imageUrl }} 
        style={styles.image} 
        resizeMode="contain" 
      />

      
      <SafeAreaView style={styles.progressContainer}>
        {stories.map((_, index) => (
          <View key={index} style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: index <= currentIndex ? '100%' : '0%' }
              ]} 
            />
          </View>
        ))}
      </SafeAreaView>

      
      <View style={styles.header}>
        <Image source={{ uri: currentStory.userAvatar }} style={styles.avatar} />
        <Text style={styles.name}>{currentStory.userName}</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      
      <View style={styles.touchContainer}>
        <TouchableOpacity style={styles.touchLeft} onPress={handlePrev} />
        <TouchableOpacity style={styles.touchRight} onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { width: width, height: height, position: 'absolute' },
  
  progressContainer: { 
    flexDirection: 'row', 
    marginHorizontal: 10, 
    top: 10,
    gap: 5
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff'
  },

  header: {
    position: 'absolute',
    top: 60,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10
  },
  avatar: { width: 35, height: 35, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#fff' },
  name: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closeBtn: { marginLeft: 'auto', right: -20 }, 

  touchContainer: { flexDirection: 'row', flex: 1, zIndex: 1 },
  touchLeft: { flex: 1 }, 
  touchRight: { flex: 1 }, 
});