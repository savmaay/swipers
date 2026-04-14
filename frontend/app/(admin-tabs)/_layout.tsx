import { Tabs } from 'expo-router';
export default function AdminTabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="current-events" />
      <Tabs.Screen name="edit-events" /> 
      <Tabs.Screen name="add-event" />
      <Tabs.Screen name="admin-calendar" />
      <Tabs.Screen name="admin-profile" />
      <Tabs.Screen name="feedback" />
      <Tabs.Screen name="AdminTabBar" />
    </Tabs>
  );
}