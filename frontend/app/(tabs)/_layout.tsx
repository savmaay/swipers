import React from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();

  const lastSegment = segments[segments.length - 1];

 // In TabLayout, update activeTab detection:
  let activeTab = -1;
  if (lastSegment === 'swipe') activeTab = 0;
  else if (lastSegment === 'groupchat') activeTab = 1;
  else if (lastSegment === 'calendar') activeTab = 2;
  else if (lastSegment === 'rating') activeTab = 3;
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
          lastSegment={lastSegment}
        />
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="swipe" />
      <Tabs.Screen name="groupchat" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="rating" />
    </Tabs>
  );
}

function CustomTabBar({
  activeTab,
  router,
  lastSegment,
}: {
  activeTab: number;
  router: any;
  lastSegment: string;
}) {
  const tabs = [
    {
      active: 'swap-horizontal',
      inactive: 'swap-horizontal-outline',
      route: '/(tabs)/swipe',
      key: 'swipe',
    },
    {
      active: 'chatbubbles',
      inactive: 'chatbubbles-outline',
      route: '/(tabs)/groupchat',
      key: 'groupchat',
    },
    {
      active: 'calendar',
      inactive: 'calendar-outline',
      route: '/(tabs)/calendar',
      key: 'calendar',
    },
    {
      active: 'star',
      inactive: 'star-outline',
      route: '/(tabs)/rating',
      key: 'rating',
    },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => {
        const isActive = activeTab === index;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => {
              const isOnSameTab = lastSegment === tab.key;

              // 🔥 FIX: toggle behavior
              if (isOnSameTab) {
                router.replace('/(tabs)'); // go to dashboard
              } else {
                router.replace(tab.route); // go to tab
              }
            }}
          >
            <View
              style={[
                styles.tabIconWrapper,
                isActive && styles.tabIconActive,
              ]}
            >
              <Ionicons
                name={(isActive ? tab.active : tab.inactive) as any}
                size={28}
                color={isActive ? '#fff' : COLORS.deepNavy}
              />
            </View>
          </TouchableOpacity>
        );
      })}
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