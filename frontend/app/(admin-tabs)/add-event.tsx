import React, { useState, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';
import AdminTabBar from './AdminTabBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const INTEREST_ROWS = [
  [{ id: '1', label: 'Technology', emoji: '💻' }, { id: '2', label: 'Art & Design', emoji: '🎨' }, { id: '3', label: 'Music', emoji: '🎵' }],
  [{ id: '4', label: 'Sports', emoji: '⚽' }, { id: '5', label: 'Science', emoji: '🔬' }, { id: '6', label: 'Gaming', emoji: '🎮' }],
  [{ id: '7', label: 'Food & Cooking', emoji: '🍕' }, { id: '8', label: 'Photography', emoji: '📸' }],
  [{ id: '9', label: 'Film & TV', emoji: '🎬' }, { id: '10', label: 'Literature', emoji: '📚' }, { id: '11', label: 'Fitness', emoji: '💪' }],
  [{ id: '12', label: 'Travel', emoji: '✈️' }, { id: '13', label: 'Business', emoji: '💼' }],
  [{ id: '14', label: 'Environment', emoji: '🌿' }, { id: '15', label: 'Fashion', emoji: '👗' }, { id: '16', label: 'Politics', emoji: '🗳️' }],
  [{ id: '17', label: 'Health', emoji: '🏥' }, { id: '18', label: 'Engineering', emoji: '⚙️' }],
  [{ id: '19', label: 'Dance', emoji: '💃' }, { id: '20', label: 'Community', emoji: '🤝' }, { id: '21', label: 'Language', emoji: '🌍' }],
  [{ id: '22', label: 'Entrepreneurship', emoji: '🚀' }, { id: '23', label: 'Psychology', emoji: '🧠' }],
];

const allInterests = INTEREST_ROWS.flat();

// --- Interest Chip Component ---
function InterestChip({ item, selected, onPress }: { item: any; selected: boolean; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity style={[chipStyles.chip, selected && chipStyles.chipSelected]} onPress={handlePress} activeOpacity={0.9}>
        <Text style={chipStyles.chipEmoji}>{item.emoji}</Text>
        <Text style={[chipStyles.chipLabel, selected && chipStyles.chipLabelSelected]}>{item.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function AddEventScreen() {
  const fontsLoaded = useAppFonts();
  const [isSelectingInterests, setIsSelectingInterests] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');       // Format: MM/DD/YY
  const [time, setTime] = useState('');       // Format: HH:MM
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [interestLabels, setInterestLabels] = useState<string[]>([]);
  const [editingIds, setEditingIds] = useState<string[]>([]);

  const resetForm = () => {
    setTitle('');
    setDate('');
    setTime('');
    setLocation('');
    setDesc('');
    setInterestLabels([]);
    setEditingIds([]);
  };

  const handleSave = async () => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;

    if (!title || !date || !time) {
      Alert.alert('Missing Info', 'Please provide a name, date, and time.');
      return;
    }

    if (!dateRegex.test(date)) {
      Alert.alert('Format Error', 'Use MM/DD/YY');
      return;
    }

    if (!timeRegex.test(time)) {
      Alert.alert('Format Error', 'Use HH:MM');
      return;
    }

    const newEvent = {
      id: Date.now().toString(),
      club: 'Your Organization',
      title,
      date,
      time,
      location,
      description: desc,
      interests: interestLabels,
    };

    const stored =
      await AsyncStorage.getItem('adminEvents');

    const existing = stored
      ? JSON.parse(stored)
      : [];

    const updated = [...existing, newEvent];

    await AsyncStorage.setItem(
      'adminEvents',
      JSON.stringify(updated)
    );

    const storedCalendar =
      await AsyncStorage.getItem(
        'adminCalendarEvents'
      );

    const currentCalendar =
      storedCalendar
        ? JSON.parse(storedCalendar)
        : [];

    const calendarEvent = {
      id: newEvent.id,
      title: newEvent.title,
      club: newEvent.club,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      description: newEvent.description,
    };

    await AsyncStorage.setItem(
      'adminCalendarEvents',
      JSON.stringify([
        ...currentCalendar,
        calendarEvent,
      ])
    );

    Alert.alert('Success', 'Event created!', [
      {
        text: 'OK',
        onPress: () => {
          resetForm();
          router.replace('/(admin-tabs)/current-events');
        },
      },
    ]);
  };

  const openInterestPicker = () => {
    setEditingIds(allInterests.filter(i => interestLabels.includes(i.label)).map(i => i.id));
    setIsSelectingInterests(true);
  };

  const confirmInterests = () => {
    setInterestLabels(allInterests.filter(i => editingIds.includes(i.id)).map(i => i.label));
    setIsSelectingInterests(false);
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7BAED4', '#9BBDE0', '#C5D4F5']} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {isSelectingInterests ? (
            <View style={styles.interestScreen}>
              <Text style={styles.title}>Interests</Text>
              <Text style={chipStyles.counter}>{editingIds.length} selected</Text>
              {INTEREST_ROWS.map((row, rowIndex) => (
                <View key={rowIndex} style={chipStyles.row}>
                  {row.map(item => (
                    <InterestChip key={item.id} item={item} selected={editingIds.includes(item.id)} onPress={() => setEditingIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} />
                  ))}
                </View>
              ))}
              <TouchableOpacity style={styles.doneBtn} onPress={confirmInterests}><Text style={styles.doneBtnText}>Done</Text></TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Add Event</Text>
              <View style={styles.formCard}>
                <Text style={styles.fieldLabel}>Name of Event</Text>
                <TextInput style={styles.input} placeholder="e.g. GBM #1" value={title} onChangeText={setTitle} />

                <View style={styles.rowFields}>
                  <View style={{ flex: 1.4, marginRight: 10 }}>
                    <Text style={styles.fieldLabel}>Date (MM/DD/YY)</Text>
                    <TextInput style={styles.input} placeholder="04/13/26" value={date} onChangeText={setDate} maxLength={8} keyboardType="numbers-and-punctuation" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Time (HH:MM)</Text>
                    <TextInput style={styles.input} placeholder="19:30" value={time} onChangeText={setTime} maxLength={5} keyboardType="numbers-and-punctuation" />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Location</Text>
                <TextInput style={styles.input} placeholder="Building/Room or Link" value={location} onChangeText={setLocation} />

                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput style={[styles.input, styles.textArea]} value={desc} onChangeText={setDesc} placeholder="Tell students what to expect..." multiline />

                <Text style={styles.fieldLabel}>Interests</Text>
                <TouchableOpacity style={styles.interestPickerButton} onPress={openInterestPicker}>
                  <Text style={styles.interestPickerText}>Select Interests ({interestLabels.length})</Text>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.deepNavy} />
                </TouchableOpacity>
                <Text style={styles.interestPreviewText}>{interestLabels.length > 0 ? interestLabels.join(', ') : 'No interests selected'}</Text>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={styles.saveButtonText}>Create Event</Text></TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={resetForm}><Text style={styles.cancelButtonText}>Clear Form</Text></TouchableOpacity>
              </View>
              <View style={{ height: 100 }} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <AdminTabBar />
    </View>
  );
}

const chipStyles = StyleSheet.create({
  counter: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.softCobalt, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 24, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)', gap: 5, elevation: 3 },
  chipSelected: { backgroundColor: COLORS.mutedSapphire, borderColor: COLORS.mutedSapphire },
  chipEmoji: { fontSize: 14 },
  chipLabel: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.deepNavy },
  chipLabelSelected: { color: COLORS.ghostBlue },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingTop: SCREEN_HEIGHT * 0.07, paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' },
  title: { fontFamily: FONTS.heading, fontSize: 39, color: COLORS.dustyTangerine, textDecorationLine: 'underline', textAlign: 'center', marginTop: 4 },
  interestScreen: { width: '100%', alignItems: 'center', paddingTop: 20, paddingHorizontal: 4 },
  doneBtn: { backgroundColor: COLORS.mutedSapphire, width: '90%', padding: 16, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  doneBtnText: { color: '#fff', fontSize: 20, fontFamily: FONTS.heading },
  formCard: { width: '100%', backgroundColor: COLORS.apricotBlush, borderRadius: 20, padding: 16, marginTop: 60, borderWidth: 2, borderColor: COLORS.mutedSapphire },
  fieldLabel: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.deepNavy, marginBottom: 2, marginTop: 8, opacity: 0.7 },
  input: { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontFamily: FONTS.body, fontSize: 15, color: COLORS.deepNavy, borderWidth: 1, borderColor: 'rgba(197,212,245,0.4)' },
  textArea: { height: 70, textAlignVertical: 'top' },
  rowFields: { flexDirection: 'row' },
  interestPickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(197,212,245,0.4)' },
  interestPickerText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.deepNavy },
  interestPreviewText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.mutedSapphire, marginTop: 6, opacity: 0.8 },
  saveButton: { backgroundColor: COLORS.mutedSapphire, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  saveButtonText: { fontFamily: FONTS.body, fontSize: 17, color: COLORS.ghostBlue },
  cancelButton: { paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  cancelButtonText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.mutedSapphire, opacity: 0.7 },
});