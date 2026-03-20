import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="intro" />
      <Stack.Screen name="card-demo" />
      <Stack.Screen name="create-profile" />
      <Stack.Screen name="interests" />
    </Stack>
  );
}