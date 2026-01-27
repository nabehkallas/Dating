
export interface Preferences {
  distance: number; // in km
  maxAge: number;
  minAge: number;
  gender: 'male' | 'female' | 'other' | 'all';
}

export interface User {
  
  uid: string;
  name: string;
  age: number;
  bio: string;
  avatar: string;
  gallery: string[];
  location: { latitude: number; longitude: number } | number[] | string;
  
  gender: 'male' | 'female' | 'other';
  isVerified?: boolean;
  fcmTokens?: string[];
  BlockedUserIds?: string[];
  preferences?: Preferences | (string | number)[]; 
}
export interface FeedUser extends User {
  distance_km?: number; 
}

export const mockUsers: User[] = [
  {
    
    uid: 'uid1',
    name: 'Sarah',
    age: 24,
    bio: 'Hiker & Coffee lover',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
    gallery: ['https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80'],
    location: { latitude: 40.7128, longitude: -74.0060 },
    gender: 'female',
    isVerified: true,
    fcmTokens: ['token1'],
    preferences: {
      distance: 50,
      maxAge: 30,
      minAge: 20,
      gender: 'male',
    },
  },
  {
    
    uid: 'uid2',
    name: 'John',
    age: 28,
    bio: 'Software Engineer & Gamer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
    gallery: ['https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80'],
    location: 'San Francisco',
    gender: 'male',
    isVerified: false,
    fcmTokens: ['token2'],
    preferences: {
      distance: 100,
      maxAge: 35,
      minAge: 25,
      gender: 'female',
    },
  },
  {
    
    uid: 'uid3',
    name: 'Emily',
    age: 22,
    bio: 'Artist & Cat enthusiast',
    avatar: 'https://via.placeholder.com/400/3357FF/FFFFFF?text=Emily',
    gallery: ['https://via.placeholder.com/400/3357FF/FFFFFF?text=Emily1', 'https://via.placeholder.com/400/3357FF/FFFFFF?text=Emily2'],
    location: { latitude: 34.0522, longitude: -118.2437 },
    gender: 'female',
    isVerified: true,
    fcmTokens: ['token3'],
    preferences: {
      distance: 25,
      maxAge: 28,
      minAge: 20,
      gender: 'all',
    },
  },
  {
    
    uid: 'uid4',
    name: 'Michael',
    age: 30,
    bio: 'Chef & Foodie',
    avatar: 'https://via.placeholder.com/400/FF33A1/FFFFFF?text=Michael',
    gallery: ['https://via.placeholder.com/400/FF33A1/FFFFFF?text=Michael1', 'https://via.placeholder.com/400/FF33A1/FFFFFF?text=Michael2'],
    location: 'Chicago',
    gender: 'male',
    isVerified: true,
    fcmTokens: ['token4'],
    preferences: {
      distance: 75,
      maxAge: 40,
      minAge: 28,
      gender: 'female',
    },
  },
  {
    
    uid: 'uid5',
    name: 'Jessica',
    age: 26,
    bio: 'Traveler & Photographer',
    avatar: 'https://via.placeholder.com/400/A133FF/FFFFFF?text=Jessica',
    gallery: ['https://via.placeholder.com/400/A133FF/FFFFFF?text=Jessica1', 'https://via.placeholder.com/400/A133FF/FFFFFF?text=Jessica2'],
    location: { latitude: 25.7617, longitude: -80.1918 },
    gender: 'female',
    isVerified: false,
    fcmTokens: ['token5'],
    preferences: {
      distance: 60,
      maxAge: 32,
      minAge: 24,
      gender: 'male',
    },
  },
];
