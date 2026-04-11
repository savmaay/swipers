import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const INTERESTS = [
  { id: '1',  label: 'Technology',   emoji: '💻' },
  { id: '2',  label: 'Art & Design', emoji: '🎨' },
  { id: '3',  label: 'Music',        emoji: '🎵' },
  { id: '4',  label: 'Sports',       emoji: '⚽' },
  { id: '5',  label: 'Science',      emoji: '🔬' },
  { id: '6',  label: 'Gaming',       emoji: '🎮' },
  { id: '7',  label: 'Food & Cooking', emoji: '🍕' },
  { id: '8',  label: 'Photography',   emoji: '📸' },
  { id: '9',  label: 'Film & TV',      emoji: '🎬' },
  { id: '10', label: 'Literature',   emoji: '📚' },
  { id: '11', label: 'Fitness',      emoji: '💪' },
  { id: '12', label: 'Travel',       emoji: '✈️' },
  { id: '13', label: 'Business',     emoji: '💼' },
  { id: '14', label: 'Environment',  emoji: '🌿' },
  { id: '15', label: 'Fashion',      emoji: '👗' },
  { id: '16', label: 'Politics',     emoji: '🗳️' },
  { id: '17', label: 'Health',       emoji: '🏥' },
  { id: '18', label: 'Engineering',  emoji: '⚙️' },
  { id: '19', label: 'Dance',        emoji: '💃' },
  { id: '20', label: 'Community',    emoji: '🤝' },
  { id: '21', label: 'Language',     emoji: '🌍' },
  { id: '22', label: 'Entrepreneurship', emoji: '🚀' },
  { id: '23', label: 'Psychology',       emoji: '🧠' },
];

export default function SelectInterestsScreen() {
  const params = useLocalSearchParams();
  
  const initialSelected = params.selected ? JSON.parse(params.selected as string) : [];
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);

  const toggleInterest = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

const handleSave = () => {
  if (params.onboardingParam) {
    const originalData = JSON.parse(params.onboardingParam as string);
    const selectedLabels = INTERESTS.filter(i => selectedIds.includes(i.id)).map(i => i.label);

    router.replace({
      pathname: '/admin-onboarding/edit-demo-card', 
      params: { 
        ...originalData,
        updatedInterests: JSON.stringify(selectedLabels),
        onboardingParam: params.onboardingParam 
      }
    });
  } else {
    router.replace({
      pathname: '/(admin-tabs)/edit-events',
      params: { 
        updatedInterests: JSON.stringify(selectedIds),
        eventParam: params.eventParam 
      }
    });
  }
};

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7BAED4', '#9BBDE0', '#C5D4F5']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Interests</Text>
        <Text style={styles.subtitle}>What categories fit this event?</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {INTERESTS.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.chip, isSelected && styles.chipSelected]} 
              onPress={() => toggleInterest(item.id)}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Confirm Selection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: SCREEN_HEIGHT * 0.08, paddingHorizontal: 24, marginBottom: 20 },
  title: { fontFamily: FONTS.heading, fontSize: 32, color: COLORS.dustyTangerine, textAlign: 'center' },
  subtitle: { fontFamily: FONTS.body, fontSize: 16, color: COLORS.deepNavy, textAlign: 'center', opacity: 0.8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 16, gap: 10, paddingBottom: 120 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'transparent' },
  chipSelected: { backgroundColor: COLORS.mutedSapphire, borderColor: COLORS.ghostBlue },
  emoji: { fontSize: 18, marginRight: 6 },
  label: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.deepNavy },
  labelSelected: { color: '#fff' },
  footer: { position: 'absolute', bottom: 40, left: 0, right: 0, paddingHorizontal: 30 },
  saveButton: { backgroundColor: COLORS.dustyTangerine, borderRadius: 15, paddingVertical: 16, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  saveButtonText: { fontFamily: FONTS.heading, fontSize: 18, color: '#fff' },
});