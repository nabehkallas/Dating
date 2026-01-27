import axios from 'axios';
import { ip } from '../constants/constants';
import { Story } from '../constants/Story';
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
      console.error("Error attaching token to Story request:", error);
    }
  }
  return config;
});


export const fetchStoriesFeed = async (userId: string): Promise<Story[]> => {
  try {

    const response = await api.get('/stories/feed', {
      params: { user_id: userId }
    });

    if (response.data.status === 'success') {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching stories feed:", error);
    throw error;
  }
};


export const markStoryViewed = async (storyId: string, userId: string) => {
  try {
    await api.post('/stories/view', {
      story_id: storyId,
      user_id: userId
    });
  } catch (error) {
    console.log("Failed to mark view");
  }
};


export const createStory = async (
  userId: string, 
  imageUrl: string, 
  userName: string, 
  userAvatar: string
) => {
  try {

    const response = await api.post('/stories', {

      user_id: userId,
      imageUrl: imageUrl,     
      userName: userName,     
      userAvatar: userAvatar  
    });
    
    console.log("Story created successfully in Laravel");
    return response.data;
  } catch (error) {
    console.error("Failed to create story:", error);
    throw error;
  }
};