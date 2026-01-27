import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HomeHeaderProps {
  title?: string;
  subtitle?: string;
  onFilterPress?: () => void;
  onAddPress?: () => void; 
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ 
  title = "Discover", 
  subtitle = "Nearby",
  onFilterPress,
  onAddPress 
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.header}>
      
      <TouchableOpacity 
        style={styles.headerIconSmall} 
        onPress={onAddPress}
      >
        <Ionicons name="add-sharp" size={30} color="#fe3c72" />
      </TouchableOpacity>
      
      
      <View>
        <Text style={styles.headerTitle}>{t('title')}</Text>
        <Text style={styles.headerSubtitle}>{t('subtitle')}</Text>
      </View>
      
      
      <TouchableOpacity onPress={onFilterPress} style={styles.headerIconSmall}>
        <Ionicons name="options" size={24} color="#fe3c72" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 10,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#000' 
  },
  headerSubtitle: { 
    fontSize: 12, 
    color: '#888', 
    textAlign: 'center' 
  },
  headerIconSmall: {
    width: 44, 
    height: 44, 
    backgroundColor: 'white', 
    borderRadius: 12,
    justifyContent: 'center', 
    alignItems: 'center',
    // Shadow for depth
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3,
  },
});