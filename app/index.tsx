import { Href, Redirect } from 'expo-router';
import { LoadingView } from '@/components/ui/LoadingView';
import { useSession } from '@/context/SessionContext';

export default function Index() {
  const { ready, usuario, usuarioId } = useSession();

  if (!ready) {
    return <LoadingView />;
  }

  if (!usuarioId || !usuario) {
    return <Redirect href="/(auth)/ingreso" />;
  }

  if (usuario.requiereAlias) {
    return <Redirect href={'/(auth)/elegir-alias' as Href} />;
  }

  return <Redirect href="/(tabs)/inicio" />;
}
