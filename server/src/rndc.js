// Consulta el dato abierto REAL del RNDC (Registro Nacional de Despachos de
// Carga, Ministerio de Transporte) vía la API pública de datos.gov.co --
// gratis, sin llave ni cuenta. Dataset v7bz-7nq2: despachos agregados por
// mes/ruta/configuración vehicular, reportados por las empresas de
// transporte al propio Ministerio.
//
// ponytail: el campo "kilogramos" del dataset trae valores que no calzan
// con "valorespagados" (parecen otra unidad/agregación, no kg reales) --
// no se inventa un "COP/tonelada" a partir de ahí. Se muestra el valor
// pagado reportado tal cual, sin derivar una tarifa que no se puede
// sostener con esos datos.

const DATASET_URL = 'https://www.datos.gov.co/resource/v7bz-7nq2.json';

// Sin acentos/ñ y solo letras+espacios: evita inyección en el $where de
// Socrata (nada de comillas/operadores puede colarse) y calza con el
// dataset, que tampoco tiene acentos.
function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z ]/g, '')
    .trim();
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatearMes(mes) {
  // formato del dataset: "202004" -> "abril 2020"
  const anio = mes.slice(0, 4);
  const mesNum = Number(mes.slice(4, 6));
  return `${MESES[mesNum - 1] ?? mes} ${anio}`;
}

export async function despachosRealesRndc(origen, destino) {
  const origenN = normalizar(origen);
  const destinoN = normalizar(destino);
  if (!origenN || !destinoN) return [];

  const where = `upper(municipioorigen) like '%${origenN}%' AND upper(municipiodestino) like '%${destinoN}%'`;
  const url = `${DATASET_URL}?${new URLSearchParams({
    $where: where,
    $order: 'mes DESC',
    $limit: '5',
  })}`;

  const res = await fetch(url, { headers: { 'User-Agent': 'DescargoYCargo/1.0 (+https://descargoycargo.com)' } });
  if (!res.ok) throw new Error('No se pudo consultar el RNDC');
  const filas = await res.json();

  return filas.map((f) => ({
    mes: formatearMes(f.mes),
    configuracionVehiculo: f.config_vehiculo,
    mercancia: f.naturalezacarga,
    municipioOrigen: f.municipioorigen,
    municipioDestino: f.municipiodestino,
    valorPagado: Number(f.valorespagados) || null,
  }));
}
