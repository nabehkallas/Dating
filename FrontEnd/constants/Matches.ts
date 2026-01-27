import { mockUsers } from './Users';

export interface Message {
  senderId: string;
  text: string;
  timestamp: number; 
  type: 'text' | 'image' | 'video';
}

export interface Match {
  id: string;
  lastMessage: string;
  lastMessageTime: number; 
  seenBy: string[]; 
  userMap: { [key: string]: { avatar: string; name: string } };
  users: string[]; 
  messages: Message[]; 
}


const createUserMap = (userIds: string[]) => {
  const map: { [key: string]: { avatar: string; name: string } } = {};
  userIds.forEach(id => {
    const user = mockUsers.find(u => u.uid === id);
    if (user) {
      map[id] = { avatar: user.avatar, name: user.name }; 
    }
  });
  return map;
};

export const mockMatches: Match[] = [
  {
    id: 'match1',
    lastMessage: 'Hey Sarah, how are you?',
    lastMessageTime: Date.now() - 3600000,
    seenBy: ['uid1'],
    userMap: createUserMap(['uid1', 'uid2']),
    users: ['uid1', 'uid2'],
    messages: [
      { senderId: 'uid1', text: 'Hi John!', timestamp: Date.now() - 7200000, type: 'text' },
      { senderId: 'uid2', text: 'Hey Sarah, how are you?', timestamp: Date.now() - 3600000, type: 'text' },
    ],
  },
  {
    id: 'match2',
    lastMessage: 'Let\'s grab coffee sometime!',
    lastMessageTime: Date.now() - 86400000,
    seenBy: ['uid3', 'uid4'],
    userMap: createUserMap(['uid3', 'uid4']),
    users: ['uid3', 'uid4'],
    messages: [
      { senderId: 'uid3', text: 'Hey Michael!', timestamp: Date.now() - 172800000, type: 'text' },
      { senderId: 'uid4', text: 'Let\'s grab coffee sometime!', timestamp: Date.now() - 86400000, type: 'text' },
    ],
  },
  {
    id: 'match3',
    lastMessage: 'Nice to meet you!',
    lastMessageTime: Date.now() - 2 * 86400000,
    seenBy: ['uid5'],
    userMap: createUserMap(['uid5', 'uid1']),
    users: ['uid5', 'uid1'],
    messages: [
      { senderId: 'uid5', text: 'Hi Sarah!', timestamp: Date.now() - 3 * 86400000, type: 'text' },
      { senderId: 'uid1', text: 'Nice to meet you!', timestamp: Date.now() - 2 * 86400000, type: 'text' },
    ],
  },
];
