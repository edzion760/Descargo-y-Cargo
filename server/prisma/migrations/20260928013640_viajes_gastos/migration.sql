-- CreateTable
CREATE TABLE "Viaje" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transportadorId" INTEGER NOT NULL,
    "cargaId" INTEGER,
    "origen" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "descripcion" TEXT,
    "flete" INTEGER NOT NULL,
    "fecha" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Viaje_transportadorId_fkey" FOREIGN KEY ("transportadorId") REFERENCES "Transportador" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Viaje_cargaId_fkey" FOREIGN KEY ("cargaId") REFERENCES "Carga" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "viajeId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "fecha" DATETIME NOT NULL,
    "nota" TEXT,
    "recibo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Gasto_viajeId_fkey" FOREIGN KEY ("viajeId") REFERENCES "Viaje" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Viaje_transportadorId_cargaId_key" ON "Viaje"("transportadorId", "cargaId");
