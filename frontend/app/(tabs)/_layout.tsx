import React from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();

  let activeTab = -1; // Default to -1 (nothing highlighted)
  const lastSegment = segments[segments.length - 1];

  // Logic Change: Only highlight if strictly on the sub-pages
  if (lastSegment === 'swipe') {
    activeTab = 0;
  } else if (lastSegment === 'explore') {
    activeTab = 1;
  } else if (lastSegment === 'calendar') {
    activeTab = 2;
  } else if (lastSegment === 'rating') {
    activeTab = 3;
  }
  // If lastSegment is 'index' or '(tabs)', activeTab remains -1

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={() => (
        <CustomTabBar
          activeTab={activeTab}
          router={router}
          segments={segments}
        />
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="swipe" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="rating" />
    </Tabs>
  );
}

function CustomTabBar({
  activeTab = 0,
  router,
  segments,
}: {
  activeTab?: number;
  router: any;
  segments: string[];
}) {
  const lastSegment = segments[segments.length - 1];

  const icons = [
    {
      icon: activeTab === 0 ? 'swap-horizontal' : 'swap-horizontal-outline',
      onPress: () => {
        if (lastSegment === 'swipe') router.push('/(tabs)');
        else router.push('/(tabs)/swipe');
      },
    },
    {
      icon: activeTab === 1 ? 'chatbubbles' : 'chatbubbles-outline',
      onPress: () => router.push('/(tabs)/explore'),
    },
    {
    icon: activeTab === 2 ? 'calendar' : 'calendar-outline',
    onPress: () => {
      if (lastSegment === 'calendar') {
        router.push('/(tabs)'); 
      } else {
        router.push('/(tabs)/calendar');
      }
    },
  },
    {
      icon: activeTab === 3 ? 'star' : 'star-outline',
      onPress: () => {
        if (lastSegment === 'rating') router.push('/(tabs)');
        else router.push('/(tabs)/rating');
      },
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
        >
          <View
            style={[
              styles.tabIconWrapper,
              activeTab === index ? styles.tabIconActive : null,
            ]}
          >
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
