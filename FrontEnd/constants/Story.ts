export interface Story {
  id: string;
  userId: string;
  imageUrl: string; // The content of the story
  timeAgo: string;  
  viewers?: string[];

  userAvatar?: string; 
  userName?: string;
}