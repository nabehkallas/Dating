import { fetchProfile, UserProfile } from '@/services/ProfileService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

//
interface GalleryViewerModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

const GalleryViewerModal = ({ visible, imageUrl, onClose }: GalleryViewerModalProps) => {
  if (!imageUrl) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.fullScreenModal}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={30} color="#fff" />
        </TouchableOpacity>
        
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.fullScreenImage} 
          resizeMode="contain" 
        />
      </View>
    </Modal>
  );
};


export default function PublicProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams(); 

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadProfile(userId as string);
    }
  }, [userId]);

  const loadProfile = async (id: string) => {
    try {
      const data = await fetchProfile(id);
      setProfile(data);
    } catch (error) {
      console.error("Error loading public profile:", error);
    } finally {
      setLoading(false);
    }
  };

  
  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fe3c72" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#fff' }}>User not found.</Text>
        <TouchableOpacity onPress={handleClose} style={{ marginTop: 20 }}>
          <Text style={{ color: '#fe3c72', fontSize: 18 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  
  const displayAvatar =  profile.avatar || 'https://placehold.co/400/png';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
  
        <View style={styles.imageHeaderContainer}>
            <Image source={{ uri: displayAvatar }} style={styles.headerImage} />
            <LinearGradientOverlay />
            
  
            <TouchableOpacity onPress={handleClose} style={styles.backButton}>
                <Ionicons name="chevron-down" size={32} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
                <Text style={styles.nameText}>
                    {profile.name}, {profile.age}
                </Text>
                {profile.gender && (
                     <Text style={styles.subText}>{profile.gender.toUpperCase()}</Text>
                )}
            </View>
        </View>

  
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>
            {profile.bio || "No bio available."}
          </Text>
        </View>

  
        {profile.gallery && profile.gallery.length > 0 && (
          <View style={styles.section}>
             <Text style={styles.sectionTitle}>Gallery</Text>
             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
               {profile.gallery.map((imgUrl, index) => (
                 <TouchableOpacity key={index} onPress={() => setSelectedImage(imgUrl)}>
                   <Image source={{ uri: imgUrl }} style={styles.galleryThumb} />
                 </TouchableOpacity>
               ))}
             </ScrollView>
          </View>
        )}

  
        <View style={{ height: 100 }} />

      </ScrollView>

  
      <GalleryViewerModal 
        visible={selectedImage !== null}
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </View>
  );
}


const LinearGradientOverlay = () => (
    <View style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 100,
        backgroundColor: 'rgba(0,0,0,0.3)', 
        zIndex: 1
    }} />
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, 
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 0 },
  
  
  imageHeaderContainer: { height: 400, position: 'relative' },
  headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  backButton: { 
      position: 'absolute', top: 50, right: 20, zIndex: 10, 
      backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 5 
  },
  headerTextContainer: { 
      position: 'absolute', bottom: 20, left: 20, zIndex: 2 
  },
  nameText: { fontSize: 32, fontWeight: 'bold', color: 'white', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 },
  subText: { fontSize: 16, color: '#eee', fontWeight: '600', marginTop: 5 },

  
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  bioText: { fontSize: 16, color: '#555', lineHeight: 24 },
  
  galleryThumb: { width: 100, height: 100, borderRadius: 10, marginRight: 10, backgroundColor: '#eee' },

  
  fullScreenModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  fullScreenImage: { width: '100%', height: '80%' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 999, padding: 10 }
});