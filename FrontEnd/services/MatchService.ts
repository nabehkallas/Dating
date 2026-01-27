import axios from 'axios';
import { ip } from '../constants/constants';
import { auth } from '../firebaseConfig';


const API_URL = ip; 


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});


api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;

    } catch (error) {
      console.error("Error fetching token:", error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export interface PendingLike {
  id: string; 
  name: string;
  age: number;
  avatar: string; 
  type: 'like' | 'super';
  isPrivate: boolean;
  timestamp: string;
}


export const fetchPendingLikes = async (userId: string): Promise<PendingLike[]> => {
  try {

    const response = await api.get(`/matches/pending?user_id=${userId}`);

    const rawData = Array.isArray(response.data.data) ? response.data.data : [];

    return rawData.map((item: any) => ({
      id: item.id || item.uid || 'unknown_id', 
      name: item.name || 'Unknown',
      age: (typeof item.age === 'number') ? item.age : 25,
      avatar: item.avatar || 'https://via.placeholder.com/300', 
      type: item.type === 'super' ? 'super' : 'like',
      isPrivate: !!item.isPrivate,
      timestamp: item.timestamp || new Date().toISOString(),
    }));

  } catch (error) {
    console.error("Error fetching likes:", error);
    return [];
  }
};

export const respondToLike = async (
  currentUserId: string, 
  targetUserId: string, 
  action: 'accept' | 'reject'
) => {
  const direction = action === 'accept' ? 'right' : 'left';
  
  try {
    const response = await api.post('/swipe', {
        user_id: currentUserId,
        swiped_user_id: targetUserId,
        direction: direction
    });
    return response.data;
  } catch (error) {
      console.error("Error responding to like:", error);
      throw error;
  }
};