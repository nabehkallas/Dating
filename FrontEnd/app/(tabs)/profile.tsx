import { useAuth } from '@/context/AuthContext';
import { logoutUser } from '@/services/AuthService';
import { pickImage, uploadImageToCloudinary } from '@/services/ImageService';
import {
  addImageToGallery,
  fetchProfile,
  updateUserProfileData,
  UserProfile
} from '@/services/ProfileService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { LanguageModal } from '@/components/LanguageModal';
import { EditProfileModal } from '@/components/Profile/EditProfileModal';
import { GalleryViewerModal } from '@/components/Profile/GalleryViewerModal';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { t } = useTranslation(); 
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false); 
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
        const data = await fetchProfile(user.uid);
        setProfile(data);
    } catch (error) {
        console.error("Error loading profile:", error);
    } finally {
        setLoading(false);
    }
  };

  
  const handleMediaAction = async (type: 'avatar' | 'gallery') => {
    if (!user || !profile) return;
    try {
      const uri = await pickImage();
      if (!uri) return;

      setUploading(true);
      const cloudUrl = await uploadImageToCloudinary(uri);
      
      if (!cloudUrl) {
        Alert.alert(t("Error"), t("Upload failed."));
        setUploading(false);
        return;
      }

      if (type === 'avatar') {
        await updateUserProfileData(user.uid, { avatar: cloudUrl });
        setProfile({ ...profile, avatar: cloudUrl });
      } else {
        await addImageToGallery(user.uid, cloudUrl);
        const newGallery = [...(profile.gallery || []), cloudUrl];
        setProfile({ ...profile, gallery: newGallery });
      }
      Alert.alert(t("Success"), t("Updated successfully!"));
    } catch (error) {
      Alert.alert(t("Error"), t("Something went wrong."));
    } finally {
      setUploading(false);
    }
  };

  
  const handleSaveBio = async (newBio: string) => {
    if (!user || !profile) return;
    try {
      await updateUserProfileData(user.uid, { bio: newBio });
      setProfile({ ...profile, bio: newBio });
    } catch (error) {
      Alert.alert(t("Error"), t("Could not save bio."));
    }
  };

  
  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: 'destructive', onPress: logoutUser }
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#fe3c72" /></View>;
  if (!profile) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: profile.avatar || 'https://via.placeholder.com/400' }} 
              style={styles.avatar} 
            />
            {profile.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
            <TouchableOpacity style={styles.editIcon} onPress={() => handleMediaAction('avatar')}>
              <Ionicons name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.name}>{profile.name}, {profile.age}</Text>
          <Text style={styles.subtext}>{profile.gender?.toUpperCase()}</Text>
        </View>

        
        <View style={styles.statsContainer}>
        
          <TouchableOpacity 
            style={styles.statButton} 
            onPress={() => setLanguageModalVisible(true)} >
            <View style={styles.iconCircle}>
              
              <Ionicons name="globe-outline" size={24} color="#999" />
            </View>
            <Text style={styles.statLabel}>{t('change_lang')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statButtonMain} onPress={() => handleMediaAction('gallery')}>
            <View style={styles.iconCircleMain}>
              <Ionicons name="camera" size={30} color="#fff" />
            </View>
            <Text style={styles.statLabelMain}>{t('ADD MEDIA')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statButton} onPress={() => setEditModalVisible(true)}>
            <View style={styles.iconCircle}>
              <Ionicons name="pencil" size={24} color="#999" />
            </View>
            <Text style={styles.statLabel}>{t('EDIT INFO')}</Text>
          </TouchableOpacity>
        </View>

        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('About Me')}</Text>
          <Text style={styles.bioText}>{profile.bio || t("No bio yet.")}</Text>
        </View>

        
        <View style={styles.section}>
           <Text style={styles.sectionTitle}>{t('Gallery')}</Text>
           {profile.gallery && profile.gallery.length > 0 ? (
             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
               {profile.gallery.map((imgUrl, index) => (
                 <TouchableOpacity key={index} onPress={() => setSelectedImage(imgUrl)}>
                   <Image source={{ uri: imgUrl }} style={styles.galleryImage} />
                 </TouchableOpacity>
               ))}
             </ScrollView>
           ) : (
             <Text style={styles.emptyText}>{t('No photos yet.')}</Text>
           )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('Logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} /> 
      </ScrollView>

      
      {uploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{color: 'white', marginTop: 10}}>{t('Uploading...')}</Text>
        </View>
      )}

      
      
      <EditProfileModal 
        visible={editModalVisible} 
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveBio}
        initialBio={profile.bio}
      />

      <GalleryViewerModal 
        visible={selectedImage !== null}
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      
      <LanguageModal 
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  scrollContent: { paddingBottom: 20 },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { width: 150, height: 150, borderRadius: 75, borderWidth: 4, borderColor: '#fff' },
  verifiedBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#20D3E5', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', zIndex: 2 },
  editIcon: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#fe3c72', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  name: { fontSize: 26, fontWeight: 'bold', color: '#000' },
  subtext: { fontSize: 14, color: '#999', marginTop: 5, letterSpacing: 1 },
  statsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 30 },
  statButton: { alignItems: 'center', marginHorizontal: 15 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, marginBottom: 8 },
  statLabel: { fontSize: 12, fontWeight: 'bold', color: '#999' },
  statButtonMain: { alignItems: 'center', marginHorizontal: 15, marginBottom: 5 },
  iconCircleMain: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fe3c72', justifyContent: 'center', alignItems: 'center', shadowColor: '#fe3c72', shadowOpacity: 0.4, shadowRadius: 8, elevation: 5, marginBottom: 8 },
  statLabelMain: { fontSize: 12, fontWeight: 'bold', color: '#fe3c72' },
  section: { backgroundColor: '#fff', padding: 20, marginHorizontal: 20, borderRadius: 15, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  bioText: { fontSize: 15, color: '#555', lineHeight: 22 },
  galleryImage: { width: 100, height: 100, borderRadius: 10, marginRight: 10, backgroundColor: '#eee' },
  emptyText: { color: '#999', fontStyle: 'italic' },
  logoutButton: { marginHorizontal: 20, backgroundColor: '#fff', paddingVertical: 15, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  logoutText: { color: '#fe3c72', fontSize: 16, fontWeight: '600' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
});