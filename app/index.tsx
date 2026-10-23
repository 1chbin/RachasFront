import { Href, Redirect } from 'expo-router';
import { LoadingView } from '@/components/ui/LoadingView';
import { useAuthGate } from '@/hooks/useAuthGate';

export default function Index() {
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

  return <Redirect href="/(tabs)/inicio" />;
}
