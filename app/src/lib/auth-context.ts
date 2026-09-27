import { createContext } from 'react';

export type Tipo = 'PUBLICADOR' | 'TRANSPORTADOR';

export interface RegisterInput {
  email: string;
  password: string;
  tipo: Tipo;
  nombre: string;
  ciudad: string;
  telefono: string;
  documento: string;
  placa?: string;
  aceptaTerminos: boolean;
}

export interface AuthState {
  autenticado: boolean;
  cargando: boolean;
  miId: number | null;
  tipo: Tipo | null;
  terminosPendientes: boolean;
  placa: string | null;
  esAdmin: boolean;
  aceptarTerminos: () => Promise<void>;
  guardarPlaca: (placa: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  eliminarCuenta: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);
