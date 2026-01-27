import { PendingLike } from '@/services/MatchService';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_SPACING = 15;
const CARD_WIDTH = (width - (CARD_SPACING * 3)) / 2;

interface MatchCardProps {
  item: PendingLike;
  onResponse: (user: PendingLike, action: 'accept' | 'reject') => void;
  isPlaceholder?: boolean; 
}

export default function MatchCard({ item, onResponse, isPlaceholder }: MatchCardProps) {
  const router = useRouter();

  if (isPlaceholder) {
    return <View style={[styles.card, { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }]} />;
  }


  const openProfile = () => {
    router.push({
      pathname: '/public_profile',
      params: { userId: item.id }
    });
  };

  return (
    <View style={styles.card}>
      

      <TouchableOpacity 
        style={styles.clickableArea} 
        onPress={openProfile} 
        activeOpacity={0.9}
      >

        <Image 
          source={{ uri: item.avatar || 'https://placehold.co/200/png' }} 
          style={[styles.image, item.isPrivate && styles.blurImage]} 
          blurRadius={item.isPrivate ? 20 : 0}
        />
        
        {/* PRIVATE LOCK OVERLAY */}
        {item.isPrivate && (
          <View style={styles.privateOverlay}>
            <Text style={{fontSize: 24}}>🔒</Text>
          </View>
        )}

        {/* TEXT INFO */}
        <View style={styles.textOverlay}>
          <Text style={styles.nameText}>
            {item.name}, {item.age}
          </Text>
          {item.type === 'super' && (
             <Text style={styles.superText}>★ Super Like</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* 5. ACTION BAR (Accept/Reject) - Separate from clickable area */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onResponse(item, 'reject')}>
          <Text style={[styles.actionIcon, { color: '#ff6b6b' }]}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.actionBtn} onPress={() => onResponse(item, 'accept')}>
          <Text style={[styles.actionIcon, { color: '#4ecdc4' }]}>♥️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 250,
    borderRadius: 15,
    backgroundColor: '#222', 
    overflow: 'hidden',
    position: 'relative',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 5
  },
  
  clickableArea: {
    flex: 1, 
    marginBottom: 50,
    position: 'relative'
  },
  image: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover',
    position: 'absolute',
    top: 0, left: 0 
  },
  blurImage: { opacity: 0.6 },
  privateOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  
  textOverlay: { 
    position: 'absolute', 
    bottom: 10, 
    left: 10, 
    right: 10, 
    zIndex: 2 
  },
  nameText: {
    color: 'white', fontSize: 18, fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10
  },
  superText: {
    color: '#FFD700', fontSize: 12, fontWeight: 'bold', marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 2
  },

  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)'
  },
  actionBtn: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center' },
  actionIcon: { fontSize: 24, fontWeight: 'bold' },
  divider: { width: 1, height: '60%', backgroundColor: 'rgba(255,255,255,0.2)' }
});