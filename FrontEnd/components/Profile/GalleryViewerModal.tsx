import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface GalleryViewerModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export const GalleryViewerModal = ({ visible, imageUrl, onClose }: GalleryViewerModalProps) => {
  if (!imageUrl) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.fullScreenModal}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
        >
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

const styles = StyleSheet.create({
  fullScreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullScreenImage: {
    width: '100%',
    height: '80%'
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 999,
    padding: 10
  }
});