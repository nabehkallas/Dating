
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebaseConfig';


export const sendMessage = async (userId: string, matchId: string, text: string) => {
  try {
    const messagesRef = collection(db, 'matches', matchId, 'messages');
    await addDoc(messagesRef, {
      text: text,
      senderId: userId,
      createdAt: serverTimestamp(),
    });


    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      lastMessage: text,
      lastMessageTimestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Send Error:", error);
    throw error;
  }
};

export const subscribeToMessages = (matchId: string, onUpdate: (msgs: any[]) => void) => {
  const messagesRef = collection(db, 'matches', matchId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      
      return {
        _id: doc.id,
        text: data.text,
        createdAt: date,
        user: { _id: data.senderId },
      };
    });
    onUpdate(messages);
  }, (error) => console.error("Message Subscribe Error:", error));
};

export const subscribeToInbox = (userId: string, onUpdate: (chats: any[]) => void) => {
  const matchesRef = collection(db, 'matches');

  const q = query(
    matchesRef, 
    where('users', 'array-contains', userId), 
    orderBy('lastMessageTimestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => {
      const data = doc.data();
      
      
      const isUser1 = data.users?.[0] === userId;

      
      const otherUserName = isUser1 ? data.user2_name : data.user1_name;
      const otherUserAvatar = isUser1 ? data.user2_avatar : data.user1_avatar;
      
     
      const otherUserId = isUser1 ? data.users?.[1] : data.users?.[0];

      return {
        id: doc.id,
        name: otherUserName || 'Unknown',
        avatar: otherUserAvatar || 'https://placehold.co/150',
        message: data.lastMessage || 'New Match!',
        timestamp: data.lastMessageTimestamp?.toDate ? data.lastMessageTimestamp.toDate() : new Date(),
        
      
        otherUserId: otherUserId 
      };
    });
    onUpdate(chats);
  }, (error) => console.error("Inbox Subscribe Error:", error));
};