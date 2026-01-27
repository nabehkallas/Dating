// src/components/LanguageModal.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  I18nManager,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguageModal = ({ visible, onClose }: LanguageModalProps) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = async (lang: 'en' | 'ar') => {
    
    if (i18n.language === lang) {
      onClose();
      return;
    }

   
    await AsyncStorage.setItem('user-language', lang);

    
    await i18n.changeLanguage(lang);

    
    const isArabic = lang === 'ar';
    const isCurrentlyRTL = I18nManager.isRTL;

    
    if (isArabic !== isCurrentlyRTL) {
      I18nManager.allowRTL(isArabic);
      I18nManager.forceRTL(isArabic);

      try {
        await Updates.reloadAsync();
      } catch (e) {
        Alert.alert(
          t('Restart Required'),
          t('Please restart the app to apply the new language layout.')
        );
      }
    } else {
    
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{t('change_lang')}</Text>

    
          <TouchableOpacity 
            style={[styles.option, i18n.language === 'en' && styles.selectedOption]} 
            onPress={() => handleLanguageChange('en')}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 24, marginRight: 10}}>🇺🇸</Text>
                <Text style={[styles.optionText, i18n.language === 'en' && styles.selectedText]}>
                English
                </Text>
            </View>
            {i18n.language === 'en' && <Ionicons name="checkmark-circle" size={24} color="#fe3c72" />}
          </TouchableOpacity>

    
          <TouchableOpacity 
            style={[styles.option, i18n.language === 'ar' && styles.selectedOption]} 
            onPress={() => handleLanguageChange('ar')}
          >
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 24, marginRight: 10}}>🇸🇦</Text>
                <Text style={[styles.optionText, i18n.language === 'ar' && styles.selectedText]}>
                العربية
                </Text>
            </View>
            {i18n.language === 'ar' && <Ionicons name="checkmark-circle" size={24} color="#fe3c72" />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>{t('Cancel')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#fff0f3', // Light pink
    borderColor: '#fe3c72',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedText: {
    color: '#fe3c72',
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});