export interface Swipe {
  direction: 'left' | 'right' | 'superlike';
  swipedBy: string; 
  swipedOn: string; 
  timestamp: number;
}

export const mockSwipes: Swipe[] = [
  { direction: 'right', swipedBy: 'uid1', swipedOn: 'uid2', timestamp: Date.now() - 100000 },
  { direction: 'left', swipedBy: 'uid1', swipedOn: 'uid3', timestamp: Date.now() - 200000 },
  { direction: 'right', swipedBy: 'uid2', swipedOn: 'uid1', timestamp: Date.now() - 150000 },
  { direction: 'superlike', swipedBy: 'uid2', swipedOn: 'uid5', timestamp: Date.now() - 250000 },
];
