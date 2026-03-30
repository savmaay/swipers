import React from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import TabBar from './TabBar';

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  let activeTab = -1;
  const lastSegment = segments[segments.length - 1];
  // 0: arrow (swipe), 1: group chat, 2: calendar, 3: star
  if (lastSegment === 'swipe') activeTab = 0;
  else if (lastSegment === 'explore') activeTab = 1;
    else if (lastSegment === 'rating') activeTab = 3;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, 
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="swipe" />
        <Tabs.Screen name="explore" />
          <Tabs.Screen name="rating" />
      </Tabs>

      <CustomTabBar activeTab={activeTab} router={router} segments={segments} />
    </View>
  );
}

// Custom TabBar
function CustomTabBar({ activeTab = 0, router, segments }: { activeTab?: number; router: any; segments: string[] }) {
  // 0: arrow (swipe/dashboard), 1: group chat, 2: calendar, 3: star
  const icons = [
    { icon: 'swap-horizontal-outline', onPress: () => {
        if (segments[segments.length - 1] === 'swipe') router.push('/(tabs)');
        else router.push('/(tabs)/swipe');
      }
    },
    { icon: 'chatbubbles-outline', onPress: () => router.push('/(tabs)/explore') },
    { icon: 'calendar-outline', onPress: () => {/* no-op, just icon for now */} },
      {
      icon: 'star-outline',
      onPress: () => {
        if (segments[segments.length - 1] === 'rating') {
          router.push('/(tabs)'); // go back to dashboard
        } else {
          router.push('/(tabs)/rating'); // go to rating
        }
      }
    },
  ];

  return (
    <View style={styles.tabBar}>
      {icons.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={tab.onPress}
          disabled={index == 2} 
        >
          <View style={[styles.tabIconWrapper, activeTab === index ? styles.tabIconActive : null]}>
            <Ionicons
              name={tab.icon as any}
              size={28}
              color={activeTab === index ? '#fff' : COLORS.deepNavy}
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// TabBar styles
const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 84,
    backgroundColor: COLORS.warmMelon,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 16,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: 'rgba(46,49,72,0.25)',
  },
});
