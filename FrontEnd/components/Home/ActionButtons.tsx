import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActionButtonsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeTop: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeTop 
}) => {
  return (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity style={[styles.button, styles.buttonSmall]} onPress={onSwipeLeft}>
        <Text style={[styles.buttonIcon, { color: '#E5566D' }]}>✕</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonLarge]} onPress={onSwipeRight}>
        <Text style={[styles.buttonIcon, { color: 'white', fontSize: 32 }]}>♥</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonSmall]} onPress={onSwipeTop}>
        <Text style={[styles.buttonIcon, { color: '#8A2BE2' }]}>★</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    zIndex: 999,
    elevation: 999,
  },
  button: {
    backgroundColor: 'white',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
  },
  buttonSmall: { width: 60, height: 60, borderRadius: 30 },
  buttonLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fe3c72', marginBottom: 10 },
  buttonIcon: { fontSize: 24, fontWeight: 'bold' }
});