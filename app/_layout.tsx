import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SessionProvider } from '@/context/SessionContext';
import { AlientoNotificationsProvider } from '@/context/AlientoNotificationsContext';
import { AppErrorBoundary } from '@/components/system/AppErrorBoundary';
import { DevBackReachabilityBanner } from '@/components/system/DevBackReachabilityBanner';
import { RecommendedUpdateBanner } from '@/components/system/RecommendedUpdateBanner';
import { lightColors } from '@/theme/light';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  return (
    <AppErrorBoundary pantalla="root">
      <SessionProvider>
        <AlientoNotificationsProvider>
          <View style={{ flex: 1 }}>
            <DevBackReachabilityBanner />
            <RecommendedUpdateBanner />
            <Stack
              screenOptions={{
              headerStyle: { backgroundColor: lightColors.background },
              headerTintColor: lightColors.primary,
              contentStyle: { backgroundColor: lightColors.background },
            }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="desafio" options={{ headerShown: false }} />
            <Stack.Screen
              name="actualizar"
              options={{ title: 'Actualizar', headerShown: true }}
            />
          </Stack>
          </View>
        </AlientoNotificationsProvider>
      </SessionProvider>
    </AppErrorBoundary>
  );
}
