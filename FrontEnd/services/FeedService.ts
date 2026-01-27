import axios from 'axios';
import { ip } from '../constants/constants';
import { FeedUser } from '../constants/Users';
import { auth } from '../firebaseConfig';


const API_URL = ip; 

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const fetchFeed = async (userId: string): Promise<FeedUser[]> => {
  try {

    const response = await api.get(`/feed?user_id=${userId}`);
    
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching feed:", error);
    throw error;
  }
};