import { FeedUser } from '@/constants/Users';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';
const { height } = Dimensions.get('window');

interface Props {
  data: FeedUser[];
  onSwipeLeft: (index: number) => void;
  onSwipeRight: (index: number) => void;
  onSwipeTop: (index: number) => void;
}

export const SwipeFeed = forwardRef<Swiper<FeedUser>, Props>(({ data, onSwipeLeft, onSwipeRight, onSwipeTop }, ref) => {
  const router = useRouter();
const { t } = useTranslation();
  const openProfile = (userId: string) => {
    if (!userId) {
        console.error("No User ID found for profile navigation");
        return;
    }
    router.push({ pathname: '/public_profile', params: { userId } });
  };

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{color: '#888'}}>No more profiles to show.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Swiper
        ref={ref}
        cards={data}
        cardIndex={0}
        
        onTapCard={(index) => {
            const user = data[index];
            if (user && user.uid) {
                openProfile(user.uid);
            }
        }}

        renderCard={(card) => {
          if (!card) return <View style={styles.card} />; 
          
          return (
            <View style={styles.card}>
              <Image source={{ uri:  card.avatar }} style={styles.image} />
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
              >
        
                <TouchableOpacity onPress={() => openProfile(card.uid)} activeOpacity={0.8}>
                  <View style={styles.row}>
                    <Text style={styles.name}>{card.name}, {card.age}</Text>
                    <Ionicons name="information-circle" size={28} color="#fff" style={{ marginLeft: 8 }} />
                  </View>
                  
                  <Text style={styles.location}>
                    <Ionicons name="location-sharp" size={14} color="#fff" /> 
                    {card.distance_km ? ` ${Math.round(card.distance_km)} km away` : t('Nearby')}
                  </Text>
                  
                  {card.bio ? (
                    <Text style={styles.bio} numberOfLines={2}>{card.bio}</Text>
                  ) : null}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          );
        }}
        onSwipedLeft={onSwipeLeft}
        onSwipedRight={onSwipeRight}
        onSwipedTop={onSwipeTop}
        stackSize={3}
        backgroundColor={'transparent'}
        cardVerticalMargin={20}
        cardHorizontalMargin={15}
        containerStyle={{ flex: 1 }}
        animateCardOpacity
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    marginTop: 0 
  },
  card: {
    height: height * 0.58, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: 'white',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  image: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingBottom: 25,
    justifyContent: 'flex-end'
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 26, color: 'white', fontWeight: 'bold' },
  location: { fontSize: 14, color: 'white', marginTop: 4, fontWeight: '500' },
  bio: { fontSize: 13, color: '#eee', marginTop: 6 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});