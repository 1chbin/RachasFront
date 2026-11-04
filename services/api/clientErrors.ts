import { apiRequestPublic } from '@/services/api/client';

export function reportarErrorCliente(input: {
  mensaje: string;
  pantalla?: string;
  requestId?: string;
}) {
  return apiRequestPublic('/analytics/client-errors', {
    method: 'POST',
    body: input,
  });
}
