import axios from 'axios';
import { ip } from '../constants/constants';
import { auth } from '../firebaseConfig';



const BASE_URL = ip;


const api = axios.create({
  baseURL: BASE_URL,
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
      console.error("Error fetching token for swipe:", error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const submitSwipe = async (
  currentUserId: string, 
  swipedUserId: string, 
  direction: 'left' | 'right' | 'super'
) => {
  try {

    const response = await api.post('/swipe', {
      user_id: currentUserId,
      swiped_user_id: swipedUserId,
      direction: direction,
    });

    return response.data;
  } catch (error) {
    console.error('Swipe Service Error:', error);
    throw error;
  }
};