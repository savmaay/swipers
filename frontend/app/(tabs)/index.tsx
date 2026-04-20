import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const [route, setRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const completed = await AsyncStorage.getItem('onboardingComplete');

      if (completed === 'true') {
        setRoute('/(tabs)/swipe');
      } else {
        setRoute('/onboarding/interests');
      }
    };

    checkStatus();
  }, []);

  if (!route) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={route as any} />;
}