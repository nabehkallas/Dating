import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.line} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  sectionTitle: { fontSize: 14, color: '#999', marginHorizontal: 10, fontWeight: '600' },
  line: { flex: 1, height: 1, backgroundColor: '#eee' },
});