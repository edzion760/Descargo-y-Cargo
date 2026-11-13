-- CreateTable
CREATE TABLE "CompraPaquete" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transportadorId" INTEGER NOT NULL,
    "cargaId" INTEGER,
    "creditos" INTEGER NOT NULL,
    "monto" INTEGER NOT NULL,
    "referencia" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompraPaquete_transportadorId_fkey" FOREIGN KEY ("transportadorId") REFERENCES "Transportador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transportador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "placa" TEXT,
    "creditosAcarreo" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Transportador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transportador" ("ciudad", "documento", "id", "nombre", "placa", "telefono", "usuarioId") SELECT "ciudad", "documento", "id", "nombre", "placa", "telefono", "usuarioId" FROM "Transportador";
DROP TABLE "Transportador";
ALTER TABLE "new_Transportador" RENAME TO "Transportador";
CREATE UNIQUE INDEX "Transportador_usuarioId_key" ON "Transportador"("usuarioId");
CREATE UNIQUE INDEX "Transportador_documento_key" ON "Transportador"("documento");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CompraPaquete_referencia_key" ON "CompraPaquete"("referencia");
