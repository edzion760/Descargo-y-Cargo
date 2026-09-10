# Descargo & Cargo

Prototipo visual del marketplace de transporte de carga para Colombia: piso
tarifario SICE-TAC garantizado, verificación de transportadores, alertas de
carretera y planes de membresía.

Este `README` documenta el estado real del proyecto — ver también los planes
de negocio (`../PLAN_INTEGRAL_V3.md`), el anexo legal/DOFA
(`../ANEXO_LEGAL_DOFA_COMPETENCIA.md`) y los borradores legales (`../legal`).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (Radix primitives)
- React Router (una sola ruta activa por ahora: `/`)

## Estado actual

Es un **prototipo de front-end sin backend**: todos los datos (`src/data/mock.ts`)
son estáticos y las acciones (desbloquear contacto, iniciar sesión, publicar
carga) están simuladas en el cliente. No hay autenticación, pagos, ni
persistencia reales todavía.

## Desarrollo

```bash
npm install
npm run dev      # servidor local con HMR
npm run lint     # ESLint
npm run build    # type-check + build de producción
npm run preview  # sirve el build de producción localmente
```

## Pendiente antes de producción

- Backend/API real (auth, cargas, pagos vía Wompi, manifiestos RNDC).
- Pruebas automatizadas (hoy no hay ninguna).
- CI/CD y despliegue.
- Reemplazar `src/data/mock.ts` por datos reales.
