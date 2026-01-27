import axios from 'axios';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { ip } from '../constants/constants';
import { auth, db } from '../firebaseConfig';


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



export interface UserPreferences {
  minAge: number;
  maxAge: number;
  maxDistance: number;
  genderInterest: 'male' | 'female' | 'everyone';
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio?: string;
  avatar?: string;
  gallery?: string[];
  gender?: string;
  isVerified?: boolean;
  preferences?: UserPreferences;
}

export const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const response = await api.get(`/profile?user_id=${userId}`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }

    return null;

  } catch (error: any) {

    if (error.response) {

        console.error("🔥 SERVER ERROR:", error.response.status);
        console.error("📄 ERROR DATA:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {

        console.error("❌ NO RESPONSE FROM SERVER:", error.request);
    } else {

        console.error("⚠️ FETCH SETUP ERROR:", error.message);
    }

    return null; 
  }
};


export const updateUserPreferences = async (userId: string, preferences: UserPreferences) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      preferences: preferences
    });
    console.log("Preferences synced to Firestore");
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
};


export const updateUserLocation = async (userId: string, lat: number, lng: number) => {
  try {
    const userRef = doc(db, "users", userId);
    
    await updateDoc(userRef, {
      location: {
        lat: lat,
        lon: lng 
      },
      lastLocationUpdate: new Date().toISOString()
    });
    
    console.log(`Location updated: ${lat}, ${lng}`);
  } catch (error) {
    console.error("Error updating location:", error);
  }
};


export const addImageToGallery = async (userId: string, imageUrl: string) => {
  try {
    const userRef = doc(db, "users", userId);
    

    await updateDoc(userRef, {
      gallery: arrayUnion(imageUrl) 
    });
    console.log("Image added to Firestore gallery");
  } catch (error) {
    console.error("Error updating gallery:", error);
    throw error;
  }
};


export const updateUserProfileData = async (userId: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, data);
    console.log("Profile data updated:", data);
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};