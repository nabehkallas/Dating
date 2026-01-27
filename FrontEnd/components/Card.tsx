import { FeedUser } from '@/constants/Users';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface CardProps {
  user: FeedUser;
}

const Card: React.FC<CardProps> = ({ user }) => {
  const displayLocation = typeof user.location === 'string' 
    ? user.location 
    : (user.location && 'latitude' in user.location) 
      ? `Lat: ${user.location.latitude.toFixed(2)}, Lon: ${user.location.longitude.toFixed(2)}`
      : 'Unknown Location';

  const distance = user.distance_km ? `${user.distance_km.toFixed(1)} km away` : '';

  return (
    <View style={styles.card}>
      <Image source={{ uri: user.avatar }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{user.name}, {user.age}</Text>
        <Text style={styles.bio}>{user.bio}</Text>
        <View style={styles.footer}>
          <Text style={styles.location}>{displayLocation}</Text>
          {user.distance_km !== undefined && <Text style={styles.distance}>{distance}</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    margin: 20,
    width: '90%',
    aspectRatio: 0.7, 
  },
  image: {
    width: '100%',
    height: '75%', 
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  infoContainer: {
    padding: 15,
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bio: {
    fontSize: 16,
    color: '#555',
    flexShrink: 1, 
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#888',
  },
  distance: {
    fontSize: 14,
    color: '#888',
    fontWeight: 'bold',
  },
});

export default Card;
