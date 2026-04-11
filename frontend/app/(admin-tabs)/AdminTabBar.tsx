import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useSegments } from 'expo-router';
import { COLORS } from '@/constants/colors';

const TABS = [
  {
    icon: 'pencil-outline'     as const,
    segment: 'edit-events',
    extraSegments: ['current-events'],
    route:   '/(admin-tabs)/current-events', 
  },
  {
    icon: 'add-circle-outline' as const,
    segment: 'add-event',
    extraSegments: [] as string[],
    route:   '/(admin-tabs)/add-event',
  },
  {
    icon: 'calendar-outline'   as const,
    segment: 'calendar',
    extraSegments: [] as string[],
    route:   '/(admin-tabs)/calendar',
  },
  {
    icon: 'star-outline'       as const,
    segment: 'feedback',
    extraSegments: [] as string[],
    route:   '/(admin-tabs)/feedback',
  },
];

export default function AdminTabBar() {
  const segments = useSegments();
  const currentSegment = segments[segments.length - 1];

  const handlePress = (index: number) => {
    const tab = TABS[index];
    const isCurrentlyActive =
      currentSegment === tab.segment ||
      tab.extraSegments.includes(currentSegment ?? '');

    if (isCurrentlyActive) {
      router.replace('/(admin-tabs)');
    } else {
      router.push(tab.route as any);
    }
  };

  return (
    <View style={styles.tabBar}>
      {TABS.map((tab, index) => {
        const isActive =
          currentSegment === tab.segment ||
          tab.extraSegments.includes(currentSegment ?? '');
        return (
          <TouchableOpacity
            key={index}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => handlePress(index)}
          >
            <View style={[styles.tabIconWrapper, isActive && styles.tabIconActive]}>
              <Ionicons
                name={tab.icon}
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
    bottom: 0, left: 0, right: 0,
    height: 84,
    backgroundColor: COLORS.warmMelon,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1000,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  tabIconWrapper: {
    width: 54, height: 54, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: 'rgba(46,49,72,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});