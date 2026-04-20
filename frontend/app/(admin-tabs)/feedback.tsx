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
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';
import AdminTabBar from './AdminTabBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type FeedbackEvent = {
  id: string;
  club: string;
  title: string;
  date: string;
  attended: number;    // how many people attended
  averageRating: number; // 0–5, can be a decimal e.g. 3.5
  totalRatings: number;  // how many people rated
};

// Sample Data (replace with real API data) 
const SAMPLE_FEEDBACK: FeedbackEvent[] = [
  { id: '1', club: 'SWE',       title: 'Picnic Social',    date: 'March 30th',  attended: 80,  averageRating: 1,   totalRatings: 45 },
  { id: '2', club: 'Gator Club',title: 'Study Session',    date: 'March 18th',  attended: 100, averageRating: 3.5, totalRatings: 60 },
  { id: '3', club: 'AI Club',   title: 'AI Info Session',  date: 'April 2nd',   attended: 120, averageRating: 5,   totalRatings: 80 },
  { id: '4', club: 'CS Club',   title: 'Semester Party',   date: 'April 10th',  attended: 90,  averageRating: 2,   totalRatings: 50 },
];

// Star Display (read-only, shows average with half-star support) 
function StarDisplay({ rating }: { rating: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled  = rating >= star;
        const isHalf  = !filled && rating >= star - 0.5;
        return (
          <View key={star} style={{ width: SCREEN_WIDTH * 0.1, height: SCREEN_WIDTH * 0.1 }}>
            <Text style={styles.star}>★</Text>
            {(filled || isHalf) && (
              <View
                style={{
                  position: 'absolute',
                  overflow: 'hidden',
                  width: filled ? '100%' : '50%',  // full or half width clip
                  height: '100%',
                }}
              >
                <Text style={[styles.star, styles.starFilled]}>★</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
// Feedback Card 
function FeedbackCard({ event }: { event: FeedbackEvent }) {
  return (
    <View style={styles.eventCard}>
      {/* Attended badge — top right */}
      <View style={styles.attendedBadge}>
        <Text style={styles.attendedNumber}>{event.attended}</Text>
        <Text style={styles.attendedLabel}>Attended</Text>
      </View>

      <Text style={styles.eventClub}>{event.club}</Text>
      <Text style={styles.eventTitle}>{event.title}</Text>

      {/* Read-only star display */}
      <StarDisplay rating={event.averageRating} />

      {/* Average rating text */}
      <Text style={styles.ratingText}>
        {event.averageRating.toFixed(1)} / 5.0 · {event.totalRatings} ratings
      </Text>
    </View>
  );
}

// Screen 
export default function FeedbackScreen() {
  const fontsLoaded = useAppFonts();

  const [events, setEvents] =
    useState<FeedbackEvent[]>(SAMPLE_FEEDBACK);

  useEffect(() => {
    const loadRatings = async () => {
      const stored =
        await AsyncStorage.getItem('userRatings');

      if (!stored) return;

      const ratings = JSON.parse(stored);

      const updated = SAMPLE_FEEDBACK.map(event => {
        const match = ratings.find(
          (r: any) =>
            r.id === event.id &&
            r.rating > 0
        );

        if (!match) return event;

        const newTotal =
          event.totalRatings + 1;

        const newAverage =
          (
            event.averageRating *
            event.totalRatings +
            match.rating
          ) / newTotal;

        return {
          ...event,
          totalRatings: newTotal,
          averageRating: newAverage,
        };
      });

      setEvents(updated);
    };

    loadRatings();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.periwinkleMist, '#9BBDE0', COLORS.periwinkleMist]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Event Feedback</Text>
      </View>

      {/* Feedback list */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {events.map((event) => (
          <FeedbackCard key={event.id} event={event} />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Tab bar */}
      <AdminTabBar />
    </View>
  );
}

// Styles 
const styles = StyleSheet.create({
  container: { flex: 1 },

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

  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },

  // Event card 
  eventCard: {
    backgroundColor: COLORS.apricotBlush,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.mutedSapphire,
    shadowColor: COLORS.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },

  // Attended badge 
  attendedBadge: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.periwinkleMist,
    borderWidth: 2,
    borderColor: COLORS.mutedSapphire,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendedNumber: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.mutedSapphire,
    lineHeight: 20,
  },
  attendedLabel: {
    fontFamily: FONTS.body,
    fontSize: 9,
    color: COLORS.mutedSapphire,
    lineHeight: 11,
  },

  eventClub: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.mutedSapphire,
    textAlign: 'center',
    marginBottom: 2,
    paddingRight: 68, 
  },
  eventTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.mutedSapphire,
    textAlign: 'center',
    marginBottom: 12,
    paddingRight: 68,
  },

  // Stars — read only display
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  star: {
    fontSize: SCREEN_WIDTH * 0.1,
    color: COLORS.peachyCream,
    textShadowColor: COLORS.mutedSapphire,
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  starFilled: {
    color: '#F5E642',       // bright yellow filled
  },
  starHalf: {
    color: '#A8CFEE',      
  },

  ratingText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.mutedSapphire,
    opacity: 0.8,
  },

  // Tab bar
  tabBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 84,
    backgroundColor: COLORS.warmMelon,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 16,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIconWrapper: {
    width: 54, height: 54, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  tabIconActive: { backgroundColor: 'rgba(46,49,72,0.25)' },
});