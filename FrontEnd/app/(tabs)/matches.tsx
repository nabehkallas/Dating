import { isToday, isYesterday } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { useAuth } from '@/context/AuthContext';
import { fetchPendingLikes, PendingLike, respondToLike } from '@/services/MatchService';
import { useTranslation } from 'react-i18next';

import MatchRow from '@/components/Matches/MatchRow';
import SectionHeader from '@/components/Matches/SectionHeader';

const CARD_SPACING = 15;

export default function MatchesScreen() {
  const { t } = useTranslation();
  const [sections, setSections] = useState<any[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(true);

  const { user, loading: authLoading } = useAuth();

 
  useFocusEffect(
    useCallback(() => {
      if (user) {
        
        loadLikes();
      }
    }, [user])
  );

  const loadLikes = async () => {
    if (!user) return;

    try {
      const data = await fetchPendingLikes(user.uid);
      const grouped = groupLikesByDate(data);
      setSections(grouped);
    } catch (error) {
      console.log("Error loading likes", error);
    } finally {
      setLoadingLikes(false);
    }
  };

  const chunkArray = (array: PendingLike[], size: number) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  };

  const groupLikesByDate = (likes: PendingLike[]) => {
    const today: PendingLike[] = [];
    const yesterday: PendingLike[] = [];
    const earlier: PendingLike[] = [];

    likes.forEach(like => {
      const date = new Date(like.timestamp);
      if (isToday(date)) today.push(like);
      else if (isYesterday(date)) yesterday.push(like);
      else earlier.push(like);
    });

    const result = [];
    
    if (today.length > 0) result.push({ title: 'Today', data: chunkArray(today, 2) });
    if (yesterday.length > 0) result.push({ title: 'Yesterday', data: chunkArray(yesterday, 2) });
    if (earlier.length > 0) result.push({ title: 'Earlier', data: chunkArray(earlier, 2) });

    return result;
  };

  const handleResponse = async (targetUser: PendingLike, action: 'accept' | 'reject') => {
    if (!user) return;

    if (action === 'accept') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setSections(currentSections => {
      return currentSections.map(section => {
       
        const updatedChunks = section.data.map((chunk: PendingLike[]) => 
          chunk.filter(u => u.id !== targetUser.id)
        ).filter((chunk: PendingLike[]) => chunk.length > 0); 

        return { ...section, data: updatedChunks };
      }).filter(section => section.data.length > 0); 
    });

    if (action === 'accept') {
       setTimeout(() => {
         Alert.alert("It's a Match! 🎉", `You can now chat with ${targetUser.name}`);
       }, 200);
    }

   
    try {
      
      await respondToLike(user.uid, targetUser.id, action);
      
    } catch (error) {
      console.error("Failed to sync match", error);
      Alert.alert("Error", "Action failed. Reloading...");
      loadLikes(); 
    }
  };

  
  if (authLoading || (loadingLikes && sections.length === 0)) {
    return (
      <View style={[styles.center,{backgroundColor: '#fff'}]}>
        <ActivityIndicator size="large" color="#fe3c72" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('Matches')}</Text>
        <Text style={styles.headerSubtitle}>{t('This is a list of people who have liked you.')}</Text>
      </View>

      {sections.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('No new likes yet.')}</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <MatchRow items={item} onResponse={handleResponse} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <SectionHeader title={title} />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  header: { padding: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 34, fontWeight: 'bold', color: '#000' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 5, marginBottom: 10 },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },

  listContent: { paddingHorizontal: CARD_SPACING, paddingBottom: 40 },
});