import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { cargasRouter } from './routes/cargas.js';
import { membresiasRouter } from './routes/membresias.js';
import { webhooksRouter } from './routes/webhooks.js';
import { geoRouter } from './routes/geo.js';
import { noticiasRouter } from './routes/noticias.js';
import { pushRouter } from './routes/push.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/cargas', cargasRouter);
app.use('/api/membresias', membresiasRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/geo', geoRouter);
app.use('/api/noticias', noticiasRouter);
app.use('/api/push', pushRouter);

// Sirve el build de app/ (npm run build en app/) para que un solo proceso/puerto
// exponga frontend + API — así un único Cloudflare Tunnel cubre todo.
const dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(dirname, '../../app/dist');
if (fs.existsSync(distDir)) {
  // index.html cambia de contenido en cada deploy (apunta a un bundle con hash
  // distinto) pero mantiene el mismo nombre — nunca debe cachearse, o el
  // navegador (o Cloudflare) puede seguir sirviendo una versión vieja del
  // sitio después de un cambio. Los archivos bajo /assets sí tienen hash en
  // el nombre, así que esos sí pueden cachearse para siempre sin riesgo.
  app.use(
    express.static(distDir, {
      setHeaders: (res, filePath) => {
        res.setHeader(
          'Cache-Control',
          filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable'
        );
      },
    })
  );
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const port = process.env.PORT ?? 4000;
app.listen(port, () => console.log(`API de Descargo & Cargo escuchando en http://localhost:${port}`));
