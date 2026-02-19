import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
    };
    checkLogin();
  }, []);

  if (isLoggedIn === null) return null; // loading

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        // If logged in → go to main tabs
        <Stack.Screen name="(tabs)/_layout" />
      ) : (
        // If not logged in → show auth
        <>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </>
      )}
    </Stack>
  );
}
