
import { sendMessage, subscribeToMessages } from '@/services/ChatService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Bubble,
  GiftedChat,
  IMessage,
  InputToolbar,
  Send
} from 'react-native-gifted-chat';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatRoomScreen() {
  const router = useRouter(); 
  const insets = useSafeAreaInsets();
  
  
  const params = useLocalSearchParams();
  const { 
    matchId, 
    userId, 
    userName, 
    otherUserName = 'Chat', 
    otherUserAvatar,
    otherUserId
  } = params as { 
    matchId: string, 
    userId: string, 
    userName: string, 
    otherUserName: string, 
    otherUserAvatar: string 
    otherUserId: string 
  };

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);


  const handleOpenProfile = () => {
    router.push({
      pathname: '/public_profile',
      params: { userId: otherUserId } 
    });
  };

  
  useEffect(() => {
    if (!matchId || !userId) return;

    const unsubscribe = subscribeToMessages(matchId, (newMessages) => {
      const formatted = newMessages.map((msg) => ({
        ...msg,
        user: {
          _id: msg.user._id,
          name: msg.user._id === userId ? userName : otherUserName,
          avatar: (msg.user._id !== userId) 
            ? (otherUserAvatar || 'https://placehold.co/100x100/png') 
            : undefined,
        }
      }));
      
      setMessages(formatted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [matchId, userId, userName, otherUserName, otherUserAvatar]);

  
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    
    const msg = newMessages[0];
    try {
      if (matchId && userId) {
        await sendMessage(userId, matchId, msg.text);
      }
    } catch (e) {
      console.error("Failed to send", e);
    }
  }, [matchId, userId]);

  

  const renderInputToolbar = useCallback((props: any) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={{ alignItems: 'center' }}
    />
  ), []);

  const renderSend = useCallback((props: any) => (
    <Send {...props}>
      <View style={styles.sendButton}>
        <Ionicons name="arrow-up" size={20} color="#fff" />
      </View>
    </Send>
  ), []);

  const renderBubble = useCallback((props: any) => (
    <Bubble {...props} 
      wrapperStyle={{
        right: { backgroundColor: '#fe3c72' },
        left: { backgroundColor: '#f0f0f0' }
      }} 
      textStyle={{
        right: { color: '#ffffff' },
        left: { color: '#333333' }
      }}
    />
  ), []);

  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      

      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fe3c72" />
          </TouchableOpacity>
          

          <TouchableOpacity 
            onPress={handleOpenProfile} 
            style={styles.headerProfileContainer}
          >
            {otherUserAvatar && (
              <Image source={{ uri: otherUserAvatar }} style={styles.headerAvatar} />
            )}
            <Text style={styles.headerTitle}>{otherUserName}</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>

      {loading ? (
        <ActivityIndicator size="large" color="#fe3c72" style={{ marginTop: 20 }} />
      ) : (
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} 
        >
          <GiftedChat
            messages={messages}
            onSend={messages => onSend(messages)}
            user={{ _id: userId }}
            
            
            
            textInputStyle={styles.textInput}
            placeholder="Type a message..."
            textInputProps={{
              placeholderTextColor: '#999',
              style: { color: '#000', paddingTop: 8, paddingLeft: 10 } 
            }}
            
            
            renderInputToolbar={renderInputToolbar}
            renderSend={renderSend}
            renderBubble={renderBubble}
            
            
            bottomOffset={insets.bottom} 
          />
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 50,
  },
  backButton: { marginRight: 10, padding: 5 },
  
  
  headerProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#eee'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  

  inputToolbar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginTop: 6,
    marginRight: 10,
    marginLeft: 0,
    paddingHorizontal: 10,
    fontSize: 16,
    lineHeight: 20,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fe3c72',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    marginRight: 5,
  }
});