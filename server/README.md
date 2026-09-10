# API — Descargo & Cargo

Backend real (Node + Express + Prisma) que reemplaza los datos mock de
`../app/src/data/mock.ts`. Sigue el stack definido en
`../PLAN_INTEGRAL_V3.md` §4-5, con un subconjunto acotado del esquema
completo — ver el comentario al inicio de `prisma/schema.prisma` para el
detalle de qué queda fuera de este MVP (PostGIS, Oferta/Viaje, Wompi real,
etc.) y cuándo se agrega.

## Stack

- Node.js + Express 5
- Prisma ORM sobre **SQLite** para desarrollo local (cero instalaciones).
  Migrar a PostgreSQL siguiendo `../docs/GUIA_SERVIDOR_BAJO_COSTO.md` es
  solo cambiar `provider`/`DATABASE_URL` en `prisma/schema.prisma` — los
  modelos son compatibles.
- JWT (jsonwebtoken) + bcrypt para auth
- Zod para validación de payloads

## Desarrollo

```bash
npm install
cp .env.example .env
npx prisma migrate dev   # crea prisma/dev.db
npm run seed             # cuentas y cargas de demo (password: demo1234)
npm run dev               # http://localhost:4000
```

Cuentas de prueba tras `npm run seed`:
- `publicador-demo@descargoycargo.co`
- `transportador-demo@descargoycargo.co`

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | — | Crea cuenta (`PUBLICADOR` o `TRANSPORTADOR`) |
| POST | `/api/auth/login` | — | Devuelve JWT |
| GET | `/api/cargas` | opcional | Lista cargas disponibles; si el transportador está autenticado marca `desbloqueada` |
| POST | `/api/cargas` | PUBLICADOR | Publica carga — rechaza precio bajo el piso SICE-TAC (422) |
| GET | `/api/cargas/:id` | opcional | Detalle; revela `contacto` solo si está desbloqueada |
| POST | `/api/cargas/:id/desbloqueo` | TRANSPORTADOR | Cobra 4% del flete (mín. $15.000, gratis con membresía ILIMITADA) y revela el contacto |
| GET | `/api/membresias/planes` | — | Los 4 planes (mismo contenido que hoy en el frontend) |
| GET/POST | `/api/membresias/actual` | TRANSPORTADOR | Consulta / cambia de plan (simulado, sin pasarela real) |

## Pendiente antes de producción

- Pasarela de pagos real (Wompi) en vez del desbloqueo simulado.
- PostgreSQL + PostGIS para búsqueda por radio geográfico.
- Oferta/Viaje (negociación y ejecución), KYC de verificación, AuditLog.
- Conectar el frontend (`../app`) a esta API en vez de `src/data/mock.ts`.
