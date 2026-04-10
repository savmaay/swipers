import { Tabs } from 'expo-router';
export default function AdminTabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="edit-events" />
      <Tabs.Screen name="edit-event-card" />  // ← for when pencil on a card is tapped
    </Tabs>
  );
}