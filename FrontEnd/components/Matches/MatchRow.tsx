// components/Matches/MatchRow.tsx
import { PendingLike } from '@/services/MatchService';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import MatchCard from './MatchCard';

interface MatchRowProps {
  items: PendingLike[];
  onResponse: (user: PendingLike, action: 'accept' | 'reject') => void;
}

export default function MatchRow({ items, onResponse }: MatchRowProps) {
  return (
    <View style={styles.rowContainer}>
      {items.map(like => (
        <MatchCard key={like.id} item={like} onResponse={onResponse} />
      ))}
      
      
      {items.length === 1 && (
        <MatchCard 
          key="placeholder" 
          isPlaceholder 
          item={{} as PendingLike} 
          onResponse={() => {}} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
});