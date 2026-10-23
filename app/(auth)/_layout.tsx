import { Href, Redirect, Stack, useSegments } from 'expo-router';
import { LoadingView } from '@/components/ui/LoadingView';
import { useAuthGate } from '@/hooks/useAuthGate';

export default function AuthLayout() {
  const status = useAuthGate();
  const segments = useSegments();
  const pantalla = segments[segments.length - 1];

  if (status === 'loading') {
    return <LoadingView />;
  }

  if (pantalla === 'ingreso' && status === 'app') {
    return <Redirect href="/(tabs)/inicio" />;
  }

  if (pantalla === 'elegir-alias') {
    if (status === 'login') {
      return <Redirect href="/(auth)/ingreso" />;
    }
    if (status === 'app') {
      return <Redirect href="/(tabs)/inicio" />;
    }
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
