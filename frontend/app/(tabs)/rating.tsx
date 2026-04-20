import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Types 
type AttendedEvent = {
  id: string;
  title: string;
  club: string;
  date: string;
  rating: number; // 0 = unrated, 1-5 = rated
};

// Sample Data (replace with real API data) 
const SAMPLE_ATTENDED: AttendedEvent[] = [
  { id: '1', title: 'Picnic Social',   club: 'SWE',      date: 'March 30th', rating: 0 },
  { id: '2', title: 'Study Session',   club: 'Gator Club', date: 'March 18th', rating: 0 },
  { id: '3', title: 'AI Info Session', club: 'AI Club',  date: 'April 2nd',  rating: 0 },
  { id: '4', title: 'Semester Party',  club: 'CS Club',  date: 'April 10th', rating: 0 },
];

// Star Rating Row 
function StarRating({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (stars: number) => void;
}) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRate(star)}
          activeOpacity={0.7}
          style={styles.starButton}
        >
          <Text style={[styles.star, star <= rating && styles.starFilled]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Event Card 
function EventCard({
  event,
  onRate,
}: {
  event: AttendedEvent;
  onRate: (id: string, stars: number) => void;
}) {
  return (
    <View style={styles.eventCard}>
      <Text style={styles.eventClub}>{event.club}</Text>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <StarRating
        rating={event.rating}
        onRate={(stars) => onRate(event.id, stars)}
      />
    </View>
  );
}

// Screen
export default function SavedScreen() {
  const fontsLoaded = useAppFonts();
  const [events, setEvents] = useState<AttendedEvent[]>(SAMPLE_ATTENDED);

  // TODO: fetch attended events from API

  const handleRate = async (id: string, stars: number) => {
    const updated = events.map(e =>
      e.id === id ? { ...e, rating: stars } : e
    );

    setEvents(updated);

    await AsyncStorage.setItem(
      'userRatings',
      JSON.stringify(updated)
    );
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.periwinkleMist, '#9BBDE0', COLORS.periwinkleMist]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Events Attended</Text>
        <Text style={styles.subtitle}>Please leave a rating!</Text>
      </View>

      {/* Event list */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onRate={handleRate}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingTop: SCREEN_HEIGHT * 0.07,
    paddingBottom: 8,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 34,
    color: COLORS.dustyTangerine,
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.mutedSapphire,
    textAlign: 'center',
  },

  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
    paddingBottom: 120,
  },

  // Event card 
  eventCard: {
    backgroundColor: COLORS.apricotBlush,
    borderRadius: 24,
    paddingVertical: 5,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.mutedSapphire,
    shadowColor: COLORS.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  eventClub: {
    fontFamily: FONTS.heading,
    fontSize: 25,
    color: COLORS.mutedSapphire,
    textAlign: 'center',
    marginBottom: 0,
  },
  eventTitle: {
    fontFamily: FONTS.heading,
    fontSize: 25,
    color: COLORS.mutedSapphire,
    textAlign: 'center',
    marginBottom: 0,
  },

  // Stars
  starsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: SCREEN_WIDTH * 0.1,   
    color: COLORS.peachyCream,     
    textShadowColor: COLORS.mutedSapphire,
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  starFilled: {
    color: '#F5E642',             
  },
});