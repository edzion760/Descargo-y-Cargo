import { useState, type ReactNode } from 'react';
import { apiFetch } from './api';
import { AuthContext, type RegisterInput, type Tipo } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dyc_token'));
  const [tipo, setTipo] = useState<Tipo | null>(() => localStorage.getItem('dyc_tipo') as Tipo | null);

  function persist(token: string, tipo: Tipo) {
    localStorage.setItem('dyc_token', token);
    localStorage.setItem('dyc_tipo', tipo);
    setToken(token);
    setTipo(tipo);
  }

  async function login(email: string, password: string) {
    const data = await apiFetch<{ token: string; tipo: Tipo }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    persist(data.token, data.tipo);
  }

  async function register(input: RegisterInput) {
    const data = await apiFetch<{ token: string; tipo: Tipo }>('/api/auth/register', {
      method: 'POST',
      body: input,
    });
    persist(data.token, data.tipo);
  }

  function logout() {
    localStorage.removeItem('dyc_token');
    localStorage.removeItem('dyc_tipo');
    setToken(null);
    setTipo(null);
  }

  return (
    <AuthContext.Provider value={{ token, tipo, login, register, logout }}>{children}</AuthContext.Provider>
  );
}
