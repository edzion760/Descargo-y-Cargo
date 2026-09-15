import { useEffect, useState, type ReactNode } from 'react';
import { apiFetch } from './api';
import { AuthContext, type RegisterInput, type Tipo } from './auth-context';

interface Sesion {
  id: number;
  tipo: Tipo;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);

  // El JWT vive en una cookie httpOnly (el JS ya no puede leerlo) -- esta es
  // la única forma de saber, al cargar la página, si hay sesión activa.
  useEffect(() => {
    apiFetch<Sesion>('/api/auth/me')
      .then(setSesion)
      .catch(() => setSesion(null))
      .finally(() => setCargando(false));
  }, []);

  async function login(email: string, password: string) {
    setSesion(await apiFetch<Sesion>('/api/auth/login', { method: 'POST', body: { email, password } }));
  }

  async function register(input: RegisterInput) {
    setSesion(await apiFetch<Sesion>('/api/auth/register', { method: 'POST', body: input }));
  }

  async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setSesion(null);
  }

  // Derecho de supresión (Ley 1581 de 2012): baja inmediata, en cualquier momento.
  async function eliminarCuenta() {
    await apiFetch('/api/auth/me', { method: 'DELETE' });
    await logout();
  }

  return (
    <AuthContext.Provider
      value={{
        autenticado: !cargando && sesion !== null,
        miId: sesion?.id ?? null,
        tipo: sesion?.tipo ?? null,
        login,
        register,
        logout,
        eliminarCuenta,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
