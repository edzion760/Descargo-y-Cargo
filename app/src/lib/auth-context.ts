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
}

export interface AuthState {
  token: string | null;
  tipo: Tipo | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);
