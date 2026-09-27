import { useEffect, useState, type ReactNode } from 'react';
import { apiFetch } from './api';
import { AuthContext, type RegisterInput, type Tipo } from './auth-context';

interface Sesion {
  id: number;
  tipo: Tipo;
  terminosPendientes: boolean;
  placa: string | null;
  esAdmin: boolean;
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

  // login/register solo ponen la cookie; /me trae el estado completo
  // (términos pendientes, placa) en un solo lugar.
  async function login(email: string, password: string) {
    await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
    setSesion(await apiFetch<Sesion>('/api/auth/me'));
  }

  async function register(input: RegisterInput) {
    await apiFetch('/api/auth/register', { method: 'POST', body: input });
    setSesion(await apiFetch<Sesion>('/api/auth/me'));
  }

  async function aceptarTerminos() {
    await apiFetch('/api/auth/terminos', { method: 'POST', body: { acepta: true } });
    setSesion((s) => s && { ...s, terminosPendientes: false });
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
        cargando,
        miId: sesion?.id ?? null,
        tipo: sesion?.tipo ?? null,
        terminosPendientes: sesion?.terminosPendientes ?? false,
        placa: sesion?.placa ?? null,
        esAdmin: sesion?.esAdmin ?? false,
        aceptarTerminos,
        guardarPlaca: (placa) => setSesion((s) => s && { ...s, placa }),
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
