// Backup local de la base de datos SQLite -- gratis, sin cuenta externa.
// ponytail: copia a otra carpeta del mismo disco (protege de un archivo
// corrupto o un borrado accidental, no de que falle el disco físico). Si
// eso importa, subir estas copias a Cloudflare R2 (10GB gratis) es el
// siguiente paso, no incluido aquí.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(dirname, '../prisma/dev.db');
const backupsDir = path.join(dirname, '../backups');
const RETENCION = 30; // cuántas copias conservar

function backup() {
  if (!fs.existsSync(dbPath)) {
    console.error('No existe la base de datos en', dbPath);
    process.exit(1);
  }
  fs.mkdirSync(backupsDir, { recursive: true });

  const marca = new Date().toISOString().replace(/[:.]/g, '-');
  const destino = path.join(backupsDir, `dev-${marca}.db`);
  fs.copyFileSync(dbPath, destino);
  console.log('Backup creado:', destino);

  const copias = fs
    .readdirSync(backupsDir)
    .filter((f) => f.endsWith('.db'))
    .sort();
  for (const vieja of copias.slice(0, Math.max(0, copias.length - RETENCION))) {
    fs.unlinkSync(path.join(backupsDir, vieja));
    console.log('Backup antiguo eliminado:', vieja);
  }
}

backup();
