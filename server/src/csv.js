// CSV que Excel en Colombia abre bien: ";" como separador (coma decimal en
// la configuración regional) y BOM para que lea UTF-8 (sin él las tildes
// salen dañadas). Sin librería de xlsx: no hace falta.
export function csv(columnas, filas) {
  const celda = (v) => {
    const t = v == null ? '' : v instanceof Date ? v.toISOString().slice(0, 16).replace('T', ' ') : String(v);
    return /[";\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  return '﻿' + [columnas, ...filas].map((fila) => fila.map(celda).join(';')).join('\r\n');
}

export function enviarCsv(res, nombre, contenido) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
  res.send(contenido);
}
