import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { COLORS } from '@/constants/colors';

// Custom TabBar with 4 icons: Arrow (swipe/dashboard), GroupChat, Calendar, Star
export default function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  // Track if user is on swipe or dashboard
  const [onSwipe, setOnSwipe] = useState(pathname === '/(tabs)/swipe');

  // Handlers for each tab
  const handleArrowPress = () => {
    if (pathname === '/(tabs)/swipe') {
      router.replace('/(tabs)'); // Go to dashboard
      setOnSwipe(false);
    } else {
      router.replace('/(tabs)/swipe'); // Go to swipe
      setOnSwipe(true);
    }
  };
  const handleGroupChat = () => router.replace('/(tabs)/explore');
  const handleCalendar = () => router.replace('/(tabs)/calendar');
  const handleStar = () => router.push('/(tabs)/rating');

  return (
    <View style={styles.tabBar}>
      {/* Arrow (swipe/dashboard toggle) */}
      <TouchableOpacity style={styles.tabButton} onPress={handleArrowPress}>
        <Ionicons name="arrow-forward-circle" size={36} color={pathname === '/(tabs)/swipe' ? COLORS.deepNavy : COLORS.dustyTangerine} />
      </TouchableOpacity>
      {/* Group Chat */}
      <TouchableOpacity style={styles.tabButton} onPress={handleGroupChat}>
        <Ionicons name="chatbubbles" size={32} color={pathname === '/(tabs)/explore' ? COLORS.deepNavy : COLORS.dustyTangerine} />
      </TouchableOpacity>
      {/* Calendar (icon only, disabled) */}
      <TouchableOpacity style={styles.tabButton} onPress={handleCalendar}>
        <Ionicons name="chatbubbles" size={32} color={pathname === '/(tabs)/explore' ? COLORS.deepNavy : COLORS.dustyTangerine} />
      </TouchableOpacity>
      {/* Star (enabled) */}
      <TouchableOpacity style={styles.tabButton} onPress={handleStar}>
        <FontAwesome name="star" size={32} color={pathname === '/(tabs)/rating' ? COLORS.deepNavy : COLORS.dustyTangerine} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});