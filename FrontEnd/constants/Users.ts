
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


