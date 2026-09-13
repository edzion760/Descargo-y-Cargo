// Solo para mostrar algo en pantalla (ej. la marca de agua "USUARIO-123") — un
// JWT no está encriptado, así que leer su payload en el cliente es seguro para
// esto, pero nunca debe usarse para confiar en datos sensibles sin verificar.
export function idDesdeToken(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.sub === 'number' ? payload.sub : null;
  } catch {
    return null;
  }
}
