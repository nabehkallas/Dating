import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newBio: string) => Promise<void>;
  initialBio?: string;
}

export const EditProfileModal = ({ visible, onClose, onSave, initialBio }: EditProfileModalProps) => {
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  
  useEffect(() => {
    if (visible) {
      setBio(initialBio || '');
    }
  }, [visible, initialBio]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(bio);
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          
          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people about yourself..."
            placeholderTextColor="#999"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, {backgroundColor: '#eee'}]} 
              onPress={onClose}
              disabled={saving}
            >
              <Text style={{color: '#333'}}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalButton, {backgroundColor: '#fe3c72'}]} 
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{color: '#fff', fontWeight: 'bold'}}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '600' },
  textInput: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, height: 100, textAlignVertical: 'top', fontSize: 16, marginBottom: 20, color: '#000' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  modalButton: { flex: 1, padding: 15, borderRadius: 30, alignItems: 'center' }
});