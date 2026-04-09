import { Stack } from 'expo-router';

export default function AdminOnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="intro" />
      <Stack.Screen name="dashboard-demo" />
      <Stack.Screen name="dashboard-edit" />
      <Stack.Screen name="add-demo" />
      <Stack.Screen name="edit-demo" />
      <Stack.Screen name="edit-demo-card" />
      <Stack.Screen name="create-profile" />
      <Stack.Screen name="admin-profile-create" />
    </Stack>
  );
}