import { apiRequestPublic } from '@/services/api/client';

export type VersionPolicy = {
  min: string;
  recommended: string;
};

export function obtenerVersionPolicy() {
  return apiRequestPublic<VersionPolicy>('/version-policy');
}
