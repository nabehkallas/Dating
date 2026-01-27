import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator, Alert,
  Platform,
  StatusBar, StyleSheet, Text, View
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';


import { useAuth } from '@/context/AuthContext';


import { FeedUser } from '@/constants/Users';
import { fetchFeed } from '@/services/FeedService';

import { pickImage, uploadImageToCloudinary, uploadStoryImageToCloudinary } from '@/services/ImageService';
import {
  addImageToGallery,
  fetchProfile,
  updateUserLocation,
  updateUserPreferences,
  UserPreferences,
  UserProfile
} from '@/services/ProfileService';
import { createStory } from '@/services/StoryService';
import { submitSwipe } from '@/services/SwipeService';


import { ActionButtons } from '@/components/Home/ActionButtons';
import { FilterModal } from '@/components/Home/FilterModal';
import { HomeHeader } from '@/components/Home/HomeHeader';
import { SwipeFeed } from '@/components/Home/SwipeFeed';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  
 
  const [feed, setFeed] = useState<FeedUser[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [uploading, setUploading] = useState(false);

  const swiperRef = useRef<Swiper<FeedUser>>(null);

  
  useEffect(() => {
    if (user) {
      initializeLocation();
    }
  }, [user]);

  
  useFocusEffect(
    useCallback(() => {
      if (user) {
        checkPreferences();
        loadFeed();
      }
    }, [user])
  );

  
  const initializeLocation = async () => {
    if (!user) return;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      await updateUserLocation(user.uid, loc.coords.latitude, loc.coords.longitude);
      
    } catch (error) {
      console.log("Error initializing location:", error);
    }
  };

  
  const checkPreferences = async () => {
    if (!user) return;
    try {
      const profile = await fetchProfile(user.uid);
      setUserProfile(profile);

      if (!profile || !profile.preferences) {
        setTimeout(() => setModalVisible(true), 1000); 
      }
    } catch (e) {
      console.error("Error checking prefs:", e);
    }
  };

  
  const loadFeed = async () => {
    if (!user) return;
    try {
      const fetchedFeed = await fetchFeed(user.uid);
      const validUsers = fetchedFeed.filter(u => u.avatar && u.avatar.startsWith('http'));
      setFeed(validUsers);
    } catch (error) {
      console.error("Failed to load feed:", error);
    } finally {
      setLoadingFeed(false);
    }
  };

  
  const handleSwipeApi = async (direction: 'left' | 'right' | 'super', index: number) => {
    const swipedUser = feed[index];
    if (!swipedUser || !user) return;

    try {
      const data = await submitSwipe(user.uid, swipedUser.uid, direction);
      if (data.match) {
        Alert.alert(t("It's a Match! 🎉"), `${t('You can now chat with')} ${swipedUser.name}!`);
      }
    } catch (error) {
      console.log("Swipe failed silently");
    }
  };

  
  const handleSavePreferences = async (newPrefs: UserPreferences) => {
    if (!user) return;
    try {
      await updateUserPreferences(user.uid, newPrefs);
      if (userProfile) setUserProfile({ ...userProfile, preferences: newPrefs });
      Alert.alert(t("Apply Filters"), t("Searching for your perfect match..."));
      setLoadingFeed(true);
      loadFeed(); 
    } catch (error) {
      Alert.alert(t("Error"), t("Could not save settings."));
    }
  };

  
  const handleAddMediaPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('Cancel'), t('Recent Stories'), t('Gallery')], // Translated options
          cancelButtonIndex: 0,
          tintColor: '#fe3c72'
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) await processUpload('story');
          if (buttonIndex === 2) await processUpload('gallery');
        }
      );
    } else {
      Alert.alert(t("ADD MEDIA"), t("Choose where to upload"), [
        { text: t("Cancel"), style: "cancel" },
        { text: t("Recent Stories"), onPress: () => processUpload('story') },
        { text: t("Gallery"), onPress: () => processUpload('gallery') }
      ]);
    }
  };

  const processUpload = async (type: 'story' | 'gallery') => {
    if (!user) return;
    try {
      const uri = await pickImage();
      if (!uri) return;

      setUploading(true);

      
      let cloudUrl: string | null = null;

      if (type === 'story') {
        
         cloudUrl = await uploadStoryImageToCloudinary(uri);
      } else {
        
         cloudUrl = await uploadImageToCloudinary(uri);
      }
      
      if (!cloudUrl) {
        Alert.alert(t("Error"), t("Upload failed."));
        setUploading(false);
        return;
      }

      if (type === 'story') {
        await createStory(user.uid, cloudUrl, userProfile?.name || 'Unknown', 
          userProfile?.avatar || 'https://via.placeholder.com/150');
        Alert.alert(t("Success"), t("Story added!"));
      } else {
        await addImageToGallery(user.uid, cloudUrl);
        Alert.alert(t("Success"), t("Added to your gallery!"));
      }
    } catch (error) {
      Alert.alert(t("Error"), t("Something went wrong."));
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || (loadingFeed && feed.length === 0)) {
    return (
      <View style={[styles.center, { backgroundColor: '#f4f4f4' }]}>
        <ActivityIndicator size="large" color="#fe3c72" />
        <Text style={{marginTop: 10, color: '#888'}}>{t('Finding people near you...')}</Text>
      </View>
    );
  }

  if (!user) return null;

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={styles.safeArea}>
        <HomeHeader 
          onFilterPress={() => setModalVisible(true)} 
          onAddPress={handleAddMediaPress}
        />

        <SwipeFeed 
          ref={swiperRef}
          data={feed}
          onSwipeLeft={(index) => handleSwipeApi('left', index)}
          onSwipeRight={(index) => handleSwipeApi('right', index)}
          onSwipeTop={(index) => handleSwipeApi('super', index)}
        />

        <ActionButtons 
          onSwipeLeft={() => swiperRef.current?.swipeLeft()}
          onSwipeRight={() => swiperRef.current?.swipeRight()}
          onSwipeTop={() => swiperRef.current?.swipeTop()}
        />

        <FilterModal 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)}
          onApply={handleSavePreferences}
          initialValues={userProfile?.preferences} 
        />

        {uploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>{t('Uploading...')}</Text>
          </View>
        )}

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  safeArea: {
    flex: 1,
    position: 'relative',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 16
  }
});