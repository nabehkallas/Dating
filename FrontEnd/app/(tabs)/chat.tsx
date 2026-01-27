
import StoriesRail from '@/components/stories/StoriesRail';
import { subscribeToInbox } from '@/services/ChatService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';

export default function ChatScreen() {
  const { t } = useTranslation();
  const router = useRouter(); 
  const { user } = useAuth();

  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    if (!user) return; 

    const unsubscribe = subscribeToInbox(user.uid, (data) => {
      const formattedData = data.map(chat => ({
        ...chat,
        
        time: timeAgo(chat.timestamp) 
      }));
      
      setChats(formattedData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const timeAgo = (date: Date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return Math.floor(seconds/60) + 'm';
    if (seconds < 86400) return Math.floor(seconds/3600) + 'h';
    return Math.floor(seconds/86400) + 'd';
  };

  const handlePressChat = (item: any) => {
    if (!user) return;

  
    const validOtherUserImage = 
                             item.userInfo?.avatar 
                             || item.avatar 
                             || 'https://placehold.co/200/png';

    
    router.push({
      pathname: "/chat_room",
      params: { 
        matchId: item.id, 
        userId: user.uid,
        userName: user.displayName || 'Me',
        otherUserName: item.name,
        otherUserAvatar: validOtherUserImage,
        otherUserId: item.otherUserId 
      }
    });
  };

  const renderChatItem = ({ item }: any) => {
    
    const displayImage = item.avatar ||  'https://placehold.co/150/png';

    return (
      <TouchableOpacity style={styles.chatRow} onPress={() => handlePressChat(item)}>
        <Image 
          source={{ uri: displayImage }} 
          style={styles.chatAvatar} 
        />
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{item.name}</Text>
            <Text style={styles.chatTime}>{item.time}</Text>
          </View>
          <Text style={styles.chatMessage} numberOfLines={1}>
            {item.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.title}>{t('Messages')}</Text>
      </View>

      <View>
       
        <StoriesRail currentUserId={user?.uid || ''} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#fe3c72" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={{ marginTop: 50, alignItems: 'center' }}>
              <Text style={styles.emptyText}>No matches yet.</Text>
              <Text style={{color:'#ccc', fontSize:12, marginTop:5}}>
                Start swiping to find people!
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 34, fontWeight: 'bold', color: '#000' },
  listContent: { paddingBottom: 20 },
  chatRow: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  chatAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee' },
  chatContent: { flex: 1, marginLeft: 15 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  chatName: { fontSize: 16, fontWeight: '600', color: '#000' },
  chatTime: { fontSize: 12, color: '#999' },
  chatMessage: { fontSize: 14, color: '#666' },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 18, fontWeight: '600' }
});