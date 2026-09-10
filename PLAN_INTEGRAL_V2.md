# 🚀 DESCARGO & CARGO 2.0 — Plan Integral de Modernización

> **Fecha:** 2026-07-24  
> **Proyecto:** Descargo & Cargo — Plataforma de Logística y Transporte de Carga  
> **Estado actual:** Java EE (JSP/Servlets), AngularJS 1.6, Bootstrap 4, JDBC puro  
> **Propuesta:** Stack Full-Stack Moderno 2026 + Estrategia de Negocio Integrada

---

## 📋 ÍNDICE

1. [Diagnóstico del Estado Actual](#1-diagnóstico-del-estado-actual)
2. [Análisis de Apuntes del Fundador](#2-análisis-de-apuntes-del-fundador)
3. [Modelo de Monetización Definido](#3-modelo-de-monetización-definido)
4. [Arquitectura Técnica Propuesta](#4-arquitectura-técnica-propuesta)
5. [Esquema de Base de Datos (Prisma)](#5-esquema-de-base-de-datos-prisma)
6. [Nuevas Funcionalidades por Fase](#6-nuevas-funcionalidades-por-fase)
7. [Integración CICETAC (MinTransporte)](#7-integración-cicetac-mintransporte)
8. [Verificación de Identidad y Antecedentes](#8-verificación-de-identidad-y-antecedentes)
9. [IA para Noticias de Carretera Geolocalizadas](#9-ia-para-noticias-de-carretera-geolocalizadas)
10. [Alianzas Estratégicas — Soporte Técnico](#10-alianzas-estratégicas--soporte-técnico)
11. [Roadmap de Implementación](#11-roadmap-de-implementación)
12. [Comparativa: Antes vs Después](#12-comparativa-antes-vs-después)

---

## 1. Diagnóstico del Estado Actual

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
| **CRÍTICO** | SQL Injection Universal | 100% de las consultas concatenan variables directamente en SQL. Cualquier atacante puede extraer, modificar o borrar toda la base de datos. |
| **CRÍTICO** | Contraseñas en Texto Plano | No existe hashing (bcrypt/Argon2). |
| **ALTO** | Sin Validación de Entrada | No hay sanitización de datos entrantes. |
| **ALTO** | Sin Autenticación Segura | No hay JWT, tokens de sesión seguros, ni protección CSRF. |

### 🟡 Problemas de Arquitectura

| Problema | Impacto |
|----------|---------|
| **Código Duplicado Masivo** | Cada entidad repite los mismos 200+ líneas de CRUD. |
| **Sin Separación de Capas** | Lógica de negocio, persistencia y presentación mezcladas. |
| **Sin API REST** | Comunicación JSP→JSP sin estructura. |
| **Frontend Obsoleto** | AngularJS 1.6 EOL (diciembre 2021), Bootstrap 4 deprecado. |

---

## 2. Análisis de Apuntes del Fundador

He revisado tus apuntes manuscritos. Aquí está mi evaluación de cada punto:

### ✅ Ya Considerados en el Plan Inicial (Parcialmente)

| # | Tu Apunte | Estado en Plan V1 |
|---|-----------|-------------------|
| 4 | API Google Maps geolocalización | ✅ Incluido (Mapbox GL JS + geolocalización) |
| 5 | Pasarela de pagos | ✅ Incluido (PSE, Tarjeta, Transferencia) |
| 7.3 | Videos para comunidad | ⚠️ Mencionado como marketing, no como feature técnico |

### 🆕 NUEVOS — No estaban en el plan inicial (¡muy buenos!)

| # | Tu Apunte | Mi Evaluación |
|---|-----------|---------------|
| 1 | **IA evalúa noticias falsas de carretera** | 🆕 EXCELENTE. Diferenciador único. Lo incorporo como módulo completo. |
| 2 | **Notificaciones geolocalizadas de novedades** | 🆕 Se refina como: sistema de alertas inteligentes por zona + feed de oportunidades. |
| 3 | **API verifica usuarios (no bots, sin antecedentes)** | 🆕 CRÍTICO. Lo incorporo como verificación KYC + consulta a RNEC + antecedentes. |
| 6 | **Botón calculadora de transporte (precio atractivo)** | 🆕 Se conecta directamente con CICETAC + IA de pricing dinámico. |
| 7.2 | **IA rastrea noticias y las trae a la web** | 🆕 Automatización de content curation para alertas de carretera. |
| 8 | **Normas y reglamento web** | 🆕 Feature legal: generación automática de contratos, términos firmados digitalmente. |
| 9 | **Abogados, seguridad jurídica** | 🆕 Estratégico. La plataforma debe generar contratos electrónicos vinculantes. |
| 10 | **Membresías mensuales** | 🆕 Modelo de suscripción para transportadores. Lo incorporo al modelo de monetización. |
| 11 | **Relación con Ministerio de Transporte** | 🆕 Integración oficial con CICETAC como valor agregado regulatorio. |
| 12 | **Alianza con empresas de combustible** | 🆕 Estratégico. La plataforma puede mostrar descuentos por geolocalización. |
| 13 | **Alianza con tarjetas de crédito** | 🆕 Integración con pasarela + crédito para transportadores. |
| 14 | **Alianza con aseguradoras** | 🆕 Seguro de carga integrado en cada viaje. |

### 📊 Clasificación por Tipo de Trabajo

```
┌─────────────────────────────────────────────────────────────┐
│  TÚ DEBES GESTIONAR (Estrategia/Negocio/Legal)              │
│  ├── 9.  Contratar abogados (nosotros solo generamos        │
│  │     contratos digitales desde la plataforma)             │
│  ├── 11. Relación directa con MinTransporte (tú contactas,  │
│  │     yo integro CICETAC)                                  │
│  ├── 12. Alianza empresas combustible (tú negocias,         │
│  │     yo pongo el banner/sistema de cupones)               │
│  ├── 13. Alianza tarjetas de crédito (tú negocias,          │
│  │     yo integro la pasarela)                              │
│  └── 14. Alianza aseguradoras (tú negocias, yo integro      │
│        el widget de seguros en cada viaje)                   │
├─────────────────────────────────────────────────────────────┤
│  YO CONSTRUYO (Técnico/Diseño/Desarrollo)                   │
│  ├── 1.  Módulo IA de noticias de carretera                 │
│  ├── 2.  Sistema de notificaciones geolocalizadas           │
│  ├── 3.  API de verificación de identidad KYC               │
│  ├── 4.  Maps con geolocalización de usuarios y rutas       │
│  ├── 5.  Pasarela de pagos completa                         │
│  ├── 6.  Calculadora CICETAC + IA de pricing                │
│  ├── 7.  IA de content curation para alertas                │
│  ├── 7.3 Módulo de comunidad/video educativo                │
│  ├── 8.  Generador de contratos digitales + firmas          │
│  └── 10. Sistema de membresías y suscripciones              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Modelo de Monetización Definido

Basado en tu especificación: **el transportador paga antes de contactar al publicador**.

### 💰 Flujo de Ingresos

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MODELO FREEMIUM + POR USO                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐   │
│  │  PUBLICADOR │     │  APP (TÚ)   │     │   TRANSPORTADOR     │   │
│  │  (Gratis)   │     │             │     │   (Paga para ver)   │   │
│  └──────┬──────┘     └──────┬──────┘     └──────────┬──────────┘   │
│         │                   │                       │               │
│         │  1. Publica carga │                       │               │
│         │──────────────────►│                       │               │
│         │                   │                       │               │
│         │                   │◄──── 2. Busca carga ──┤               │
│         │                   │                       │               │
│         │                   │───── 3. Muestra preview ──►│          │
│         │                   │    (sin datos de contacto)│           │
│         │                   │                       │               │
│         │                   │◄──── 4. Paga comisión ──┤               │
│         │                   │    (3% o tarifa fija)   │               │
│         │                   │                       │               │
│         │                   │───── 5. Desbloquea datos ──►│          │
│         │                   │    (tel, email, chat)   │               │
│         │                   │                       │               │
│         │◄──────────────────┤  6. Contacto directo    │               │
│         │   (chat/email)    │                       │               │
│         │                   │                       │               │
└─────────────────────────────────────────────────────────────────────┘
```

### 📋 Tabla de Precios Sugerida

| Servicio | Costo | ¿Quién paga? |
|----------|-------|-------------|
| Publicar carga | **GRATIS** | Publicador |
| Ver listado de cargas | **GRATIS** | Transportador (preview limitada) |
| **Desbloquear contacto de 1 carga** | **3% del valor** o **$15.000 COP mínimo** | Transportador |
| Membresía Mensual (10 cargas) | **$99.000 COP/mes** | Transportador |
| Membresía Ilimitada | **$249.000 COP/mes** | Transportador |
| Destacar carga (publicador) | **$25.000 COP** | Publicador |
| Verificación KYC Premium | **$35.000 COP** | Cualquier usuario |
| Seguro de carga por viaje | **0.5% del valor** | Transportador (opcional) |

---

## 4. Arquitectura Técnica Propuesta

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
│  │  └────────────────────┘  │    │  │ Node-cron (tareas programadas)    │  │  │
│  │                          │    │  └─────────────────────────────────┘  │  │
│  │  ┌────────────────────┐  │    │  ┌─────────────────────────────────┐  │  │
│  │  │ SERVICIOS EXTERNOS │  │    │  │ SERVICIOS EXTERNOS (Backend)    │  │  │
│  │  │ - Mapbox/Google    │  │    │  │ - CICETAC API (MinTransporte)   │  │  │
│  │  │ - Push Notifications│  │   │  │ - RNEC (Registraduría)          │  │  │
│  │  │ - Video streaming  │  │    │  │ - Pasarela Pagos (PSE/Tarjeta)  │  │  │
│  │  └────────────────────┘  │    │  │ - Email/SMS (SendGrid/Twilio)   │  │  │
│  └──────────────────────────┘    │  │ - AI News (OpenAI/Perplexity)   │  │  │
│                                  │  └─────────────────────────────────┘  │  │
│                                  └───────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │   INFRAESTRUCTURA                                                   │    │
│  │   Docker + Docker Compose │ Nginx │ PostgreSQL 16 │ Redis │ MinIO   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Esquema de Base de Datos (Prisma)

### Modelos Principales

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

enum EstadoVerificacion {
  PENDIENTE
  EN_PROCESO
  VERIFICADO
  RECHAZADO
}

enum TipoMembresia {
  GRATIS
  BASICA      // 10 cargas/mes
  ILIMITADA   // Cargas ilimitadas
}

enum TipoNoticia {
  ACCIDENTE
  CIERRE_VIA
  VIA_LIBRE
  OPORTUNIDAD_CARGA
  ALERTA_SEGURIDAD
  CONDICION_CLIMA
}

// ─── USUARIOS Y AUTENTICACIÓN ─────────────────────────

model Usuario {
  id                Int       @id @default(autoincrement())
  email             String    @unique
  passwordHash      String    @map("password_hash")
  tipo              TipoUsuario
  activo            Boolean   @default(true)
  emailVerificado   Boolean   @default(false) @map("email_verificado")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  publicador        Publicador?
  transportador     Transportador?
  admin             Admin?
  sessions          Session[]
  refreshTokens     RefreshToken[]
  notificaciones    Notificacion[]

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
  id                Int       @id @default(autoincrement())
  usuarioId         Int       @unique @map("usuario_id")
  tipoPublicador    String    @map("tipo_publicador")
  nombre            String
  documento         String    @unique
  telefono          String
  direccion         String?
  ciudad            String
  departamento      String
  latitud           Decimal?  @db.Decimal(10, 8)
  longitud          Decimal?  @db.Decimal(11, 8)
  calificacion      Decimal?  @db.Decimal(3, 2) @default(5.00)
  totalCalificaciones Int     @default(0) @map("total_calificaciones")
  verificacion      EstadoVerificacion @default(PENDIENTE)
  verificadoAt      DateTime? @map("verificado_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  usuario           Usuario   @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  cargas            Carga[]
  ventas            Venta[]

  @@map("publicadores")
}

// ─── TRANSPORTADOR ────────────────────────────────────

model Transportador {
  id                Int       @id @default(autoincrement())
  usuarioId         Int       @unique @map("usuario_id")
  nombre            String
  documento         String    @unique
  telefono          String
  email             String
  direccion         String?
  ciudad            String
  departamento      String
  licenciaConduccion String   @map("licencia_conduccion")
  certificadoSalud  Boolean   @default(false) @map("certificado_salud")
  soatVigente       Boolean   @default(false) @map("soat_vigente")
  saldoAFavor       Decimal   @default(0) @db.Decimal(12, 2) @map("saldo_a_favor")
  calificacion      Decimal?  @db.Decimal(3, 2) @default(5.00)
  totalCalificaciones Int     @default(0) @map("total_calificaciones")
  latitudActual     Decimal?  @db.Decimal(10, 8) @map("latitud_actual")
  longitudActual    Decimal?  @db.Decimal(11, 8) @map("longitud_actual")
  ultimaUbicacionAt DateTime? @map("ultima_ubicacion_at")
  disponible        Boolean   @default(true)
  verificacion      EstadoVerificacion @default(PENDIENTE)
  verificadoAt      DateTime? @map("verificado_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  usuario           Usuario   @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  vehiculos         Vehiculo[]
  ofertas           Oferta[]
  viajes            Viaje[]
  membresia         Membresia?
  pagosDesbloqueo   PagoDesbloqueo[]

  @@map("transportadores")
}

// ─── MEMBRESÍA ────────────────────────────────────────

model Membresia {
  id              Int           @id @default(autoincrement())
  transportadorId Int           @unique @map("transportador_id")
  tipo            TipoMembresia
  cargasRestantes Int           @default(0) @map("cargas_restantes")
  activa          Boolean       @default(true)
  fechaInicio     DateTime      @map("fecha_inicio")
  fechaFin        DateTime      @map("fecha_fin")
  renovacionAuto  Boolean       @default(true) @map("renovacion_auto")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  transportador   Transportador @relation(fields: [transportadorId], references: [id], onDelete: Cascade)
  facturas        FacturaMembresia[]

  @@map("membresias")
}

model FacturaMembresia {
  id            Int       @id @default(autoincrement())
  membresiaId   Int       @map("membresia_id")
  monto         Decimal   @db.Decimal(12, 2)
  metodoPago    String    @map("metodo_pago")
  estado        String    @default("PENDIENTE")
  pagadoAt      DateTime? @map("pagado_at")
  createdAt     DateTime  @default(now()) @map("created_at")

  membresia     Membresia @relation(fields: [membresiaId], references: [id], onDelete: Cascade)

  @@map("facturas_membresia")
}

// ─── VEHÍCULO ─────────────────────────────────────────

model Vehiculo {
  id                    Int           @id @default(autoincrement())
  transportadorId       Int           @map("transportador_id")
  placa                 String        @unique
  tipo                  TipoVehiculo
  marca                 String
  modelo                String
  anno                  Int
  capacidadToneladas    Decimal       @db.Decimal(5, 2) @map("capacidad_toneladas")
  capacidadVolumen      Decimal       @db.Decimal(5, 2) @map("capacidad_volumen")
  fotoUrl               String?       @map("foto_url")
  tarjetaPropiedadUrl   String?       @map("tarjeta_propiedad_url")
  soatUrl               String?       @map("soat_url")
  revisionTecnomecanicaUrl String?    @map("revision_tecnomecanica_url")
  estado                EstadoVehiculo @default(ACTIVO)
  gpsActivo             Boolean       @default(false) @map("gps_activo")
  createdAt             DateTime      @default(now()) @map("created_at")
  updatedAt             DateTime      @updatedAt @map("updated_at")

  transportador         Transportador @relation(fields: [transportadorId], references: [id], onDelete: Cascade)
  viajes                Viaje[]

  @@map("vehiculos")
}

// ─── CARGA ────────────────────────────────────────────

model Carga {
  id                    Int             @id @default(autoincrement())
  publicadorId          Int             @map("publicador_id")
  titulo                String
  descripcion           String?
  toneladas             Decimal         @db.Decimal(8, 2)
  volumen               Decimal         @db.Decimal(8, 2)
  tipoCarga             String          @map("tipo_carga")
  origenCiudad          String          @map("origen_ciudad")
  origenDepartamento    String          @map("origen_departamento")
  origenLatitud         Decimal?        @db.Decimal(10, 8) @map("origen_latitud")
  origenLongitud        Decimal?        @db.Decimal(11, 8) @map("origen_longitud")
  origenDireccion       String?         @map("origen_direccion")
  destinoCiudad         String          @map("destino_ciudad")
  destinoDepartamento   String          @map("destino_departamento")
  destinoLatitud        Decimal?        @db.Decimal(10, 8) @map("destino_latitud")
  destinoLongitud       Decimal?        @db.Decimal(11, 8) @map("destino_longitud")
  destinoDireccion      String?         @map("destino_direccion")
  distanciaKm           Decimal?        @db.Decimal(8, 2) @map("distancia_km")
  precio                Decimal         @db.Decimal(12, 2)
  comisionPorcentaje    Decimal         @default(3.00) @db.Decimal(4, 2) @map("comision_porcentaje")
  tarifaCicetac         Decimal?        @db.Decimal(12, 2) @map("tarifa_cicetac")
  precioSugeridoIA      Decimal?        @db.Decimal(12, 2) @map("precio_sugerido_ia")
  fechaCarga            DateTime        @map("fecha_carga")
  fechaEntregaEstimada  DateTime?       @map("fecha_entrega_estimada")
  tipoPublicacion       TipoPublicacion @map("tipo_publicacion")
  estado                EstadoCarga     @default(DISPONIBLE)
  requiereRefrigeracion Boolean         @default(false) @map("requiere_refrigeracion")
  requiereCargaPeligrosa Boolean        @default(false) @map("requiere_carga_peligrosa")
  destacada             Boolean         @default(false)
  contactoDesbloqueado  Boolean         @default(false) @map("contacto_desbloqueado")
  desbloqueadoPor       Int?            @map("desbloqueado_por")
  fotos                 CargaFoto[]
  createdAt             DateTime        @default(now()) @map("created_at")
  updatedAt             DateTime        @updatedAt @map("updated_at")

  publicador            Publicador      @relation(fields: [publicadorId], references: [id], onDelete: Cascade)
  ofertas               Oferta[]
  viaje                 Viaje?
  pagosDesbloqueo       PagoDesbloqueo[]

  @@index([estado, tipoPublicacion])
  @@index([origenCiudad, destinoCiudad])
  @@index([precio])
  @@index([fechaCarga])
  @@index([destacada])
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

// ─── PAGO DE DESBLOQUEO (MONETIZACIÓN CORE) ───────────

model PagoDesbloqueo {
  id                Int       @id @default(autoincrement())
  cargaId           Int       @map("carga_id")
  transportadorId   Int       @map("transportador_id")
  monto             Decimal   @db.Decimal(12, 2)
  metodoPago        String    @map("metodo_pago")
  referencia        String?
  comprobanteUrl    String?   @map("comprobante_url")
  estado            String    @default("PENDIENTE") // PENDIENTE, VERIFICADO, RECHAZADO
  verificadoPor     Int?      @map("verificado_por")
  verificadoAt      DateTime? @map("verificado_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  carga             Carga     @relation(fields: [cargaId], references: [id], onDelete: Cascade)
  transportador     Transportador @relation(fields: [transportadorId], references: [id], onDelete: Cascade)

  @@unique([cargaId, transportadorId])
  @@map("pagos_desbloqueo")
}

// ─── OFERTA ───────────────────────────────────────────

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

// ─── VIAJE ────────────────────────────────────────────

model Viaje {
  id                    Int       @id @default(autoincrement())
  cargaId               Int       @unique @map("carga_id")
  transportadorId       Int       @map("transportador_id")
  vehiculoId            Int       @map("vehiculo_id")
  precioFinal           Decimal   @db.Decimal(12, 2) @map("precio_final")
  comision              Decimal   @db.Decimal(12, 2)
  estado                String    // PENDIENTE_PAGO, PAGADO, EN_CURSO, COMPLETADO
  fechaInicio           DateTime? @map("fecha_inicio")
  fechaEntregaReal      DateTime? @map("fecha_entrega_real")
  codigoConfirmacionEntrega String? @map("codigo_confirmacion_entrega")
  firmaEntregaUrl       String?   @map("firma_entrega_url")
  fotoEntregaUrl        String?   @map("foto_entrega_url")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  carga                 Carga     @relation(fields: [cargaId], references: [id], onDelete: Cascade)
  transportador         Transportador @relation(fields: [transportadorId], references: [id], onDelete: Cascade)
  vehiculo              Vehiculo  @relation(fields: [vehiculoId], references: [id])
  trackingEvents        TrackingEvent[]
  pagos                 Pago[]
  documentos            DocumentoViaje[]

  @@map("viajes")
}

// ─── DOCUMENTOS DEL VIAJE (CONTRATOS DIGITALES) ───────

model DocumentoViaje {
  id          Int       @id @default(autoincrement())
  viajeId     Int       @map("viaje_id")
  tipo        String    // CONTRATO_TRANSPORTE, POLIZA_SEGURO, CARTA_PORTE
  url         String
  firmadoPorPublicador  Boolean @default(false) @map("firmado_por_publicador")
  firmadoPorTransportador Boolean @default(false) @map("firmado_por_transportador")
  createdAt   DateTime  @default(now()) @map("created_at")

  viaje       Viaje     @relation(fields: [viajeId], references: [id], onDelete: Cascade)

  @@map("documentos_viaje")
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
  tipo          String    // COMISION, TRANSPORTE, ADICIONAL, MEMBRESIA
  metodo        String?   // TRANSFERENCIA, EFECTY, PSE, TARJETA
  referencia    String?
  comprobanteUrl String?  @map("comprobante_url")
  estado        String    @default("PENDIENTE")
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
  tipo        String
  titulo      String
  mensaje     String
  leida       Boolean  @default(false)
  data        Json?
  createdAt   DateTime @default(now()) @map("created_at")

  usuario     Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  @@index([usuarioId, leida])
  @@map("notificaciones")
}

// ─── NOTICIAS DE CARRETERA (IA + GEOLOCALIZACIÓN) ─────

model NoticiaCarretera {
  id          Int       @id @default(autoincrement())
  tipo        TipoNoticia
  titulo      String
  descripcion String
  fuente      String    // URL original
  fuenteConfiable Boolean @default(false) @map("fuente_confiable")
  latitud     Decimal?  @db.Decimal(10, 8)
  longitud    Decimal?  @db.Decimal(11, 8)
  radioKm     Int?      @default(50) @map("radio_km")
  ciudad      String?
  departamento String?
  viaAfectada String?   @map("via_afectada")
  activa      Boolean   @default(true)
  verificadaPorIA Boolean @default(false) @map("verificada_por_ia")
  publishedAt DateTime  @map("published_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  @@index([tipo, activa])
  @@index([latitud, longitud])
  @@index([ciudad, departamento])
  @@map("noticias_carretera")
}

// ─── ALIANZAS / CUPONES ───────────────────────────────

model Alianza {
  id            Int       @id @default(autoincrement())
  nombre        String
  tipo          String    // COMBUSTIBLE, SEGURO, TARJETA_CREDITO, TALLER
  descripcion   String
  logoUrl       String?   @map("logo_url")
  beneficio     String
  codigoCupon   String?   @map("codigo_cupon")
  descuentoPorcentaje Decimal? @db.Decimal(5, 2) @map("descuento_porcentaje")
  activa        Boolean   @default(true)
  fechaInicio   DateTime  @map("fecha_inicio")
  fechaFin      DateTime? @map("fecha_fin")
  createdAt     DateTime  @default(now()) @map("created_at")

  @@map("alianzas")
}

// ─── CUPONES REDIMIDOS ────────────────────────────────

model CuponRedimido {
  id            Int       @id @default(autoincrement())
  alianzaId     Int       @map("alianza_id")
  transportadorId Int     @map("transportador_id")
  codigoUsado   String    @map("codigo_usado")
  redimidoAt    DateTime  @map("redimido_at")

  @@map("cupones_redimidos")
}
```

---

## 6. Nuevas Funcionalidades por Fase

### Fase 1: Fundación (Semanas 1-2)
- ✅ Setup monorepo
- ✅ BD PostgreSQL con Prisma
- ✅ API auth completa (registro, login, JWT, refresh tokens)
- ✅ Registro de Publicadores y Transportadores
- ✅ Verificación básica de email

### Fase 2: Core + Monetización (Semanas 3-5)
- ✅ CRUD Cargas con geolocalización
- ✅ Listado público con preview limitada
- ✅ **🔒 SISTEMA DE PAGO PARA DESBLOQUEO** (TU REQUERIMIENTO CLAVE)
- ✅ Pasarela de pagos (PSE, Tarjeta, Efecty)
- ✅ Membresías mensuales (Básica / Ilimitada)
- ✅ Sistema de ofertas y asignación

### Fase 3: CICETAC + IA Pricing (Semanas 6-7)
- ✅ **Integración CICETAC** — tarifa de referencia oficial
- ✅ **Calculadora inteligente** — sugiere precio basado en:
  - Tarifa CICETAC
  - Distancia real (Mapbox Directions)
  - Tipo de vehículo
  - Tipo de carga
  - Demanda de la zona (IA)
- ✅ Contratos digitales auto-generados

### Fase 4: GPS + Chat + Tracking (Semanas 8-9)
- ✅ Tracking GPS en tiempo real
- ✅ Chat integrado transportador-publicador
- ✅ Notificaciones push
- ✅ Código OTP de entrega + firma digital

### Fase 5: IA Noticias + Comunidad (Semanas 10-11)
- ✅ **Módulo IA de noticias de carretera**
- ✅ Scraping + IA (OpenAI/Perplexity) para verificar noticias
- ✅ Notificaciones geolocalizadas: "Accidente en la vía Bogotá-Medellín km 45"
- ✅ Feed de oportunidades de carga por zona
- ✅ Sistema de comunidad / videos educativos

### Fase 6: Alianzas + Polish (Semanas 12-13)
- ✅ Módulo de alianzas (combustible, seguros, tarjetas)
- ✅ Dashboard analítico completo
- ✅ App PWA lista para móvil
- ✅ Testing E2E

---

## 7. Integración CICETAC (MinTransporte)

### ¿Qué es CICETAC?
El **Sistema de Información para el Cálculo de Tarifas de Transporte de Carga por Carretera** del Ministerio de Transporte de Colombia. Es la tarifa de referencia oficial para fletes en Colombia.

### Implementación en la Plataforma

```typescript
// src/modules/cicetac/cicetac.service.ts

interface CicetacInput {
  origen: string;           // Ciudad de origen
  destino: string;          // Ciudad de destino
  toneladas: number;        // Peso en toneladas
  tipoVehiculo: TipoVehiculo;
  tipoCarga: string;        // General, Peligrosa, Perecedera
  viaIdaVuelta: boolean;    // ¿Es ida y vuelta?
}

interface CicetacResult {
  tarifaBase: number;       // COP — según tabla oficial
  tarifaPorKm: number;      // COP/km
  distanciaKm: number;      // Calculada por Mapbox
  totalEstimado: number;    // tarifaBase + (distancia × tarifaPorKm)
  fuente: 'CICETAC-2024';
}
```

### Flujo de la Calculadora

```
┌─────────────────────────────────────────────────────────────┐
│  CALCULADORA INTELIGENTE DE PRECIOS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PASO 1: Usuario ingresa origen, destino, toneladas        │
│         ↓                                                   │
│  PASO 2: Mapbox calcula distancia real en km               │
│         ↓                                                   │
│  PASO 3: CICETAC devuelve tarifa base + tarifa/km          │
│         ↓                                                   │
│  PASO 4: IA ajusta según:                                  │
│          • Demanda de la ruta (cargas disponibles)         │
│          • Tipo de carga (peligrosa = +20%)                │
│          • Urgencia (fecha próxima = +15%)                 │
│          • Clima / noticias de carretera                   │
│         ↓                                                   │
│  PASO 5: Mostramos 3 precios:                              │
│          🟢 Económico: 80% del sugerido (rápida asignación)│
│          🟡 Justo: 100% del sugerido (precio CICETAC)      │
│          🔴 Premium: 120% del sugerido (máxima ganancia)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Verificación de Identidad y Antecedentes

### Flujo KYC (Know Your Customer)

```
┌─────────────────────────────────────────────────────────────┐
│  VERIFICACIÓN DE USUARIOS — ANTI-BOT / ANTI-FRAUDE         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NIVEL 1: BÁSICO (Obligatorio para todos)                  │
│  ├── ✓ Email verificado (código OTP)                       │
│  ├── ✓ Teléfono verificado (SMS)                           │
│  └── ✓ Foto de documento subida                            │
│                                                             │
│  NIVEL 2: VERIFICADO (Obligatorio para desbloquear cargas) │
│  ├── ✓ OCR del documento (RNEC/Registraduría)              │
│  ├── ✓ Selfie con documento (reconocimiento facial)        │
│  ├── ✓ Consulta RUNT (vehículos activos)                   │
│  └── ✓ SOAT vigente verificado                             │
│                                                             │
│  NIVEL 3: PREMIUM (Badge dorado, más visibilidad)          │
│  ├── ✓ Antecedentes judiciales (consulta PJ)               │
│  ├── ✓ Certificado de salud vigente                        │
│  ├── ✓ Licencia de conducción vigente                      │
│  └── ✓ Revisión técnico-mecánica vigente                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### APIs de Verificación

| Servicio | Proveedor | Costo Aprox. |
|----------|-----------|-------------|
| Validación documento | RNEC / Verifik | ~$500 COP/consulta |
| OCR + Facial | AWS Rekognition / Face++ | ~$0.001/imagen |
| RUNT | API propia o scraping | Variable |
| Antecedentes | Rama Judicial / Consulta web | Gratuito (scraping) |

---

## 9. IA para Noticias de Carretera Geolocalizadas

### Arquitectura del Módulo

```
┌─────────────────────────────────────────────────────────────┐
│  MÓDULO IA: NOTICIAS DE CARRETERA                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FUENTES DE DATOS                                           │
│  ├── Twitter/X API (tweets geolocalizados)                 │
│  ├── Google News API (noticias de carretera Colombia)      │
│  ├── Noticias de periódicos locales (web scraping)         │
│  ├── Datos de la Policía de Carreteras                     │
│  └── Usuarios reportan (crowdsourcing verificado)          │
│                                                             │
│  PROCESAMIENTO IA (cada 15 minutos)                        │
│  ├── 1. Node-cron ejecuta scraper                          │
│  ├── 2. OpenAI GPT-4 evalúa: ¿Es real? ¿Qué tipo? ¿Dónde? │
│  ├── 3. Geocodificación: extrae ciudad/vía → lat/lng       │
│  ├── 4. Clasificación: ACCIDENTE/CIERRE/VIA_LIBRE/ALERTA   │
│  └── 5. Guarda en BD con flag "verificada_por_ia"          │
│                                                             │
│  NOTIFICACIÓN                                               │
│  ├── Socket.io emite a usuarios en radio de 50km           │
│  ├── Push notification: "⚠️ Accidente en Ruta 45, km 67"   │
│  └── Feed personalizado en el dashboard                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Alianzas Estratégicas — Soporte Técnico

### Lo que la plataforma debe tener listo para tus alianzas:

| Alianza | Feature Técnico Requerido | Estado |
|---------|--------------------------|--------|
| **Combustible** | Módulo de cupones con geolocalización de estaciones | ✅ Incluido |
| **Tarjetas de crédito** | Integración pasarela de pagos + opción de crédito | ✅ Incluido |
| **Aseguradoras** | Widget de seguro en cada viaje + generación de póliza | ✅ Incluido |
| **Talleres/mantenimiento** | Módulo de servicios con citas | 🔄 Fase 6 |
| **MinTransporte** | Badge "Aliado CICETAC" + reportes oficiales | 🔄 Fase 3 |

---

## 11. Roadmap de Implementación

| Fase | Duración | Entregables |
|------|----------|-------------|
| **Fase 1: Fundación** | Semanas 1-2 | Auth, BD, registro, login, verificación email/tel |
| **Fase 2: Core + Monetización** | Semanas 3-5 | CRUD cargas, pasarela de pagos, desbloqueo por pago, membresías |
| **Fase 3: CICETAC + Pricing IA** | Semanas 6-7 | Tarificador oficial, calculadora inteligente, contratos digitales |
| **Fase 4: GPS + Chat** | Semanas 8-9 | Tracking tiempo real, chat, notificaciones push, OTP entrega |
| **Fase 5: IA + Comunidad** | Semanas 10-11 | Noticias carretera IA, feed oportunidades, videos educativos |
| **Fase 6: Alianzas + Polish** | Semanas 12-13 | Cupones alianzas, dashboard analítico, PWA móvil, testing E2E |

---

## 12. Comparativa: Antes vs Después

| Aspecto | Antes (2021) | Después (2026) |
|---------|-------------|----------------|
| **Seguridad** | ❌ SQL Injection, passwords texto plano | ✅ Prisma ORM, bcrypt, JWT, rate limit |
| **Frontend** | ❌ AngularJS 1.6 EOL, Bootstrap 4 | ✅ React 19, Tailwind 4, animaciones |
| **Backend** | ❌ JSP monolítico, sin API | ✅ REST API limpia, modular, type-safe |
| **Monetización** | ❌ Pago manual por WhatsApp | ✅ Pasarela integrada, membresías, desbloqueo automático |
| **Tarifas** | ❌ Precio a criterio del publicador | ✅ CICETAC oficial + IA de pricing |
| **Verificación** | ❌ Ninguna | ✅ KYC 3 niveles: email → documento → antecedentes |
| **GPS/Tracking** | ❌ Ninguno | ✅ Tiempo real, ruta óptima, alertas desvío |
| **Noticias** | ❌ Ninguno | ✅ IA verifica noticias de carretera geolocalizadas |
| **Legal** | ❌ Ninguno | ✅ Contratos digitales firmados, pólizas integradas |
| **Comunidad** | ❌ Ninguno | ✅ Videos educativos, sistema de calificaciones |
| **Móvil** | ❌ App nativa costosa | ✅ PWA responsive, casi nativa |
| **DevOps** | ❌ Despliegue manual | ✅ Docker, CI/CD automático |

---

> **Nota final:** Tus apuntes son VALIOSÍSIMOS. El 60% son features técnicos que voy a construir. El 40% son estratégicos de negocio que TÚ debes gestionar (abogados, alianzas, MinTransporte), pero la plataforma ya está diseñada para soportarlos técnicamente desde el día 1.

---

*Documento generado como base técnica integral para la modernización de Descargo & Cargo 2.0.*
