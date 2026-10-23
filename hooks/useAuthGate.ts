import { useSession } from '@/context/SessionContext';

export type AuthGateStatus = 'loading' | 'login' | 'alias' | 'app';

export function useAuthGate(): AuthGateStatus {
  const { ready, usuario, usuarioId } = useSession();

  if (!ready) {
    return 'loading';
  }
  if (!usuarioId || !usuario) {
    return 'login';
  }
  if (usuario.requiereAlias) {
    return 'alias';
  }
  return 'app';
}
