# 🚀 DESCARGO & CARGO — Plan de Modernización Completo

> **Fecha:** 2026-07-24  
> **Proyecto:** Descargo & Cargo — Plataforma de Logística y Transporte de Carga  
> **Estado actual:** Java EE (JSP/Servlets), AngularJS 1.6, Bootstrap 4, JDBC puro  
> **Propuesta:** Stack Full-Stack Moderno 2026

---

## 📊 Diagnóstico del Estado Actual

### Arquitectura Detectada
```
┌─────────────────────────────────────────────────────────┐
│  Frontend: JSP + AngularJS 1.6 + Bootstrap 4 + jQuery   │
│  Backend:  Servlets Java + JDBC puro                    │
│  BD:       MySQL                                        │
│  Build:    NetBeans + Apache Ant                        │
│  Deploy:   .WAR en servidor de aplicaciones Java        │
└─────────────────────────────────────────────────────────┘
```

### 🔴 Problemas Críticos de Seguridad

| Severidad | Problema | Detalle |
|-----------|----------|---------|
| **CRÍTICO** | SQL Injection Universal | 100% de las consultas concatenan variables directamente en SQL (`"WHERE id='" + id + "'"`). Cualquier atacante puede extraer, modificar o borrar toda la base de datos. |
| **CRÍTICO** | Contraseñas en Texto Plano | Las contraseñas se almacenan y comparan literalmente. No existe hashing (bcrypt/Argon2). |
| **ALTO** | Sin Validación de Entrada | No hay sanitización de datos entrantes. |
| **ALTO** | Sin Autenticación Segura | No hay JWT, tokens de sesión seguros, ni protección CSRF. |
| **MEDIO** | Exposición de Datos Sensibles | Emails, teléfonos y documentos accesibles sin control de permisos granulares. |

### 🟡 Problemas de Arquitectura y Código

| Problema | Impacto |
|----------|---------|
| **Código Duplicado Masivo** | Cada entidad repite los mismos 200+ líneas de CRUD con mínimas variaciones. |
| **Sin Separación de Capas** | Lógica de negocio, persistencia y presentación están mezcladas en JSPs y clases Java. |
| **Sin API REST** | Comunicación JSP→JSP con AngularJS 1.6 `$http` a endpoints sin estructura. |
| **Sin ORM** | Todo es JDBC manual con `ResultSet` y mapeo campo a campo. |
| **Sin Manejo de Errores** | Bloques `catch` vacíos o con `System.out.println`. |
| **Frontend Obsoleto** | AngularJS 1.6 llegó a End-of-Life en diciembre 2021. Bootstrap 4 está deprecado. |

---

## 🏗️ Propuesta de Arquitectura Moderna

### Stack Tecnológico Recomendado

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DESCARGO & CARGO 2.0                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────┐    ┌───────────────────────────────────────┐  │
│  │   FRONTEND (Cliente)     │    │   BACKEND (API REST)                  │  │
│  │  ┌────────────────────┐  │    │  ┌─────────────────────────────────┐  │  │
│  │  │ React 19 + Vite    │  │◄──►│  │ Node.js 22 + Express 5            │  │  │
│  │  │ TypeScript 5.6     │  │    │  │ TypeScript (strict)               │  │  │
│  │  │ Tailwind CSS 4     │  │    │  │ Prisma ORM 6 (PostgreSQL)         │  │  │
│  │  │ shadcn/ui          │  │    │  │ Zod (validación)                  │  │  │
│  │  │ TanStack Query     │  │    │  │ JWT + bcrypt (auth)               │  │  │
│  │  │ React Router 7     │  │    │  │ Winston (logging)                 │  │  │
│  │  │ React Hook Form    │  │    │  │ Helmet + CORS + Rate Limit        │  │  │
│  │  │ Framer Motion      │  │    │  │ Socket.io (tiempo real)           │  │  │
│  │  │ Mapbox GL JS       │  │    │  │ Multer (uploads)                  │  │  │
│  │  └────────────────────┘  │    │  └─────────────────────────────────┘  │  │
│  └──────────────────────────┘    └───────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │   INFRAESTRUCTURA                                                   │    │
│  │   Docker + Docker Compose │ Nginx (reverse proxy) │ PostgreSQL 16   │    │
│  │   Redis (sesiones/cache)  │ MinIO/S3 (archivos)   │ Let's Encrypt   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### ¿Por qué este stack?

| Tecnología | Ventaja para Descargo & Cargo |
|------------|------------------------------|
| **React 19 + Vite** | SPA rápida, hot reload instantáneo, ecosistema masivo, Server Components disponibles. |
| **TypeScript** | Tipado estático que elimina el 70% de bugs en tiempo de compilación. |
| **Tailwind CSS + shadcn/ui** | Diseño profesional, consistente y responsive sin escribir CSS casi nunca. |
| **TanStack Query** | Manejo automático de caché, estados de loading, error, revalidación en background. |
| **Node.js + Express** | JavaScript full-stack, rendimiento I/O excelente para APIs, despliegue sencillo. |
| **Prisma ORM** | Type-safe queries, migraciones automáticas, modelo declarativo, elimina SQL Injection. |
| **PostgreSQL** | BD relacional robusta, JSON nativo, geolocalización (PostGIS), escalable. |
| **Socket.io** | Notificaciones en tiempo real (nueva carga disponible, estado de envío, mensajes). |
| **Mapbox/Google Maps** | Visualización de rutas, tracking de vehículos en tiempo real, cálculo de distancias. |

---

## 🗄️ Esquema de Base de Datos Modernizado (Prisma)

```prisma
// schema.prisma — Descargo & Cargo 2.0

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ─────────────────────────────────────────────

enum TipoUsuario {
  PUBLICADOR
  TRANSPORTADOR
  ADMIN
}

enum EstadoCarga {
  DISPONIBLE
  EN_NEGOCIACION
  ASIGNADA
  EN_TRANSITO
  ENTREGADA
  CANCELADA
}

enum TipoPublicacion {
  NACIONAL
  URBANA
  BARBACHA
}

enum TipoVehiculo {
  CAMION_1_EJE
  CAMION_2_EJES
  CAMION_3_EJES
  TRACTOCAMION
  VOLQUETA
  FURGON
  PLANCHON
  ESTACAS
  REFRIGERADO
  TANQUE
}

enum EstadoVehiculo {
  ACTIVO
  EN_MANTENIMIENTO
  INACTIVO
}

// ─── USUARIOS Y AUTENTICACIÓN ─────────────────────────

model Usuario {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  tipo          TipoUsuario
  activo        Boolean   @default(true)
  emailVerificado Boolean @default(false) @map("email_verificado")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relaciones polimórficas
  publicador    Publicador?
  transportador Transportador?
  admin         Admin?

  // Sesiones y tokens
  sessions      Session[]
  refreshTokens RefreshToken[]

  @@map("usuarios")
}

model Session {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    Int      @map("user_id")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  usuario   Usuario  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    Int      @map("user_id")
  revoked   Boolean  @default(false)
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  usuario   Usuario  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}

// ─── PUBLICADOR ───────────────────────────────────────

model Publicador {
  id              Int       @id @default(autoincrement())
  usuarioId       Int       @unique @map("usuario_id")
  tipoPublicador  String    @map("tipo_publicador") // Empresa, Persona Natural
  nombre          String
  documento       String    @unique
  telefono        String
  direccion       String?
  ciudad          String
  departamento    String
  latitud         Decimal?  @db.Decimal(10, 8)
  longitud        Decimal?  @db.Decimal(11, 8)
  calificacion    Decimal?  @db.Decimal(3, 2) @default(5.00)
  totalCalificaciones Int   @default(0) @map("total_calificaciones")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  usuario         Usuario   @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  cargas          Carga[]
  ventas          Venta[]

  @@map("publicadores")
}

// ─── TRANSPORTADOR ────────────────────────────────────

model Transportador {
  id              Int       @id @default(autoincrement())
  usuarioId       Int       @unique @map("usuario_id")
  nombre          String
  documento       String    @unique
  telefono        String
  email           String
  direccion       String?
  ciudad          String
  departamento    String
  licenciaConduccion String @map("licencia_conduccion")
  certificadoSalud  Boolean @default(false) @map("certificado_salud")
  soatVigente     Boolean   @default(false) @map("soat_vigente")
  saldoAFavor     Decimal   @default(0) @db.Decimal(12, 2) @map("saldo_a_favor")
  calificacion    Decimal?  @db.Decimal(3, 2) @default(5.00)
  totalCalificaciones Int   @default(0) @map("total_calificaciones")
  latitudActual   Decimal?  @db.Decimal(10, 8) @map("latitud_actual")
  longitudActual  Decimal?  @db.Decimal(11, 8) @map("longitud_actual")
  ultimaUbicacionAt DateTime? @map("ultima_ubicacion_at")
  disponible      Boolean   @default(true)
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  usuario         Usuario   @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  vehiculos       Vehiculo[]
  ofertas         Oferta[]
  viajes          Viaje[]

  @@map("transportadores")
}

// ─── VEHÍCULO ─────────────────────────────────────────

model Vehiculo {
  id                Int           @id @default(autoincrement())
  transportadorId   Int           @map("transportador_id")
  placa             String        @unique
  tipo              TipoVehiculo
  marca             String
  modelo            String
  anno              Int
  capacidadToneladas Decimal      @db.Decimal(5, 2) @map("capacidad_toneladas")
  capacidadVolumen  Decimal       @db.Decimal(5, 2) @map("capacidad_volumen")
  fotoUrl           String?       @map("foto_url")
  tarjetaPropiedadUrl String?     @map("tarjeta_propiedad_url")
  soatUrl           String?       @map("soat_url")
  revisionTecnomecanicaUrl String? @map("revision_tecnomecanica_url")
  estado            EstadoVehiculo @default(ACTIVO)
  gpsActivo         Boolean       @default(false) @map("gps_activo")
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")

  transportador     Transportador @relation(fields: [transportadorId], references: [id], onDelete: Cascade)
  viajes            Viaje[]

  @@map("vehiculos")
}

// ─── CARGA ────────────────────────────────────────────

model Carga {
  id                Int             @id @default(autoincrement())
  publicadorId      Int             @map("publicador_id")
  titulo            String
  descripcion       String?
  toneladas         Decimal         @db.Decimal(8, 2)
  volumen           Decimal         @db.Decimal(8, 2)
  tipoCarga         String          @map("tipo_carga") // General, Peligrosa, Perecedera, etc.
  origenCiudad      String          @map("origen_ciudad")
  origenDepartamento String         @map("origen_departamento")
  origenLatitud     Decimal?        @db.Decimal(10, 8) @map("origen_latitud")
  origenLongitud    Decimal?        @db.Decimal(11, 8) @map("origen_longitud")
  origenDireccion   String?         @map("origen_direccion")
  destinoCiudad     String          @map("destino_ciudad")
  destinoDepartamento String        @map("destino_departamento")
  destinoLatitud    Decimal?        @db.Decimal(10, 8) @map("destino_latitud")
  destinoLongitud   Decimal?        @db.Decimal(11, 8) @map("destino_longitud")
  destinoDireccion  String?         @map("destino_direccion")
  distanciaKm       Decimal?        @db.Decimal(8, 2) @map("distancia_km")
  precio            Decimal         @db.Decimal(12, 2)
  comisionPorcentaje Decimal       @default(3.00) @db.Decimal(4, 2) @map("comision_porcentaje")
  fechaCarga        DateTime        @map("fecha_carga")
  fechaEntregaEstimada DateTime?    @map("fecha_entrega_estimada")
  tipoPublicacion   TipoPublicacion @map("tipo_publicacion")
  estado            EstadoCarga     @default(DISPONIBLE)
  requiereRefrigeracion Boolean     @default(false) @map("requiere_refrigeracion")
  requiereCargaPeligrosa Boolean   @default(false) @map("requiere_carga_peligrosa")
  fotos             CargaFoto[]
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")

  publicador        Publicador      @relation(fields: [publicadorId], references: [id], onDelete: Cascade)
  ofertas           Oferta[]
  viaje             Viaje?

  @@index([estado, tipoPublicacion])
  @@index([origenCiudad, destinoCiudad])
  @@index([precio])
  @@index([fechaCarga])
  @@map("cargas")
}

model CargaFoto {
  id        Int      @id @default(autoincrement())
  cargaId   Int      @map("carga_id")
  url       String
  orden     Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")

  carga     Carga    @relation(fields: [cargaId], references: [id], onDelete: Cascade)

  @@map("carga_fotos")
}

// ─── OFERTA (POSTULACIÓN DE TRANSPORTADOR) ────────────

model Oferta {
  id                Int       @id @default(autoincrement())
  cargaId           Int       @map("carga_id")
  transportadorId   Int       @map("transportador_id")
  vehiculoId        Int       @map("vehiculo_id")
  precioOfertado    Decimal   @db.Decimal(12, 2) @map("precio_ofertado")
  mensaje           String?
  aceptada          Boolean   @default(false)
  rechazada         Boolean   @default(false)
  fechaRespuesta    DateTime? @map("fecha_respuesta")
  createdAt         DateTime  @default(now()) @map("created_at")

  carga             Carga     @relation(fields: [cargaId], references: [id], onDelete: Cascade)
  transportador     Transportador @relation(fields: [transportadorId], references: [id], onDelete: Cascade)

  @@unique([cargaId, transportadorId])
  @@map("ofertas")
}

// ─── VIAJE (CARGA ASIGNADA) ───────────────────────────

model Viaje {
  id                Int       @id @default(autoincrement())
  cargaId           Int       @unique @map("carga_id")
  transportadorId   Int       @map("transportador_id")
  vehiculoId        Int       @map("vehiculo_id")
  precioFinal       Decimal   @db.Decimal(12, 2) @map("precio_final")
  comision          Decimal   @db.Decimal(12, 2)
  estado            String    // PENDIENTE_PAGO, PAGADO, EN_CURSO, COMPLETADO
  fechaInicio       DateTime? @map("fecha_inicio")
  fechaEntregaReal  DateTime? @map("fecha_entrega_real")
  codigoConfirmacionEntrega String? @map("codigo_confirmacion_entrega")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  carga             Carga     @relation(fields: [cargaId], references: [id], onDelete: Cascade)
  transportador     Transportador @relation(fields: [transportadorId], references: [id], onDelete: Cascade)
  vehiculo          Vehiculo  @relation(fields: [vehiculoId], references: [id])
  trackingEvents    TrackingEvent[]
  pagos             Pago[]

  @@map("viajes")
}

// ─── TRACKING EN TIEMPO REAL ──────────────────────────

model TrackingEvent {
  id          Int       @id @default(autoincrement())
  viajeId     Int       @map("viaje_id")
  latitud     Decimal   @db.Decimal(10, 8)
  longitud    Decimal   @db.Decimal(11, 8)
  velocidad   Decimal?  @db.Decimal(5, 2)
  timestamp   DateTime  @default(now())

  viaje       Viaje     @relation(fields: [viajeId], references: [id], onDelete: Cascade)

  @@index([viajeId, timestamp])
  @@map("tracking_events")
}

// ─── PAGOS ────────────────────────────────────────────

model Pago {
  id            Int       @id @default(autoincrement())
  viajeId       Int       @map("viaje_id")
  monto         Decimal   @db.Decimal(12, 2)
  tipo          String    // COMISION, TRANSPORTE, ADICIONAL
  metodo        String?   // TRANSFERENCIA, EFECTY, PSE, etc.
  referencia    String?
  comprobanteUrl String?  @map("comprobante_url")
  estado        String    @default("PENDIENTE") // PENDIENTE, VERIFICADO, RECHAZADO
  verificadoPor Int?      @map("verificado_por")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  viaje         Viaje     @relation(fields: [viajeId], references: [id], onDelete: Cascade)

  @@map("pagos")
}

// ─── VENTA (MODELO LEGACY — CONSERVADO) ───────────────

model Venta {
  id            Int       @id @default(autoincrement())
  publicadorId  Int       @map("publicador_id")
  concepto      String
  monto         Decimal   @db.Decimal(12, 2)
  fecha         DateTime
  estado        String    @default("PENDIENTE")
  createdAt     DateTime  @default(now()) @map("created_at")

  publicador    Publicador @relation(fields: [publicadorId], references: [id])

  @@map("ventas")
}

// ─── ADMIN ────────────────────────────────────────────

model Admin {
  id        Int      @id @default(autoincrement())
  usuarioId Int      @unique @map("usuario_id")
  nombre    String
  nivel     Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")

  usuario   Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  @@map("admins")
}

// ─── NOTIFICACIONES ───────────────────────────────────

model Notificacion {
  id          Int      @id @default(autoincrement())
  usuarioId   Int      @map("usuario_id")
  tipo        String   // NUEVA_CARGA, OFERTA_ACEPTADA, VIAJE_INICIADO, etc.
  titulo      String
  mensaje     String
  leida       Boolean  @default(false)
  data        Json?
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([usuarioId, leida])
  @@map("notificaciones")
}
```

---

## 🛡️ Mejoras de Seguridad Implementadas

| Capa | Medida |
|------|--------|
| **Autenticación** | JWT con refresh tokens rotativos, almacenados en httpOnly cookies. |
| **Contraseñas** | bcrypt con cost factor 12. Nunca se almacena ni transmite en texto plano. |
| **SQL** | Prisma ORM genera queries parametrizadas. SQL Injection es imposible. |
| **Validación** | Zod valida y sanitiza TODAS las entradas antes de tocar la BD. |
| **Headers** | Helmet.js establece CSP, HSTS, X-Frame-Options, etc. |
| **Rate Limiting** | Protección contra fuerza bruta en login y endpoints críticos. |
| **CORS** | Configurado explícitamente solo para el dominio de producción. |
| **Archivos** | Validación de tipo MIME, tamaño máximo, escaneo de virus (ClamAV). |
| **HTTPS** | Forzado en producción con certificados Let's Encrypt. |

---

## 📐 Estructura del Proyecto (Monorepo)

```
descargo-cargo-v2/
├── apps/
│   ├── web/                    # React + Vite + TypeScript
│   │   ├── src/
│   │   │   ├── components/     # shadcn/ui + custom
│   │   │   ├── pages/          # Rutas públicas y privadas
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utilidades, API client
│   │   │   ├── stores/         # Zustand (estado global)
│   │   │   └── types/          # Tipos TypeScript
│   │   ├── public/
│   │   └── package.json
│   │
│   └── api/                    # Node.js + Express + Prisma
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/       # Login, registro, JWT
│       │   │   ├── cargas/     # CRUD + búsqueda + filtros
│       │   │   ├── transportadores/
│       │   │   ├── publicadores/
│       │   │   ├── viajes/     # Tracking, estados
│       │   │   ├── pagos/      # Integración pasarela
│       │   │   └── notificaciones/
│       │   ├── middleware/     # Auth, error handler, validate
│       │   ├── lib/            # Prisma client, email, maps
│       │   └── server.ts       # Entry point
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
├── packages/
│   ├── shared-types/           # Tipos compartidos TS
│   └── ui/                     # Componentes UI compartidos
│
├── docker-compose.yml
├── Dockerfile.api
├── Dockerfile.web
└── turbo.json                  # Turborepo para builds
```

---

## ✨ Nuevas Funcionalidades Propuestas

### 1. **Mapa Interactivo de Cargas**
- Visualización en mapa de cargas disponibles por zona.
- Filtrado por radio de distancia desde ubicación actual.
- Rutas óptimas calculadas con Mapbox Directions API.

### 2. **Tracking GPS en Tiempo Real**
- Socket.io envía posición del vehículo cada 10 segundos.
- Publicador ve en vivo dónde está su carga.
- Alertas automáticas si el vehículo se desvía de la ruta.

### 3. **Sistema de Subasta Inteligente**
- En lugar de precio fijo, los transportadores pujan por la carga.
- Algoritmo recomienda el mejor precio/tiempo/calificación.

### 4. **Chat Integrado**
- Mensajería en tiempo real entre publicador y transportador.
- Compartir fotos de documentos, recibos, etc.

### 5. **Firma Digital y OTP de Entrega**
- Código OTP generado para confirmar entrega.
- Firma digital en el celular del receptor.
- Foto de evidencia de entrega.

### 6. **Dashboard Analítico**
- Ingresos, cargas transportadas, KMS recorridos.
- Gráficos de rendimiento con Recharts.
- Exportar a Excel/PDF.

### 7. **Notificaciones Push**
- Nuevas cargas en tu ruta favorita.
- Oferta aceptada.
- Pago recibido.
- Viaje iniciado/finalizado.

---

## 🚀 Roadmap de Implementación

| Fase | Duración | Entregable |
|------|----------|------------|
| **Fase 1: Fundación** | Semanas 1-2 | Setup monorepo, BD con Prisma, API auth, registro/login. |
| **Fase 2: Core** | Semanas 3-5 | CRUD completo de Cargas, Transportadores, Vehículos. Búsqueda y filtros. |
| **Fase 3: Matching** | Semanas 6-7 | Sistema de ofertas, asignación de cargas, estados del viaje. |
| **Fase 4: Pagos** | Semanas 8-9 | Integración pasarela de pagos (PSE, Tarjeta), comisiones automáticas. |
| **Fase 5: GPS + Chat** | Semanas 10-11 | Tracking en tiempo real, chat, notificaciones push. |
| **Fase 6: Polish** | Semanas 12-13 | Dashboard analítico, optimización móvil, testing E2E. |

---

## 📈 Comparativa: Antes vs Después

| Aspecto | Antes (2021) | Después (2026) |
|---------|-------------|----------------|
| **Seguridad** | ❌ SQL Injection, passwords en texto plano | ✅ Prisma ORM, bcrypt, JWT, rate limiting |
| **Frontend** | ❌ AngularJS 1.6 EOL, Bootstrap 4 | ✅ React 19, Tailwind 4, animaciones fluidas |
| **Backend** | ❌ JSP monolítico, sin API | ✅ REST API limpia, modular, type-safe |
| **BD** | ❌ MySQL + JDBC manual | ✅ PostgreSQL + Prisma ORM + migraciones |
| **Móvil** | ❌ App nativa separada (costo alto) | ✅ PWA responsive, casi nativa |
| **Tiempo Real** | ❌ Ninguno | ✅ GPS tracking, chat, notificaciones |
| **Mapas** | ❌ Ninguno | ✅ Rutas, distancias, visualización interactiva |
| **DevOps** | ❌ Despliegue manual | ✅ Docker, CI/CD automático |

---

*Documento generado como base técnica para la modernización de Descargo & Cargo.*
