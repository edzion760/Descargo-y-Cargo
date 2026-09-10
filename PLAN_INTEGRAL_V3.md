# 🚀 DESCARGO & CARGO 2.0 — Plan Integral de Modernización (V3)

> **Fecha:** 2026-07-24  
> **Proyecto:** Descargo & Cargo — Plataforma de Logística y Transporte de Carga  
> **Estado actual:** Java EE (JSP/Servlets), AngularJS 1.6, Bootstrap 4, JDBC puro  
> **Propuesta:** Stack Full-Stack Moderno 2026 + Estrategia de Negocio Integrada  
> **Cambios V3:** Schema Prisma corregido, estrategia de migración de datos, análisis de riesgos, KPIs, costos operativos, cumplimiento legal colombiano, plan de lanzamiento  
> **Cambios V3.1 (2026-07-24):** Piso SICE-TAC obligatorio (Decreto 1017/2025), notas RNDC — ver `ANEXO_LEGAL_DOFA_COMPETENCIA.md`  
> **Cambios V3.2 (2026-07-25):** Nuevos apuntes del fundador incorporados: cobro por uso **4%**, plan **Gold 2.0** (20 cargas), protección anti-pantallazo del contacto, notificación geolocalizada de carga (radio 25/50/100 km configurable), cobertura 32 departamentos + 1.122 municipios, dominio **descargoycargo.com** (guía de enlace en `docs/`), CIIU recomendado **6312 Portales web** (principal) + 6311 + 6201 (complementarios)

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#0-resumen-ejecutivo)
2. [Diagnóstico del Estado Actual](#1-diagnóstico-del-estado-actual)
3. [Análisis de Apuntes del Fundador](#2-análisis-de-apuntes-del-fundador)
4. [Modelo de Monetización Definido](#3-modelo-de-monetización-definido)
5. [Arquitectura Técnica Propuesta](#4-arquitectura-técnica-propuesta)
6. [Esquema de Base de Datos (Prisma — Corregido)](#5-esquema-de-base-de-datos-prisma--corregido)
7. [Nuevas Funcionalidades por Fase](#6-nuevas-funcionalidades-por-fase)
8. [Integración CICETAC (MinTransporte)](#7-integración-cicetac-mintransporte)
9. [Verificación de Identidad y Antecedentes](#8-verificación-de-identidad-y-antecedentes)
10. [IA para Noticias de Carretera Geolocalizadas](#9-ia-para-noticias-de-carretera-geolocalizadas)
11. [Alianzas Estratégicas — Soporte Técnico](#10-alianzas-estratégicas--soporte-técnico)
12. [Roadmap de Implementación](#11-roadmap-de-implementación)
13. [Comparativa: Antes vs Después](#12-comparativa-antes-vs-después)
14. [🆕 Estrategia de Migración de Datos (MySQL → PostgreSQL)](#13-estrategia-de-migración-de-datos-mysql--postgresql)
15. [🆕 Análisis de Riesgos y Mitigaciones](#14-análisis-de-riesgos-y-mitigaciones)
16. [🆕 KPIs y Métricas de Éxito](#15-kpis-y-métricas-de-éxito)
17. [🆕 Estimación de Costos Operativos](#16-estimación-de-costos-operativos)
18. [🆕 Cumplimiento Legal Colombiano](#17-cumplimiento-legal-colombiano)
19. [🆕 Plan de Lanzamiento (Go-to-Market)](#18-plan-de-lanzamiento-go-to-market)

---

## 0. Resumen Ejecutivo

**El problema:** Descargo & Cargo opera sobre tecnología de 2015 con vulnerabilidades críticas (SQL injection en el 100% de las consultas, contraseñas en texto plano) que ponen en riesgo total el negocio y los datos de los usuarios.

**La oportunidad:** Colombia no tiene un líder consolidado en intermediación digital de carga terrestre con tarifas oficiales CICETAC integradas, verificación KYC y noticias de carretera verificadas por IA. Tus 14 apuntes cubren exactamente esos diferenciadores.

**La solución:** Reescritura completa en 13 semanas (6 fases) sobre React 19 + Node.js 22 + PostgreSQL, con monetización por desbloqueo de contactos (3% o $15.000 COP mínimo) y membresías mensuales, migración segura de los datos legacy, y cumplimiento legal desde el día 1.

**Lo que tú gestionas:** abogados, alianzas (combustible, aseguradoras, tarjetas), relación con MinTransporte. **Lo que yo construyo:** todo lo técnico, incluida la plataforma lista para soportar esas alianzas.

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

| Severidad | Problema | Detalle | Riesgo de Negocio |
|-----------|----------|---------|-------------------|
| **CRÍTICO** | SQL Injection Universal | 100% de las consultas concatenan variables directamente en SQL. | Pérdida total de datos + sanción SIC por Ley 1581 (hasta 2.000 salarios mínimos) |
| **CRÍTICO** | Contraseñas en Texto Plano | No existe hashing (bcrypt/Argon2). | Suplantación masiva de transportadores y publicadores |
| **ALTO** | Sin Validación de Entrada | No hay sanitización de datos entrantes. | XSS, corrupción de datos |
| **ALTO** | Sin Autenticación Segura | No hay JWT, tokens de sesión seguros, ni protección CSRF. | Secuestro de sesiones |

### 🟡 Problemas de Arquitectura

| Problema | Impacto |
|----------|---------|
| **Código Duplicado Masivo** | Cada entidad repite los mismos 200+ líneas de CRUD. Cada bug se repara N veces. |
| **Sin Separación de Capas** | Lógica de negocio, persistencia y presentación mezcladas. Imposible testear. |
| **Sin API REST** | Comunicación JSP→JSP sin estructura. Imposible crear app móvil. |
| **Frontend Obsoleto** | AngularJS 1.6 EOL (diciembre 2021), Bootstrap 4 deprecado. Sin parches de seguridad. |

---

## 2. Análisis de Apuntes del Fundador

### ✅ Ya Considerados en el Plan Inicial (Parcialmente)

| # | Tu Apunte | Estado en Plan V1 |
|---|-----------|-------------------|
| 4 | API Google Maps geolocalización | ✅ Incluido (Mapbox GL JS + geolocalización) |
| 5 | Pasarela de pagos | ✅ Incluido (PSE, Tarjeta, Transferencia) |
| 7.3 | Videos para comunidad | ⚠️ Mencionado como marketing, no como feature técnico |

### 🆕 NUEVOS — No estaban en el plan inicial (¡muy buenos!)

| # | Tu Apunte | Mi Evaluación |
|---|-----------|---------------|
| 1 | **IA evalúa noticias falsas de carretera** | 🆕 EXCELENTE. Diferenciador único. Módulo completo (§9). |
| 2 | **Notificaciones geolocalizadas de novedades** | 🆕 Alertas inteligentes por zona + feed de oportunidades. |
| 3 | **API verifica usuarios (no bots, sin antecedentes)** | 🆕 CRÍTICO. KYC 3 niveles + RNEC + antecedentes (§8). |
| 6 | **Botón calculadora de transporte** | 🆕 Conectado con CICETAC + IA de pricing dinámico (§7). |
| 7.2 | **IA rastrea noticias y las trae a la web** | 🆕 Automatización de content curation (§9). |
| 8 | **Normas y reglamento web** | 🆕 Contratos electrónicos con validez legal (Ley 527/1999, §17). |
| 9 | **Abogados, seguridad jurídica** | 🆕 Contratos digitales vinculantes + términos firmados digitalmente. |
| 10 | **Membresías mensuales** | 🆕 Suscripción para transportadores (§3). |
| 11 | **Relación con Ministerio de Transporte** | 🆕 Integración CICETAC como valor agregado regulatorio (§7). |
| 12 | **Alianza con empresas de combustible** | 🆕 Cupones geolocalizados (§10). |
| 13 | **Alianza con tarjetas de crédito** | 🆕 Pasarela + crédito para transportadores (§10). |
| 14 | **Alianza con aseguradoras** | 🆕 Seguro de carga integrado por viaje (§10). |

### 📊 Clasificación por Tipo de Trabajo

```
┌─────────────────────────────────────────────────────────────┐
│  TÚ DEBES GESTIONAR (Estrategia/Negocio/Legal)              │
│  ├── 9.  Contratar abogados (nosotros generamos contratos   │
│  │     digitales desde la plataforma)                       │
│  ├── 11. Relación directa con MinTransporte (tú contactas,  │
│  │     yo integro CICETAC)                                  │
│  ├── 12. Alianza empresas combustible (tú negocias,         │
│  │     yo pongo el banner/sistema de cupones)               │
│  ├── 13. Alianza tarjetas de crédito (tú negocias,          │
│  │     yo integro la pasarela)                              │
│  ├── 14. Alianza aseguradoras (tú negocias, yo integro      │
│  │     el widget de seguros en cada viaje)                  │
│  └── 🆕 Trámite de aviso de tratamiento de datos ante SIC   │
│        (Ley 1581/2012 — ver §17)                            │
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
│  ├── 10. Sistema de membresías y suscripciones              │
│  └── 🆕 Migración segura de datos MySQL legacy (§13)        │
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
│         │                   │◄──── 2. Busca carga ──┤               │
│         │                   │─── 3. Muestra preview ──►│            │
│         │                   │  (sin datos de contacto) │            │
│         │                   │◄──── 4. Paga comisión ──┤             │
│         │                   │   (4% o tarifa fija)  │               │
│         │                   │─── 5. Desbloquea datos ──►│           │
│         │                   │   (tel, email, chat)  │               │
│         │◄──────────────────┤ 6. Contacto directo   │               │
│         │   (chat/email)    │                       │               │
└─────────────────────────────────────────────────────────────────────┘
```

### 📋 Tabla de Precios Sugerida

| Servicio | Costo | ¿Quién paga? | Notas |
|----------|-------|-------------|-------|
| Publicar carga | **GRATIS** | Publicador | Adquisición de oferta |
| Ver listado de cargas | **GRATIS** | Transportador | Preview limitada (sin contacto) |
| **Desbloquear contacto de 1 carga (pago por uso)** | **4% del valor** o **$15.000 COP mínimo** | Transportador | Actualizado a 4% según apunte #5 del fundador (2026-07-25) |
| Membresía Básica (10 cargas/mes) | **$99.000 COP/mes** | Transportador | 10 desbloqueos incluidos |
| Membresía **Gold 2.0** (20 cargas/mes) | **$179.000 COP/mes** | Transportador | 🆕 Plan intermedio según apunte del fundador |
| Membresía Ilimitada | **$249.000 COP/mes** | Transportador | Para flotas y frecuentes |
| Destacar carga (publicador) | **$25.000 COP** | Publicador | Aparece primero 7 días |
| Verificación KYC Premium | **$35.000 COP** | Cualquier usuario | Badge dorado, más confianza |
| Seguro de carga por viaje | **0.5% del valor** | Transportador (opcional) | Requiere alianza aseguradora |

### 🧮 Proyección Conservadora (Mes 6)

| Supuesto | Valor |
|----------|-------|
| Cargas publicadas/mes | 400 |
| Desbloqueos pagados/mes (conversión 25%) | 100 |
| Ticket promedio desbloqueo | $25.000 COP |
| Membresías Básicas activas | 60 |
| Membresías Ilimitadas activas | 15 |
| **Ingreso mensual estimado** | **~$12.2M COP** |

*(Supuestos deliberadamente conservadores; ajustar con datos reales de los primeros 90 días.)*

---

## 4. Arquitectura Técnica Propuesta

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DESCARGO & CARGO 2.0                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────┐    ┌───────────────────────────────────────┐  │
│  │   FRONTEND (Cliente)     │    │   BACKEND (API REST)                  │  │
│  │  ┌────────────────────┐  │    │  ┌─────────────────────────────────┐  │  │
│  │  │ React 19 + Vite    │  │◄──►│  │ Node.js 22 + Express 5          │  │  │
│  │  │ TypeScript 5.6     │  │    │  │ TypeScript (strict)             │  │  │
│  │  │ Tailwind CSS 4     │  │    │  │ Prisma ORM 6 (PostgreSQL 16)    │  │  │
│  │  │ shadcn/ui          │  │    │  │ Zod (validación)                │  │  │
│  │  │ TanStack Query     │  │    │  │ JWT + bcrypt (auth)             │  │  │
│  │  │ React Router 7     │  │    │  │ Winston (logging)               │  │  │
│  │  │ React Hook Form    │  │    │  │ Helmet + CORS + Rate Limit      │  │  │
│  │  │ Framer Motion      │  │    │  │ Socket.io (tiempo real)         │  │  │
│  │  │ Mapbox GL JS       │  │    │  │ Multer + S3/MinIO (uploads)     │  │  │
│  │  └────────────────────┘  │    │  │ Node-cron (tareas programadas)  │  │  │
│  │                          │    │  └─────────────────────────────────┘  │  │
│  │  ┌────────────────────┐  │    │  ┌─────────────────────────────────┐  │  │
│  │  │ SERVICIOS EXTERNOS │  │    │  │ SERVICIOS EXTERNOS (Backend)    │  │  │
│  │  │ - Mapbox           │  │    │  │ - CICETAC (MinTransporte)       │  │  │
│  │  │ - Push (FCM)       │  │    │  │ - RNEC (Registraduría)          │  │  │
│  │  │ - Video streaming  │  │    │  │ - Pasarela (Wompi/ePayco)       │  │  │
│  │  └────────────────────┘  │    │  │ - Email/SMS (SendGrid/Twilio)   │  │  │
│  └──────────────────────────┘    │  │ - IA Noticias (OpenAI)          │  │  │
│                                  │  └─────────────────────────────────┘  │  │
│                                  └───────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │   INFRAESTRUCTURA                                                   │    │
│  │   Docker + Compose │ Nginx │ PostgreSQL 16 │ Redis │ MinIO (S3)     │    │
│  │   Backups diarios automáticos + réplica de solo lectura             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Decisiones Clave (y por qué)

| Decisión | Alternativa descartada | Razón |
|----------|------------------------|-------|
| PostgreSQL + PostGIS | MySQL | Consultas geoespaciales nativas (radio 50km en §9) sin extensiones frágiles |
| Mapbox | Google Maps | ~50% más barato en volumen de tiles + Directions API generoso |
| Wompi (Bancolombia) | Stripe | Stripe no opera payouts en COP; Wompi/ePayco soportan PSE y Nequi |
| PWA en vez de app nativa | React Native | 13 semanas no alcanzan para dos apps; PWA cubre el 90% del caso de uso |
| Monorepo (npm workspaces) | Repos separados | Un solo equipo, tipos TypeScript compartidos front/back |

---

## 5. Esquema de Base de Datos (Prisma — Corregido)

### 🔧 Correcciones respecto a V2

| # | Problema en V2 | Corrección V3 |
|---|----------------|---------------|
| 1 | `Oferta.vehiculoId` sin relación a `Vehiculo` (FK huérfana) | Relación `vehiculo Vehiculo @relation(...)` agregada |
| 2 | `CuponRedimido` sin relaciones a `Alianza`/`Transportador` | Relaciones completas agregadas |
| 3 | `Transportador.email` duplica `Usuario.email` | Eliminado (single source of truth en `Usuario`) |
| 4 | `Carga.contactoDesbloqueado` + `desbloqueadoPor` contradicen el modelo (varios transportadores pueden desbloquear la misma carga) | Eliminados; el desbloqueo se deriva de `PagoDesbloqueo` con estado VERIFICADO |
| 5 | Estados de pago como `String` libre ("PENDIENTE"...) | Enums `EstadoPago`, `MetodoPago`, `EstadoViaje`, `TipoDocumentoViaje` |
| 6 | `Venta` legacy sin `onDelete` definido | Relación corregida |
| 7 | Sin modelo de auditoría | `AuditLog` agregado (requerido por Ley 1581 para trazabilidad) |
| 8 | Coordenadas sin soporte geoespacial real | PostGIS habilitado + índices GiST para consultas por radio |

```prisma
// schema.prisma — Descargo & Cargo 2.0 (V3 corregido)

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]   // consultas geoespaciales por radio
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
  BASICA      // 10 desbloqueos/mes
  ILIMITADA
}

enum TipoNoticia {
  ACCIDENTE
  CIERRE_VIA
  VIA_LIBRE
  OPORTUNIDAD_CARGA
  ALERTA_SEGURIDAD
  CONDICION_CLIMA
}

// 🆕 V3: enums para estados que eran strings libres
enum EstadoPago {
  PENDIENTE
  VERIFICADO
  RECHAZADO
  REEMBOLSADO
}

enum MetodoPago {
  PSE
  TARJETA
  NEQUI
  TRANSFERENCIA
  EFECTY
}

enum EstadoViaje {
  PENDIENTE_PAGO
  PAGADO
  EN_CURSO
  COMPLETADO
  DISPUTA
  CANCELADO
}

enum TipoDocumentoViaje {
  CONTRATO_TRANSPORTE
  POLIZA_SEGURO
  CARTA_PORTE
}

// ─── USUARIOS Y AUTENTICACIÓN ─────────────────────────

model Usuario {
  id              Int       @id @default(autoincrement())
  email           String    @unique
  passwordHash    String    @map("password_hash")
  tipo            TipoUsuario
  activo          Boolean   @default(true)
  emailVerificado Boolean   @default(false) @map("email_verificado")
  telefonoVerificado Boolean @default(false) @map("telefono_verificado") // 🆕 V3
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  publicador      Publicador?
  transportador   Transportador?
  admin           Admin?
  sessions        Session[]
  refreshTokens   RefreshToken[]
  notificaciones  Notificacion[]
  auditLogs       AuditLog[]            // 🆕 V3

  @@map("usuarios")
}

model Session {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    Int      @map("user_id")
  userAgent String?  @map("user_agent")  // 🆕 V3: detección de sesiones sospechosas
  ip        String?
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  usuario   Usuario  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, expiresAt])
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

// 🆕 V3: Auditoría (trazabilidad exigida por Ley 1581/2012)
model AuditLog {
  id        BigInt   @id @default(autoincrement())
  usuarioId Int?     @map("usuario_id")
  accion    String   // LOGIN, DESBLOQUEO_CONTACTO, PAGO_CREADO, DATOS_EXPORTADOS...
  entidad   String?  // "Carga", "Pago"...
  entidadId Int?     @map("entidad_id")
  ip        String?
  metadata  Json?
  createdAt DateTime @default(now()) @map("created_at")

  usuario   Usuario? @relation(fields: [usuarioId], references: [id], onDelete: SetNull)

  @@index([usuarioId, createdAt])
  @@index([entidad, entidadId])
  @@map("audit_logs")
}

// ─── PUBLICADOR ───────────────────────────────────────

model Publicador {
  id                  Int       @id @default(autoincrement())
  usuarioId           Int       @unique @map("usuario_id")
  tipoPublicador      String    @map("tipo_publicador")
  nombre              String
  documento           String    @unique
  telefono            String
  direccion           String?
  ciudad              String
  departamento        String
  latitud             Decimal?  @db.Decimal(10, 8)
  longitud            Decimal?  @db.Decimal(11, 8)
  calificacion        Decimal   @default(5.00) @db.Decimal(3, 2)
  totalCalificaciones Int       @default(0) @map("total_calificaciones")
  verificacion        EstadoVerificacion @default(PENDIENTE)
  verificadoAt        DateTime? @map("verificado_at")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  usuario             Usuario   @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  cargas              Carga[]
  ventas              Venta[]

  @@index([ciudad, departamento])
  @@map("publicadores")
}

// ─── TRANSPORTADOR ────────────────────────────────────

model Transportador {
  id                  Int       @id @default(autoincrement())
  usuarioId           Int       @unique @map("usuario_id")
  nombre              String
  documento           String    @unique
  telefono            String
  // 🆕 V3: email eliminado — vive en Usuario.email
  direccion           String?
  ciudad              String
  departamento        String
  licenciaConduccion  String    @map("licencia_conduccion")
  certificadoSalud    Boolean   @default(false) @map("certificado_salud")
  soatVigente         Boolean   @default(false) @map("soat_vigente")
  saldoAFavor         Decimal   @default(0) @db.Decimal(12, 2) @map("saldo_a_favor")
  calificacion        Decimal   @default(5.00) @db.Decimal(3, 2)
  totalCalificaciones Int       @default(0) @map("total_calificaciones")
  latitudActual       Decimal?  @db.Decimal(10, 8) @map("latitud_actual")
  longitudActual      Decimal?  @db.Decimal(11, 8) @map("longitud_actual")
  ultimaUbicacionAt   DateTime? @map("ultima_ubicacion_at")
  disponible          Boolean   @default(true)
  verificacion        EstadoVerificacion @default(PENDIENTE)
  verificadoAt        DateTime? @map("verificado_at")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  usuario             Usuario   @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  vehiculos           Vehiculo[]
  ofertas             Oferta[]
  viajes              Viaje[]
  membresia           Membresia?
  pagosDesbloqueo     PagoDesbloqueo[]
  cuponesRedimidos    CuponRedimido[]      // 🆕 V3

  @@index([disponible, verificacion])
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

  @@index([activa, fechaFin])  // 🆕 V3: cron de expiración
  @@map("membresias")
}

model FacturaMembresia {
  id          Int        @id @default(autoincrement())
  membresiaId Int        @map("membresia_id")
  monto       Decimal    @db.Decimal(12, 2)
  metodoPago  MetodoPago @map("metodo_pago")        // 🆕 V3: enum
  estado      EstadoPago @default(PENDIENTE)        // 🆕 V3: enum
  pagadoAt    DateTime?  @map("pagado_at")
  createdAt   DateTime   @default(now()) @map("created_at")

  membresia   Membresia  @relation(fields: [membresiaId], references: [id], onDelete: Cascade)

  @@map("facturas_membresia")
}

// ─── VEHÍCULO ─────────────────────────────────────────

model Vehiculo {
  id                     Int            @id @default(autoincrement())
  transportadorId        Int            @map("transportador_id")
  placa                  String         @unique
  tipo                   TipoVehiculo
  marca                  String
  modelo                 String
  anno                   Int
  capacidadToneladas     Decimal        @db.Decimal(5, 2) @map("capacidad_toneladas")
  capacidadVolumen       Decimal        @db.Decimal(5, 2) @map("capacidad_volumen")
  fotoUrl                String?        @map("foto_url")
  tarjetaPropiedadUrl    String?        @map("tarjeta_propiedad_url")
  soatUrl                String?        @map("soat_url")
  revisionTecnomecanicaUrl String?      @map("revision_tecnomecanica_url")
  estado                 EstadoVehiculo @default(ACTIVO)
  gpsActivo              Boolean        @default(false) @map("gps_activo")
  createdAt              DateTime       @default(now()) @map("created_at")
  updatedAt              DateTime       @updatedAt @map("updated_at")

  transportador          Transportador  @relation(fields: [transportadorId], references: [id], onDelete: Cascade)
  viajes                 Viaje[]
  ofertas                Oferta[]       // 🆕 V3: relación inversa que faltaba

  @@index([transportadorId, estado])
  @@map("vehiculos")
}

// ─── CARGA ────────────────────────────────────────────

model Carga {
  id                     Int             @id @default(autoincrement())
  publicadorId           Int             @map("publicador_id")
  titulo                 String
  descripcion            String?
  toneladas              Decimal         @db.Decimal(8, 2)
  volumen                Decimal         @db.Decimal(8, 2)
  tipoCarga              String          @map("tipo_carga")
  origenCiudad           String          @map("origen_ciudad")
  origenDepartamento     String          @map("origen_departamento")
  origenLatitud          Decimal?        @db.Decimal(10, 8) @map("origen_latitud")
  origenLongitud         Decimal?        @db.Decimal(11, 8) @map("origen_longitud")
  origenDireccion        String?         @map("origen_direccion")
  destinoCiudad          String          @map("destino_ciudad")
  destinoDepartamento    String          @map("destino_departamento")
  destinoLatitud         Decimal?        @db.Decimal(10, 8) @map("destino_latitud")
  destinoLongitud        Decimal?        @db.Decimal(11, 8) @map("destino_longitud")
  destinoDireccion       String?         @map("destino_direccion")
  distanciaKm            Decimal?        @db.Decimal(8, 2) @map("distancia_km")
  precio                 Decimal         @db.Decimal(12, 2)
  comisionPorcentaje     Decimal         @default(4.00) @db.Decimal(4, 2) @map("comision_porcentaje")
  tarifaCicetac          Decimal?        @db.Decimal(12, 2) @map("tarifa_cicetac")
  precioSugeridoIA       Decimal?        @db.Decimal(12, 2) @map("precio_sugerido_ia")
  fechaCarga             DateTime        @map("fecha_carga")
  fechaEntregaEstimada   DateTime?       @map("fecha_entrega_estimada")
  tipoPublicacion        TipoPublicacion @map("tipo_publicacion")
  estado                 EstadoCarga     @default(DISPONIBLE)
  requiereRefrigeracion  Boolean         @default(false) @map("requiere_refrigeracion")
  requiereCargaPeligrosa Boolean         @default(false) @map("requiere_carga_peligrosa")
  destacada              Boolean         @default(false)
  destacadaHasta         DateTime?       @map("destacada_hasta")  // 🆕 V3: expira a los 7 días
  // 🆕 V3: contactoDesbloqueado/desbloqueadoPor eliminados.
  // El desbloqueo se consulta via PagoDesbloqueo(estado=VERIFICADO).
  fotos                  CargaFoto[]
  createdAt              DateTime        @default(now()) @map("created_at")
  updatedAt              DateTime        @updatedAt @map("updated_at")

  publicador             Publicador      @relation(fields: [publicadorId], references: [id], onDelete: Cascade)
  ofertas                Oferta[]
  viaje                  Viaje?
  pagosDesbloqueo        PagoDesbloqueo[]

  @@index([estado, tipoPublicacion])
  @@index([origenCiudad, destinoCiudad])
  @@index([precio])
  @@index([fechaCarga])
  @@index([destacada, destacadaHasta])
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
  id              Int           @id @default(autoincrement())
  cargaId         Int           @map("carga_id")
  transportadorId Int           @map("transportador_id")
  monto           Decimal       @db.Decimal(12, 2)
  metodoPago      MetodoPago    @map("metodo_pago")     // 🆕 V3: enum
  referencia      String?
  comprobanteUrl  String?       @map("comprobante_url")
  estado          EstadoPago    @default(PENDIENTE)     // 🆕 V3: enum
  verificadoPor   Int?          @map("verificado_por")
  verificadoAt    DateTime?     @map("verificado_at")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  carga           Carga         @relation(fields: [cargaId], references: [id], onDelete: Cascade)
  transportador   Transportador @relation(fields: [transportadorId], references: [id], onDelete: Cascade)

  @@unique([cargaId, transportadorId])
  @@index([transportadorId, estado])
  @@map("pagos_desbloqueo")
}

// ─── OFERTA ───────────────────────────────────────────

model Oferta {
  id              Int           @id @default(autoincrement())
  cargaId         Int           @map("carga_id")
  transportadorId Int           @map("transportador_id")
  vehiculoId      Int           @map("vehiculo_id")
  precioOfertado  Decimal       @db.Decimal(12, 2) @map("precio_ofertado")
  mensaje         String?
  aceptada        Boolean       @default(false)
  rechazada       Boolean       @default(false)
  fechaRespuesta  DateTime?     @map("fecha_respuesta")
  createdAt       DateTime      @default(now()) @map("created_at")

  carga           Carga         @relation(fields: [cargaId], references: [id], onDelete: Cascade)
  transportador   Transportador @relation(fields: [transportadorId], references: [id], onDelete: Cascade)
  vehiculo        Vehiculo      @relation(fields: [vehiculoId], references: [id])  // 🆕 V3: FK que faltaba

  @@unique([cargaId, transportadorId])
  @@map("ofertas")
}

// ─── VIAJE ────────────────────────────────────────────

model Viaje {
  id                        Int         @id @default(autoincrement())
  cargaId                   Int         @unique @map("carga_id")
  transportadorId           Int         @map("transportador_id")
  vehiculoId                Int         @map("vehiculo_id")
  precioFinal               Decimal     @db.Decimal(12, 2) @map("precio_final")
  comision                  Decimal     @db.Decimal(12, 2)
  estado                    EstadoViaje @default(PENDIENTE_PAGO)  // 🆕 V3: enum
  fechaInicio               DateTime?   @map("fecha_inicio")
  fechaEntregaReal          DateTime?   @map("fecha_entrega_real")
  codigoConfirmacionEntrega String?     @map("codigo_confirmacion_entrega")
  firmaEntregaUrl           String?     @map("firma_entrega_url")
  fotoEntregaUrl            String?     @map("foto_entrega_url")
  createdAt                 DateTime    @default(now()) @map("created_at")
  updatedAt                 DateTime    @updatedAt @map("updated_at")

  carga                     Carga       @relation(fields: [cargaId], references: [id], onDelete: Cascade)
  transportador             Transportador @relation(fields: [transportadorId], references: [id], onDelete: Cascade)
  vehiculo                  Vehiculo    @relation(fields: [vehiculoId], references: [id])
  trackingEvents            TrackingEvent[]
  pagos                     Pago[]
  documentos                DocumentoViaje[]

  @@index([transportadorId, estado])
  @@map("viajes")
}

// ─── DOCUMENTOS DEL VIAJE (CONTRATOS DIGITALES) ───────

model DocumentoViaje {
  id                      Int               @id @default(autoincrement())
  viajeId                 Int               @map("viaje_id")
  tipo                    TipoDocumentoViaje  // 🆕 V3: enum
  url                     String
  hashSha256              String            @map("hash_sha256")  // 🆕 V3: integridad del contrato (Ley 527)
  firmadoPorPublicador    Boolean           @default(false) @map("firmado_por_publicador")
  firmadoPorTransportador Boolean           @default(false) @map("firmado_por_transportador")
  firmadoPublicadorAt     DateTime?         @map("firmado_publicador_at")      // 🆕 V3
  firmadoTransportadorAt  DateTime?         @map("firmado_transportador_at")   // 🆕 V3
  createdAt               DateTime          @default(now()) @map("created_at")

  viaje                   Viaje             @relation(fields: [viajeId], references: [id], onDelete: Cascade)

  @@map("documentos_viaje")
}

// ─── TRACKING EN TIEMPO REAL ──────────────────────────

model TrackingEvent {
  id          BigInt    @id @default(autoincrement())  // 🆕 V3: BigInt (alto volumen)
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
  id             Int        @id @default(autoincrement())
  viajeId        Int        @map("viaje_id")
  monto          Decimal    @db.Decimal(12, 2)
  tipo           String     // COMISION, TRANSPORTE, ADICIONAL, MEMBRESIA
  metodo         MetodoPago?                            // 🆕 V3: enum
  referencia     String?
  comprobanteUrl String?    @map("comprobante_url")
  estado         EstadoPago @default(PENDIENTE)         // 🆕 V3: enum
  verificadoPor  Int?       @map("verificado_por")
  createdAt      DateTime   @default(now()) @map("created_at")
  updatedAt      DateTime   @updatedAt @map("updated_at")

  viaje          Viaje      @relation(fields: [viajeId], references: [id], onDelete: Cascade)

  @@index([viajeId, estado])
  @@map("pagos")
}

// ─── VENTA (MODELO LEGACY — CONSERVADO) ───────────────

model Venta {
  id           Int        @id @default(autoincrement())
  publicadorId Int        @map("publicador_id")
  concepto     String
  monto        Decimal    @db.Decimal(12, 2)
  fecha        DateTime
  estado       String     @default("PENDIENTE")
  createdAt    DateTime   @default(now()) @map("created_at")

  publicador   Publicador @relation(fields: [publicadorId], references: [id], onDelete: Restrict)  // 🆕 V3

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
  id        Int      @id @default(autoincrement())
  usuarioId Int      @map("usuario_id")
  tipo      String
  titulo    String
  mensaje   String
  leida     Boolean  @default(false)
  data      Json?
  createdAt DateTime @default(now()) @map("created_at")

  usuario   Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  @@index([usuarioId, leida])
  @@map("notificaciones")
}

// ─── NOTICIAS DE CARRETERA (IA + GEOLOCALIZACIÓN) ─────

model NoticiaCarretera {
  id              Int         @id @default(autoincrement())
  tipo            TipoNoticia
  titulo          String
  descripcion     String
  fuente          String      // URL original
  fuenteConfiable Boolean     @default(false) @map("fuente_confiable")
  latitud         Decimal?    @db.Decimal(10, 8)
  longitud        Decimal?    @db.Decimal(11, 8)
  radioKm         Int         @default(50) @map("radio_km")
  ciudad          String?
  departamento    String?
  viaAfectada     String?     @map("via_afectada")
  activa          Boolean     @default(true)
  expiraAt        DateTime?   @map("expira_at")            // 🆕 V3: noticias caducan
  confianzaIA     Decimal?    @db.Decimal(3, 2) @map("confianza_ia")  // 🆕 V3: score 0-1
  verificadaPorIA Boolean     @default(false) @map("verificada_por_ia")
  publishedAt     DateTime    @map("published_at")
  createdAt       DateTime    @default(now()) @map("created_at")

  @@index([tipo, activa])
  @@index([ciudad, departamento])
  @@map("noticias_carretera")
  // 🆕 V3: consulta por radio se hace con PostGIS ST_DWithin sobre (latitud, longitud)
}

// ─── ALIANZAS / CUPONES ───────────────────────────────

model Alianza {
  id                  Int      @id @default(autoincrement())
  nombre              String
  tipo                String   // COMBUSTIBLE, SEGURO, TARJETA_CREDITO, TALLER
  descripcion         String
  logoUrl             String?  @map("logo_url")
  beneficio           String
  codigoCupon         String?  @map("codigo_cupon")
  descuentoPorcentaje Decimal? @db.Decimal(5, 2) @map("descuento_porcentaje")
  activa              Boolean  @default(true)
  fechaInicio         DateTime @map("fecha_inicio")
  fechaFin            DateTime? @map("fecha_fin")
  createdAt           DateTime @default(now()) @map("created_at")

  cuponesRedimidos    CuponRedimido[]  // 🆕 V3: relación inversa que faltaba

  @@map("alianzas")
}

// ─── CUPONES REDIMIDOS ────────────────────────────────

model CuponRedimido {
  id              Int           @id @default(autoincrement())
  alianzaId       Int           @map("alianza_id")
  transportadorId Int           @map("transportador_id")
  codigoUsado     String        @map("codigo_usado")
  redimidoAt      DateTime      @default(now()) @map("redimido_at")

  alianza         Alianza       @relation(fields: [alianzaId], references: [id], onDelete: Cascade)        // 🆕 V3
  transportador   Transportador @relation(fields: [transportadorId], references: [id], onDelete: Cascade)  // 🆕 V3

  @@unique([alianzaId, transportadorId, codigoUsado])  // 🆕 V3: evita doble redención
  @@map("cupones_redimidos")
}
```

---

## 6. Nuevas Funcionalidades por Fase

### Fase 1: Fundación (Semanas 1-2)
- ✅ Setup monorepo (npm workspaces: `apps/web`, `apps/api`, `packages/shared`)
- ✅ BD PostgreSQL 16 + PostGIS con Prisma
- ✅ API auth completa (registro, login, JWT, refresh tokens con rotación)
- ✅ Registro de Publicadores y Transportadores
- ✅ Verificación básica de email y teléfono (OTP)
- ✅ **🆕 V3:** Auditoría base (`AuditLog`) desde el primer commit
- ✅ **🆕 V3:** Scripts de migración de datos legacy (§13) en paralelo

### Fase 2: Core + Monetización (Semanas 3-5)
- ✅ CRUD Cargas con geolocalización
- ✅ Listado público con preview limitada (sin datos de contacto)
- ✅ **🔒 SISTEMA DE PAGO PARA DESBLOQUEO** (TU REQUERIMIENTO CLAVE)
- ✅ Pasarela de pagos (Wompi: PSE, Tarjeta, Nequi)
- ✅ Membresías mensuales (Básica / Ilimitada) con cron de expiración
- ✅ Sistema de ofertas y asignación
- ✅ **🆕 V3:** Conciliación automática de pagos vía webhook firmado (no verificación manual)

### Fase 3: CICETAC + IA Pricing (Semanas 6-7)
- ✅ **Integración CICETAC** — tarifa de referencia oficial
- ✅ **Calculadora inteligente** — sugiere precio basado en:
  - Tarifa CICETAC
  - Distancia real (Mapbox Directions)
  - Tipo de vehículo y tipo de carga
  - Demanda de la zona (IA)
- ✅ Contratos digitales auto-generados con hash SHA-256 (integridad legal)

### Fase 4: GPS + Chat + Tracking (Semanas 8-9)
- ✅ Tracking GPS en tiempo real (Socket.io)
- ✅ Chat integrado transportador-publicador (solo tras desbloqueo verificado)
- ✅ Notificaciones push (FCM)
- ✅ Código OTP de entrega + firma digital + foto de entrega

### Fase 5: IA Noticias + Comunidad (Semanas 10-11)
- ✅ **Módulo IA de noticias de carretera** con score de confianza
- ✅ Scraping + IA para verificar noticias, con geocodificación
- ✅ Notificaciones geolocalizadas por radio (PostGIS `ST_DWithin`)
- ✅ Feed de oportunidades de carga por zona
- ✅ Sistema de comunidad / videos educativos

### Fase 6: Alianzas + Polish (Semanas 12-13)
- ✅ Módulo de alianzas (cupones con control de doble redención)
- ✅ Dashboard analítico completo
- ✅ App PWA lista para móvil
- ✅ Testing E2E + **🆕 V3:** prueba de penetración básica antes de lanzamiento

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
  fuente: string;           // 🆕 V3: dinámico, ej. 'CICETAC-2026' (versionado anual)
}
```

> **⚠️ Nota V3:** CICETAC publica tablas actualizadas anualmente (ajuste por IPC/costos). La tabla de tarifas debe versionarse en la BD y actualizarse cada diciembre, no quemarse en código.

> **🔴 Nota V3.1 (2026-07-24):** El **Decreto 1017 de 2025** cambió el marco: el **SICE-TAC** es ahora el piso legal obligatorio del flete (el RNDC bloquea despachos por debajo de él), el manifiesto electrónico RNDC es **título valor con mérito ejecutivo**, y el reporte GPS de tiempos de cargue/descargue es obligatorio desde nov-2025. Esto convierte el módulo de tarifas + GPS + documentos en **infraestructura de cumplimiento legal**, no solo features. Detalle completo: ver `ANEXO_LEGAL_DOFA_COMPETENCIA.md` §1.3 y §2.

### Flujo de la Calculadora

```
┌─────────────────────────────────────────────────────────────┐
│  CALCULADORA INTELIGENTE DE PRECIOS                         │
├─────────────────────────────────────────────────────────────┤
│  PASO 1: Usuario ingresa origen, destino, toneladas         │
│         ↓                                                   │
│  PASO 2: Mapbox calcula distancia real en km                │
│         ↓                                                   │
│  PASO 3: CICETAC devuelve tarifa base + tarifa/km           │
│         ↓                                                   │
│  PASO 4: IA ajusta según:                                   │
│          • Demanda de la ruta (cargas disponibles)          │
│          • Tipo de carga (peligrosa = +20%)                 │
│          • Urgencia (fecha próxima = +15%)                  │
│          • Clima / noticias de carretera activas            │
│         ↓                                                   │
│  PASO 5: Mostramos 3 precios (⚠️ CORREGIDO 2026-07-24):     │
│          🟢 Mínimo legal: 100% SICE-TAC (PISO INQUEBRANTABLE│
│             — Decreto 1017/2025 prohíbe fletes bajo SICE-TAC│
│             y el RNDC bloquea el despacho)                  │
│          🟡 Justo: SICE-TAC + ajuste IA de mercado          │
│          🔴 Premium: SICE-TAC + 20% (máxima ganancia)       │
│                                                             │
│  NOTA LEGAL: Ninguna oferta formal de la plataforma puede   │
│  quedar por debajo del piso SICE-TAC. Ver ANEXO_LEGAL_      │
│  DOFA_COMPETENCIA.md §1.3 (Decreto 1017 de 2025).           │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Verificación de Identidad y Antecedentes

### Flujo KYC (Know Your Customer)

```
┌─────────────────────────────────────────────────────────────┐
│  VERIFICACIÓN DE USUARIOS — ANTI-BOT / ANTI-FRAUDE          │
├─────────────────────────────────────────────────────────────┤
│  NIVEL 1: BÁSICO (Obligatorio para todos)                   │
│  ├── ✓ Email verificado (código OTP)                        │
│  ├── ✓ Teléfono verificado (SMS)                            │
│  └── ✓ Foto de documento subida                             │
│                                                             │
│  NIVEL 2: VERIFICADO (Obligatorio para desbloquear cargas)  │
│  ├── ✓ OCR del documento (validación RNEC)                  │
│  ├── ✓ Selfie con documento (reconocimiento facial)         │
│  ├── ✓ Consulta RUNT (vehículos activos)                    │
│  └── ✓ SOAT vigente verificado                              │
│                                                             │
│  NIVEL 3: PREMIUM (Badge dorado, más visibilidad)           │
│  ├── ✓ Antecedentes judiciales (Policía / Rama Judicial)    │
│  ├── ✓ Certificado de salud vigente                         │
│  ├── ✓ Licencia de conducción vigente                       │
│  └── ✓ Revisión técnico-mecánica vigente                    │
└─────────────────────────────────────────────────────────────┘
```

### APIs de Verificación

| Servicio | Proveedor | Costo Aprox. |
|----------|-----------|-------------|
| Validación documento | RNEC / Verifik | ~$500 COP/consulta |
| OCR + Facial | AWS Rekognition / Face++ | ~$0.001/imagen |
| RUNT | API propia o scraping | Variable |
| Antecedentes | Rama Judicial / Consulta web | Gratuito (scraping) |

> **⚠️ Nota V3 (legal):** La verificación de antecedentes y biometría facial son **datos sensibles** bajo Ley 1581/2012: requieren consentimiento explícito del usuario en el registro, no pueden ser obligatorios para funciones básicas, y deben almacenarse cifrados (§17).

---

## 9. IA para Noticias de Carretera Geolocalizadas

### Arquitectura del Módulo

```
┌─────────────────────────────────────────────────────────────┐
│  MÓDULO IA: NOTICIAS DE CARRETERA                           │
├─────────────────────────────────────────────────────────────┤
│  FUENTES DE DATOS                                           │
│  ├── Twitter/X API (tweets geolocalizados)                  │
│  ├── Google News (noticias de carretera Colombia)           │
│  ├── Periódicos locales (web scraping)                      │
│  ├── Policía de Carreteras / INVÍAS                         │
│  └── Usuarios reportan (crowdsourcing verificado)           │
│                                                             │
│  PROCESAMIENTO IA (cada 15 minutos)                         │
│  ├── 1. Node-cron ejecuta scraper                           │
│  ├── 2. GPT evalúa: ¿Es real? ¿Qué tipo? ¿Dónde?            │
│  │      → score de confianza 0-1 (campo confianzaIA)        │
│  ├── 3. Geocodificación: extrae ciudad/vía → lat/lng        │
│  ├── 4. Clasificación: ACCIDENTE/CIERRE/VIA_LIBRE/ALERTA    │
│  ├── 5. Solo publica si confianzaIA ≥ 0.75 o fuente oficial │
│  └── 6. Guarda con fecha de expiración (24-72h)             │
│                                                             │
│  NOTIFICACIÓN                                               │
│  ├── PostGIS ST_DWithin: usuarios en radio de 50km          │
│  ├── Push: "⚠️ Accidente en Ruta 45, km 67"                 │
│  └── Feed personalizado en el dashboard                     │
└─────────────────────────────────────────────────────────────┘
```

> **⚠️ Nota V3 (anti-desinformación):** Las noticias con confianza entre 0.5 y 0.75 se muestran como "reporte sin verificar" con badge gris, nunca como hechos. Esto protege la reputación de la plataforma — el diferenciador es la *verificación*, no el volumen.

---

## 10. Alianzas Estratégicas — Soporte Técnico

| Alianza | Feature Técnico Requerido | Estado |
|---------|--------------------------|--------|
| **Combustible** | Módulo de cupones con geolocalización de estaciones | ✅ Incluido |
| **Tarjetas de crédito** | Integración pasarela + opción de crédito | ✅ Incluido |
| **Aseguradoras** | Widget de seguro por viaje + generación de póliza | ✅ Incluido |
| **Talleres/mantenimiento** | Módulo de servicios con citas | 🔄 Fase 6 |
| **MinTransporte** | Badge "Aliado CICETAC" + reportes oficiales | 🔄 Fase 3 |

---

## 11. Roadmap de Implementación

| Fase | Duración | Entregables | Criterio de Salida 🆕 |
|------|----------|-------------|----------------------|
| **Fase 1: Fundación** | Semanas 1-2 | Auth, BD, registro, verificación email/tel, auditoría, scripts migración | Login E2E + datos legacy migrados a staging |
| **Fase 2: Core + Monetización** | Semanas 3-5 | CRUD cargas, pasarela, desbloqueo por pago, membresías | Un desbloqueo pagado de punta a punta en staging |
| **Fase 3: CICETAC + Pricing IA** | Semanas 6-7 | Tarificador oficial, calculadora, contratos digitales | Calculadora validada contra 20 rutas reales conocidas |
| **Fase 4: GPS + Chat** | Semanas 8-9 | Tracking tiempo real, chat, push, OTP entrega | Viaje completo simulado con 2 usuarios reales |
| **Fase 5: IA + Comunidad** | Semanas 10-11 | Noticias carretera IA, feed oportunidades, videos | Precisión de clasificación IA ≥ 85% en muestra de 100 noticias |
| **Fase 6: Alianzas + Polish** | Semanas 12-13 | Cupones, dashboard, PWA, testing E2E, pentest básico | 0 vulnerabilidades críticas/altas abiertas |

---

## 12. Comparativa: Antes vs Después

| Aspecto | Antes (2021) | Después (2026) |
|---------|-------------|----------------|
| **Seguridad** | ❌ SQL Injection, passwords texto plano | ✅ Prisma ORM, bcrypt, JWT rotado, rate limit, auditoría |
| **Frontend** | ❌ AngularJS 1.6 EOL, Bootstrap 4 | ✅ React 19, Tailwind 4, animaciones |
| **Backend** | ❌ JSP monolítico, sin API | ✅ REST API limpia, modular, type-safe |
| **Monetización** | ❌ Pago manual por WhatsApp | ✅ Pasarela integrada, membresías, desbloqueo automático |
| **Tarifas** | ❌ Precio a criterio del publicador | ✅ CICETAC oficial + IA de pricing |
| **Verificación** | ❌ Ninguna | ✅ KYC 3 niveles: email → documento → antecedentes |
| **GPS/Tracking** | ❌ Ninguno | ✅ Tiempo real, ruta óptima, alertas |
| **Noticias** | ❌ Ninguno | ✅ IA verifica noticias de carretera geolocalizadas |
| **Legal** | ❌ Ninguno | ✅ Contratos digitales firmados con hash de integridad |
| **Comunidad** | ❌ Ninguno | ✅ Videos educativos, sistema de calificaciones |
| **Móvil** | ❌ App nativa costosa | ✅ PWA responsive, casi nativa |
| **DevOps** | ❌ Despliegue manual | ✅ Docker, CI/CD automático, backups diarios |
| **Datos legacy** | ❌ Atrapados en MySQL inseguro | ✅ Migrados con trazabilidad (§13) |

---

## 13. Estrategia de Migración de Datos (MySQL → PostgreSQL)

El sistema actual tiene usuarios, cargas y pagos históricos que **no se pueden perder**. Estrategia en 4 pasos:

```
┌─────────────────────────────────────────────────────────────┐
│  MIGRACIÓN SEGURA DE DATOS LEGACY                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PASO 1 — EXTRACCIÓN (Semana 1)                             │
│  ├── mysqldump de la BD legacy → archivos SQL/CSV           │
│  ├── Snapshot inmutable guardado en MinIO (backup legal)    │
│  └── NUNCA se migra contra producción en vivo               │
│                                                             │
│  PASO 2 — TRANSFORMACIÓN (Semana 1-2)                       │
│  ├── Script Node.js: MySQL dump → JSON normalizado          │
│  ├── Mapeo de tablas legacy → modelos Prisma                │
│  ├── ⚠️ CONTRASEÑAS: no migrables (texto plano).            │
│  │   Cada usuario recibe email "define tu nueva contraseña" │
│  │   en su primer login — esto ES la corrección de seguridad│
│  └── Validación: conteos, sumas de montos, FK íntegras      │
│                                                             │
│  PASO 3 — CARGA A STAGING (Semana 2)                        │
│  ├── Carga completa a PostgreSQL de staging                 │
│  ├── Reporte de reconciliación: legacy vs nuevo             │
│  │   (N usuarios, N cargas, Σ pagos deben cuadrar exacto)   │
│  └── Tú verificas 10-20 registros a mano                    │
│                                                             │
│  PASO 4 — CORTE (Semana 6, junto a Fase 3)                  │
│  ├── Modo solo-lectura en el sistema viejo (ventana 4h)     │
│  ├── Delta final (registros nuevos desde el paso 3)         │
│  ├── DNS/dominio apunta a la nueva plataforma               │
│  └── Sistema viejo queda archivado 12 meses (no borrado)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Garantías:**
- Rollback: si algo falla en el corte, el DNS vuelve al sistema viejo en < 15 min.
- Trazabilidad: cada registro migrado lleva `metadata.legacyId` para auditoría.
- Nada se borra del sistema viejo durante 12 meses.

---

## 14. Análisis de Riesgos y Mitigaciones

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|-------------|---------|------------|
| R1 | **Fuga por canales externos:** transportador desbloquea 1 carga, luego negocia futuras por WhatsApp saltándose la comisión | Alta | Alto | Membresías atractivas + contratos digitales solo disponibles dentro de la plataforma + seguro de carga solo aplicable a viajes registrados |
| R2 | CICETAC no expone API pública estable | Media | Medio | Tabla de tarifas versionada en BD cargada desde PDFs/archivos oficiales; actualización anual manual asistida por script |
| R3 | Costos de IA (OpenAI) crecen con volumen de noticias | Media | Medio | Batch cada 15 min (no por evento), caché de noticias duplicadas, presupuesto tope mensual con alerta (§16) |
| R4 | Noticia falsa publicada daña reputación | Media | Alto | Umbral de confianza ≥ 0.75, badge "sin verificar", fuentes oficiales (INVÍAS) con prioridad |
| R5 | Fraude: transportador paga desbloqueo, carga era falsa | Baja | Alto | KYC nivel 2 obligatorio para publicar + reembolso automático si la carga se cancela antes de asignación + calificaciones |
| R6 | Sanción SIC por mal manejo de datos personales | Baja | Alto | Cumplimiento Ley 1581 desde diseño (§17), AuditLog, consentimientos explícitos |
| R7 | 13 semanas resultan cortas | Media | Medio | Fases 5-6 son recortables sin afectar el core (monetización vive en Fase 2). Lanzamiento mínimo viable = Fases 1-4 |
| R8 | Pasarela de pagos rechaza la cuenta (subcuenta nueva sin historial) | Media | Medio | Solicitar Wompi/ePayco en semana 1 (no semana 4), tener plan B (mercado manual con verificación admin por 30 días) |

---

## 15. KPIs y Métricas de Éxito

### North Star Metric
> **Desbloqueos pagados por semana** — es el evento donde la plataforma captura valor Y ambas partes obtienen valor.

### Métricas por Dimensión

| Dimensión | Métrica | Meta Mes 3 | Meta Mes 6 |
|-----------|---------|-----------|------------|
| **Adquisición** | Transportadores registrados (KYC≥1) | 150 | 400 |
| **Adquisición** | Publicadores activos (≥1 carga/mes) | 50 | 120 |
| **Activación** | % transportadores que hacen su 1er desbloqueo en 7 días | 20% | 30% |
| **Ingresos** | MRR (desbloqueos + membresías) | $4M COP | $12M COP |
| **Retención** | % transportadores activos mes a mes | 50% | 65% |
| **Liquidez** | % cargas desbloqueadas en < 48h de publicadas | 30% | 45% |
| **Confianza** | Calificación promedio de viajes completados | ≥ 4.2 | ≥ 4.5 |
| **Producto** | % desbloqueos con membresía vs pago individual | 25% | 40% |

### Instrumentación
- Eventos con PostHog (self-hosted, gratis) desde Fase 2.
- Dashboard de métricas en el panel admin (Fase 6) + revisión semanal contigo.

---

## 16. Estimación de Costos Operativos

### Mensual — Lanzamiento (0-500 usuarios)

| Rubro | Servicio | Costo Aprox. (COP/mes) |
|-------|----------|------------------------|
| Servidor VPS (app + BD) | Hetzner / DigitalOcean 8GB | ~$200.000 |
| Mapas | Mapbox (free tier 50k cargas) | $0 |
| Emails transaccionales | SendGrid free (100/día) | $0 |
| SMS OTP | Twilio (~500 SMS) | ~$150.000 |
| IA noticias + pricing | OpenAI API (con presupuesto tope) | ~$250.000 |
| Almacenamiento | MinIO en el VPS / Backblaze | ~$50.000 |
| Dominio + SSL | Namecheap + Let's Encrypt | ~$15.000 |
| **TOTAL lanzamiento** | | **~$665.000 COP/mes** |

### Mensual — Escala (2.000+ usuarios)

| Rubro | Costo Aprox. (COP/mes) |
|-------|------------------------|
| Infraestructura (2 VPS + BD administrada) | ~$900.000 |
| Mapbox (200k cargas/mes) | ~$400.000 |
| SMS + Push | ~$500.000 |
| IA (tope presupuestado) | ~$600.000 |
| Monitoreo (Sentry, UptimeRobot) | ~$120.000 |
| **TOTAL escala** | **~$2.5M COP/mes** |

> **Con la proyección de ingresos de §3 (~$12.2M COP/mes al mes 6), el punto de equilibrio operativo se cruza con ~55 desbloqueos pagados/mes.**

### Comisiones de Pasarela (variable)
- Wompi: ~2.65% + $900 COP por transacción con tarjeta; PSE ~1% + $900.
- Se absorbe dentro del 3% de comisión o se traslada transparente al pagador.

---

## 17. Cumplimiento Legal Colombiano

> Esto NO reemplaza a tus abogados (apunte #9) — es el checklist técnico que la plataforma implementa para que su trabajo sea fácil.

### Ley 1581 de 2012 (Protección de Datos Personales)

| Requerimiento | Implementación en plataforma |
|---------------|------------------------------|
| Autorización de tratamiento | Checkbox explícito en registro (no pre-marcado) con versión de política guardada por usuario |
| Aviso de privacidad | Página `/privacidad` + PDF descargable |
| Datos sensibles (biometría, antecedentes) | Consentimiento separado, cifrado en reposo, nunca obligatorios para funciones básicas |
| Derechos ARCO (acceso, rectificación, cancelación, oposición) | Endpoint de exportación de datos del usuario + botón "eliminar mi cuenta" con flujo de 30 días |
| Trazabilidad | `AuditLog` registra quién accedió a qué dato y cuándo |
| Registro RNBD ante SIC | 📋 Trámite que gestionas tú con el abogado |

### Ley 527 de 1999 (Comercio Electrónico / Firmas Electrónicas)

| Requerimiento | Implementación |
|---------------|----------------|
| Integridad del contrato | Hash SHA-256 del documento guardado al generarse (`DocumentoViaje.hashSha256`) |
| Identificación de las partes | Firma ligada a cuenta KYC-verificada + timestamp + IP |
| Conservación | Contratos inmutables en MinIO con versionado |

### Otros

| Tema | Acción |
|------|--------|
| **Términos y condiciones** | El abogado redacta; la plataforma exige aceptación versionada en cada cambio |
| **Intermediación vs transportador** | TyC deben dejar claro que la plataforma es *intermediaria tecnológica*, no empresa de transporte (evita obligaciones del Decreto 1079/2015 como porteador) |
| **Facturación electrónica DIAN** | Facturas de membresías/comisiones vía integración con facturador autorizado (ej. Alegra, Factus) — Fase 6 o posterior |
| **ReteFuente/ICA** | Lo define tu contador; la plataforma exporta reportes contables mensuales en Excel |
| **🆕 CIIU para el RUT/Cámara** | Principal: **6312 Portales web**. Complementarios: 6311 (procesamiento de datos) y 6201 (desarrollo de software). Refuerza la figura de intermediaria tecnológica (evitar códigos de transporte como 4923). [Resolución DIAN 000114/2020 — CIIU Rev. 4 A.C.] |
| **🔴 RNDC / Decreto 1017 de 2025** | Manifiesto electrónico obligatorio por despacho, piso SICE-TAC, reporte GPS de tiempos — **ver análisis completo en `ANEXO_LEGAL_DOFA_COMPETENCIA.md` §1.3** (agregado 2026-07-24) |

---

## 18. Plan de Lanzamiento (Go-to-Market)

### Semana 0-2 (Pre-lanzamiento, durante Fase 5-6)
- Lista de espera con landing pública + calculadora CICETAC gratuita como imán de tráfico.
- Contactar 20 transportadores conocidos para beta cerrada (de tu red actual).

### Semanas 1-4 post-lanzamiento (Beta cerrada)
- 20-50 usuarios invitados. Comisión de desbloqueo en **0%** para fundadores (feedback a cambio).
- Llamada semanal de 15 min con 5 usuarios: qué les duele, qué falta.
- Objetivo: 10 viajes completados de punta a punta.

### Mes 2-3 (Lanzamiento público)
- Activar precios reales con descuento de lanzamiento (desbloqueo a $9.900 el primer mes).
- Contenido SEO: "cuánto cuesta un flete Bogotá–Medellín" (la calculadora indexa rutas).
- Los videos educativos (apunte 7.3) salen aquí como canal de adquisición.

### Mes 4-6 (Crecimiento)
- Activar alianzas negociadas (combustible/seguros) como gancho de membresías.
- Meta: cruzar punto de equilibrio operativo (~55 desbloqueos/mes, §16).

---

> **Nota final:** Tus apuntes son VALIOSÍSIMOS. El 60% son features técnicos que voy a construir. El 40% son estratégicos de negocio que TÚ debes gestionar (abogados, alianzas, MinTransporte, trámite SIC), pero la plataforma ya está diseñada para soportarlos técnicamente desde el día 1. La V3 agrega lo que ninguna propuesta técnica puede obviar: cómo no perder tus datos actuales, cuánto cuesta operar, qué riesgos existen y cómo se mide el éxito.

---

*Documento V3 generado como base técnica integral para la modernización de Descargo & Cargo 2.0. Sustituye a PLAN_INTEGRAL_V2.md.*
