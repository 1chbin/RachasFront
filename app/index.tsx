import { Redirect } from 'expo-router';
import { LoadingView } from '@/components/ui/LoadingView';
import { useSession } from '@/context/SessionContext';

export default function Index() {
  const { ready, usuarioId } = useSession();

  if (!ready) {
    return <LoadingView />;
  }

  if (!usuarioId) {
    return <Redirect href="/(auth)/ingreso" />;
  }

  return <Redirect href="/(tabs)/inicio" />;
}
