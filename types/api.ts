export type EstadoDesafio =
  | 'PROGRAMADO'
  | 'ACTIVO'
  | 'PAUSADO'
  | 'FINALIZADO'
  | 'CANCELADO';

export type PuntosCheckIn = {
  total: number;
  bonusPorRacha: number;
};

export type CategoriaDesafio =
  | 'SALUD'
  | 'ESTUDIO'
  | 'FINANZAS'
  | 'BIENESTAR'
  | 'OTRO';

export interface Usuario {
  id: string;
  nombre: string;
  alias: string;
  email: string;
  zonaHoraria: string;
  requiereAlias?: boolean;
}

export interface DesafioResumen {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaDesafio;
  estado: EstadoDesafio;
  fechaInicio: string;
  finalizaEn: string;
  maxParticipantes: number;
  creadorId: string;
  codigoInvitacion?: string;
}

export interface MetaPaginacion {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: MetaPaginacion;
}

export interface CheckIn {
  id: string;
  desafioId: string;
  usuarioId: string;
  dia: string;
  nota?: string;
  valor?: number;
  puntos: PuntosCheckIn;
  zonaHorariaUsada: string;
}

export interface ResumenInicioItem {
  desafio: DesafioResumen;
  rachaActual: number;
  mejorRacha: number;
  posicion: number;
  puntosTotales: number;
  checkInHoy: boolean;
}

export interface ResumenInicio {
  desafios: ResumenInicioItem[];
}

export interface FilaRanking {
  posicion: number;
  usuarioId: string;
  alias: string;
  puntosTotales: number;
  rachaActual: number;
}

export interface RankingResponse {
  desafioId: string;
  estado: EstadoDesafio;
  ranking: FilaRanking[];
  ganador?: FilaRanking;
}

export interface RachaResponse {
  rachaActual: number;
  mejorRacha: number;
}

export interface Participante {
  id: string;
  seUnioEn: string;
  usuario: Usuario;
}
