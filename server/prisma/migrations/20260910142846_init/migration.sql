-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Publicador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    CONSTRAINT "Publicador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transportador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    CONSTRAINT "Transportador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Membresia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transportadorId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'GRATIS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Membresia_transportadorId_fkey" FOREIGN KEY ("transportadorId") REFERENCES "Transportador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Carga" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "publicadorId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipoCarga" TEXT NOT NULL,
    "origen" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "toneladas" REAL NOT NULL,
    "precio" INTEGER NOT NULL,
    "pisoSiceTac" INTEGER NOT NULL,
    "fechaCarga" DATETIME NOT NULL,
    "tipoPublicacion" TEXT NOT NULL,
    "vehiculoRequerido" TEXT NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "destacada" BOOLEAN NOT NULL DEFAULT false,
    "estado" TEXT NOT NULL DEFAULT 'DISPONIBLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Carga_publicadorId_fkey" FOREIGN KEY ("publicadorId") REFERENCES "Publicador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PagoDesbloqueo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cargaId" INTEGER NOT NULL,
    "transportadorId" INTEGER NOT NULL,
    "monto" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'VERIFICADO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PagoDesbloqueo_cargaId_fkey" FOREIGN KEY ("cargaId") REFERENCES "Carga" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PagoDesbloqueo_transportadorId_fkey" FOREIGN KEY ("transportadorId") REFERENCES "Transportador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Publicador_usuarioId_key" ON "Publicador"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Transportador_usuarioId_key" ON "Transportador"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Membresia_transportadorId_key" ON "Membresia"("transportadorId");

-- CreateIndex
CREATE INDEX "Carga_estado_tipoPublicacion_idx" ON "Carga"("estado", "tipoPublicacion");

-- CreateIndex
CREATE UNIQUE INDEX "PagoDesbloqueo_cargaId_transportadorId_key" ON "PagoDesbloqueo"("cargaId", "transportadorId");
