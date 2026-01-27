import { UserPreferences } from '@/services/ProfileService';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: UserPreferences) => void;
  initialValues?: UserPreferences | null;
}

export const FilterModal = ({ visible, onClose, onApply, initialValues }: FilterModalProps) => {
  
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(35);
  const [maxDistance, setMaxDistance] = useState(50);
  const { t } = useTranslation();
  
  const [showMen, setShowMen] = useState(false);
  const [showWomen, setShowWomen] = useState(true);

  
  useEffect(() => {
    if (initialValues) {
      setMinAge(initialValues.minAge || 18);
      setMaxAge(initialValues.maxAge || 35);
      setMaxDistance(initialValues.maxDistance || 50);

    
      if (initialValues.genderInterest === 'male') {
        setShowMen(true); setShowWomen(false);
      } else if (initialValues.genderInterest === 'female') {
        setShowMen(false); setShowWomen(true);
      } else {
        setShowMen(true); setShowWomen(true);
      }
    }
  }, [initialValues, visible]);

  const handleApply = () => {
    
    let genderInterest: 'male' | 'female' | 'everyone' = 'everyone';
    if (showMen && !showWomen) genderInterest = 'male';
    if (!showMen && showWomen) genderInterest = 'female';

    onApply({
      minAge,
      maxAge,
      maxDistance,
      genderInterest
    });
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          
          
          <View style={styles.header}>
            <Text style={styles.title}>{t("Discovery Settings")}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color="#333" />
            </TouchableOpacity>
          </View>

          
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t('Maximum Distance')}</Text>
              <Text style={styles.value}>{maxDistance}km</Text>
            </View>
            <Slider
              style={{width: '100%', height: 40}}
              minimumValue={5}
              maximumValue={100}
              step={1}
              value={maxDistance}
              onValueChange={setMaxDistance}
              minimumTrackTintColor="#fe3c72"
              thumbTintColor="#fe3c72"
            />
          </View>

          
          <View style={styles.section}>
             <View style={styles.labelRow}>
              <Text style={styles.label}>{t('Age Range')}</Text>
              <Text style={styles.value}>{(minAge)} - {maxAge}</Text>
            </View>
            
            <Text style={styles.subLabel}>{t('Min Age')}</Text>
            <Slider
              style={{width: '100%', height: 30}}
              minimumValue={18} maximumValue={50} step={1}
              value={minAge} onValueChange={val => setMinAge(Math.min(val, maxAge))}
              minimumTrackTintColor="#ccc" thumbTintColor="#999"
            />
            
            <Text style={styles.subLabel}>{t('Max Age')}</Text>
            <Slider
              style={{width: '100%', height: 30}}
              minimumValue={18} maximumValue={60} step={1}
              value={maxAge} onValueChange={val => setMaxAge(Math.max(val, minAge))}
              minimumTrackTintColor="#fe3c72" thumbTintColor="#fe3c72"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t('Show Me')}</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>{t('Women')}</Text>
              <Switch 
                value={showWomen} 
                onValueChange={setShowWomen} 
                trackColor={{false: "#767577", true: "#fe3c72"}}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>{t('Men')}</Text>
              <Switch 
                value={showMen} 
                onValueChange={setShowMen} 
                trackColor={{false: "#767577", true: "#fe3c72"}}
              />
            </View>
          </View>

          
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyText}>{t('Apply Filters')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalView: { backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, height: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: '#000' },
  section: { marginBottom: 25 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 16, fontWeight: '600', color: '#333' },
  subLabel: { fontSize: 12, color: '#999', marginTop: 5 },
  value: { fontSize: 16, color: '#fe3c72', fontWeight: 'bold' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  switchText: { fontSize: 16, color: '#555' },
  applyButton: { backgroundColor: "#fe3c72", borderRadius: 30, padding: 18, alignItems: "center", marginTop: 20 },
  applyText: { color: "white", fontWeight: "bold", fontSize: 18 }
});