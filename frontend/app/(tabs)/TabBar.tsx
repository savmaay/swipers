import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  // ─── Handlers ─────────────────────────────

  const handleArrowPress = () => {
    if (pathname.includes('/swipe')) {
      router.replace('/(tabs)'); // go to dashboard
    } else {
      router.replace('/(tabs)/swipe'); // go to swipe
    }
  };

  const handleGroupChat = () => {
    if (pathname.includes('/groupchat')) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(tabs)/groupchat');
    }
  };

  const handleCalendar = () => {
    if (pathname.includes('/calendar')) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(tabs)/calendar');
    }
  };

  const handleStar = () => {
    if (pathname.includes('/rating')) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(tabs)/rating');
    }
  };

  // ─── UI ─────────────────────────────────

  return (
    <View style={styles.tabBar}>
      
      {/* Arrow (Swipe / Dashboard toggle) */}
      <TouchableOpacity style={styles.tabButton} onPress={handleArrowPress}>
        <Ionicons
          name="arrow-forward-circle"
          size={36}
          color={pathname.includes('/swipe') ? COLORS.deepNavy : COLORS.dustyTangerine}
        />
      </TouchableOpacity>

      {/* Group Chat */}
      <TouchableOpacity style={styles.tabButton} onPress={handleGroupChat}>
        <Ionicons
          name="chatbubbles"
          size={32}
          color={pathname.includes('/groupchat') ? COLORS.deepNavy : COLORS.dustyTangerine}
        />
      </TouchableOpacity>

      {/* Calendar */}
      <TouchableOpacity style={styles.tabButton} onPress={handleCalendar}>
        <Ionicons
          name="calendar"
          size={32}
          color={pathname.includes('/calendar') ? COLORS.deepNavy : COLORS.dustyTangerine}
        />
      </TouchableOpacity>

      {/* Star */}
      <TouchableOpacity style={styles.tabButton} onPress={handleStar}>
        <FontAwesome
          name="star"
          size={32}
          color={pathname.includes('/rating') ? COLORS.deepNavy : COLORS.dustyTangerine}
        />
      </TouchableOpacity>

    </View>
  );
}

// ─── Styles ───────────────────────────────

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