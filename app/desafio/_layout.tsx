import { Href, Redirect, Stack } from 'expo-router';
import { LoadingView } from '@/components/ui/LoadingView';
import { useAuthGate } from '@/hooks/useAuthGate';

export default function DesafioLayout() {
  const status = useAuthGate();

  if (status === 'loading') {
    return <LoadingView />;
  }
  if (status === 'login') {
    return <Redirect href="/(auth)/ingreso" />;
  }
  if (status === 'alias') {
    return <Redirect href={'/(auth)/elegir-alias' as Href} />;
  }

  return (
    <Stack
      screenOptions={{
        presentation: 'transparentModal',
        headerShown: false,
        animation: 'slide_from_bottom',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}
