import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';
import AdminTabBar from './AdminTabBar';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const INTERESTS = [
  { id: '1',  label: 'Technology',       emoji: '💻' },
  { id: '2',  label: 'Art & Design',     emoji: '🎨' },
  { id: '3',  label: 'Music',            emoji: '🎵' },
  { id: '4',  label: 'Sports',           emoji: '⚽' },
  { id: '5',  label: 'Science',          emoji: '🔬' },
  { id: '6',  label: 'Gaming',           emoji: '🎮' },
  { id: '7',  label: 'Food & Cooking',   emoji: '🍕' },
  { id: '8',  label: 'Photography',      emoji: '📸' },
  { id: '9',  label: 'Film & TV',        emoji: '🎬' },
  { id: '10', label: 'Literature',       emoji: '📚' },
  { id: '11', label: 'Fitness',          emoji: '💪' },
  { id: '12', label: 'Travel',           emoji: '✈️' },
  { id: '13', label: 'Business',         emoji: '💼' },
  { id: '14', label: 'Environment',      emoji: '🌿' },
  { id: '15', label: 'Fashion',          emoji: '👗' },
  { id: '16', label: 'Politics',         emoji: '🗳️' },
  { id: '17', label: 'Health',           emoji: '🏥' },
  { id: '18', label: 'Engineering',      emoji: '⚙️' },
  { id: '19', label: 'Dance',            emoji: '💃' },
  { id: '20', label: 'Community',        emoji: '🤝' },
  { id: '21', label: 'Language',         emoji: '🌍' },
  { id: '22', label: 'Entrepreneurship', emoji: '🚀' },
  { id: '23', label: 'Psychology',       emoji: '🧠' },
];

export default function EditEventsScreen() {
  const params = useLocalSearchParams();
  const fontsLoaded = useAppFonts();
  const initialEvent = params.eventParam ? JSON.parse(params.eventParam as string) : null;

  const [title, setTitle]         = useState(initialEvent?.title || '');
  const [date, setDate]           = useState(initialEvent?.date || '');
  const [time, setTime]           = useState(initialEvent?.time || '');
  const [location, setLocation]   = useState(initialEvent?.location || '');
  const [desc, setDesc]           = useState(initialEvent?.description || '');
  const [interests, setInterests] = useState<string[]>(initialEvent?.interests || []);

  useEffect(() => {
    if (params.updatedInterests) {
      const selectedIds = JSON.parse(params.updatedInterests as string);
      const newLabels = INTERESTS.filter(i => selectedIds.includes(i.id)).map(i => i.label);
      setInterests(newLabels);
    }
  }, [params.updatedInterests]);

  const handleSave = () => {
    const updated = { ...initialEvent, title, date, time, location, description: desc, interests };
    router.replace({
      pathname: '/(admin-tabs)/current-events',
      params: { updatedEvent: JSON.stringify(updated) },
    });
  };

  // Shows confirmation alert before deleting
  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: DELETE to API
            // fetch(`${API_BASE_URL}/api/events/${initialEvent.id}`, {
            //   method: 'DELETE',
            //   headers: { 'x-auth-token': token },
            // });
            // Pass deletedId back so current-events can remove it from the list
            router.replace({
              pathname: '/(admin-tabs)/current-events',
              params: { deletedId: initialEvent.id },
            });
          },
        },
      ]
    );
  };

  const goToInterests = () => {
    const currentState = JSON.stringify({
      ...initialEvent,
      title, date, time, location, description: desc, interests,
    });
    router.push({
      pathname: '/admin-onboarding/select-interests',
      params: {
        selected: JSON.stringify(INTERESTS.filter(i => interests.includes(i.label)).map(i => i.id)),
        eventParam: currentState,
      },
    });
  };

  if (!fontsLoaded || !initialEvent) return null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7BAED4', '#9BBDE0', '#C5D4F5']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.editScroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Edit Event</Text>

          <View style={styles.editCard}>
            <Text style={styles.editClubName}>{initialEvent.club}</Text>

            <Text style={styles.fieldLabel}>Name of Event</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />

            <View style={styles.rowFields}>
              <View style={{ flex: 1.4, marginRight: 10 }}>
                <Text style={styles.fieldLabel}>Date</Text>
                <TextInput style={styles.input} value={date} onChangeText={setDate} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Time</Text>
                <TextInput style={styles.input} value={time} onChangeText={setTime} />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Location</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={desc}
              onChangeText={setDesc}
              multiline
            />

            <Text style={styles.fieldLabel}>Interests</Text>
            <TouchableOpacity style={styles.interestPickerButton} onPress={goToInterests}>
              <Text style={styles.interestPickerText}>
                Select Interests ({interests.length})
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.deepNavy} />
            </TouchableOpacity>
            <Text style={styles.interestPreviewText}>{interests.join(', ')}</Text>

            {/* Save */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Edits</Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            {/* Delete — triggers confirmation alert */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteButtonText}> Delete Event</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <AdminTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontFamily: FONTS.heading, fontSize: 39,
    color: COLORS.dustyTangerine, textDecorationLine: 'underline',
    textAlign: 'center', marginBottom: 4,
  },
  editScroll: {
    paddingTop: SCREEN_HEIGHT * 0.07,
    paddingHorizontal: 16,
    paddingBottom: 100,
    alignItems: 'center',
  },
  editCard: {
    width: '100%', backgroundColor: COLORS.apricotBlush,
    borderRadius: 20, padding: 16,
    borderWidth: 2, borderColor: COLORS.mutedSapphire,
  },
  editClubName: {
    fontFamily: FONTS.heading, fontSize: 18,
    color: COLORS.mutedSapphire, textAlign: 'center', marginBottom: 8,
  },
  fieldLabel: {
    fontFamily: FONTS.body, fontSize: 12,
    color: COLORS.deepNavy, marginBottom: 2, marginTop: 8, opacity: 0.7,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontFamily: FONTS.body, fontSize: 15, color: COLORS.deepNavy,
    borderWidth: 1, borderColor: 'rgba(197,212,245,0.4)',
  },
  textArea: { height: 56, textAlignVertical: 'top' },
  rowFields: { flexDirection: 'row' },
  interestPickerButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(197,212,245,0.4)',
  },
  interestPickerText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.deepNavy },
  interestPreviewText: {
    fontFamily: FONTS.body, fontSize: 13,
    color: COLORS.mutedSapphire, marginTop: 6, opacity: 0.8,
  },
  saveButton: {
    backgroundColor: COLORS.mutedSapphire, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16,
  },
  saveButtonText: { fontFamily: FONTS.body, fontSize: 17, color: COLORS.ghostBlue },
  cancelButton: { paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  cancelButtonText: {
    fontFamily: FONTS.body, fontSize: 15,
    color: COLORS.mutedSapphire, opacity: 0.7,
  },
  deleteButton: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(211,47,47,0.2)',
  },
  deleteButtonText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: '#D32F2F',
    opacity: 0.9,
  },
});