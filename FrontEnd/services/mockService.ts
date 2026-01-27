import { mockUsers, User } from '@/constants/Users';
import { mockMatches, Match } from '@/constants/Matches';

export const fetchMockUsers = (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUsers);
    }, 500); // Simulate network delay
  });
};

export const fetchMockMatches = (): Promise<Match[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMatches);
    }, 700); // Simulate network delay
  });
};
