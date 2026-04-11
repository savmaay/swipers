import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { useAppFonts } from '@/hooks/useAppFonts';
import AdminTabBar from './AdminTabBar';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type AdminEvent = {
  id: string;
  club: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  interests: string[];
};

const SAMPLE_EVENTS: AdminEvent[] = [
  { id: '1', club: 'SWE', title: 'Picnic Social!', date: 'March 30th', time: '5:00 pm', location: 'Plaza of Americas', description: 'This event welcomes all students for a fun spring picnic!', interests: ['Social', 'Networking'] },
  { id: '2', club: 'Gator Club', title: 'Study Session!', date: 'March 18th', time: '6:30 pm', location: 'Marston Library', description: 'Group study session, all majors welcome. Snacks provided!', interests: ['Academic', 'Study'] },
  { id: '3', club: 'AI Club', title: 'AI info session!', date: 'April 2nd', time: '1:00 pm', location: 'Malachowsky Hall', description: 'Learn about AI Club projects and how to get involved.', interests: ['Technology', 'AI'] },
  { id: '4', club: 'CS Club', title: 'Semester Party!', date: 'April 10th', time: '7:00 pm', location: 'Little Hall', description: 'End of semester celebration! Games, food, and fun.', interests: ['Social', 'Technology'] },
];


export default function CurrentEventsScreen() {
  const params = useLocalSearchParams();
  const fontsLoaded = useAppFonts();
  const [events, setEvents] = useState<AdminEvent[]>(SAMPLE_EVENTS);

  useEffect(() => {
    if (params.updatedEvent) {
      const updated = JSON.parse(params.updatedEvent as string);
      setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    }
  }, [params.updatedEvent]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7BAED4', '#9BBDE0', '#C5D4F5']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Text style={styles.title}>Current Events</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {events.map((event, index) => (
          <View key={event.id} style={styles.card}>
            <TouchableOpacity 
              style={styles.editIcon} 
              onPress={() => router.push({ pathname: '/(admin-tabs)/edit-events', params: { eventParam: JSON.stringify(event) }})}
            >
              <Ionicons name="create-outline" size={22} color={COLORS.mutedSapphire} />
            </TouchableOpacity>
            <Text style={styles.cardClub}>{event.club}</Text>
            <Text style={styles.cardTitle}>{event.title}</Text>
            <Text style={styles.cardDetail}>{event.date} • {event.time}</Text>
            <Text style={styles.cardDetail}>{event.location}</Text>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
      <AdminTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: SCREEN_HEIGHT * 0.07, paddingBottom: 4, alignItems: 'center' },
  title: { fontFamily: FONTS.heading, fontSize: 39, color: COLORS.dustyTangerine, textDecorationLine: 'underline', textAlign: 'center', marginBottom: 4 },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  card: { width: '100%', backgroundColor: COLORS.apricotBlush, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', borderWidth: 2, borderColor: COLORS.mutedSapphire, position: 'relative' },
  editIcon: { position: 'absolute', top: 10, right: 12 },
  cardClub: { fontFamily: FONTS.heading, fontSize: 18, color: COLORS.mutedSapphire, textAlign: 'center' },
  cardTitle: { fontFamily: FONTS.heading, fontSize: 29, color: COLORS.mutedSapphire, textAlign: 'center', marginBottom: 6 },
  cardDetail: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.mutedSapphire, textAlign: 'center' },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 84, backgroundColor: COLORS.warmMelon, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingBottom: 16, paddingTop: 8 },
  tabIconWrapper: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: 'rgba(46,49,72,0.25)' },
});



