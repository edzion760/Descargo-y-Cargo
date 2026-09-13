-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PagoDesbloqueo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cargaId" INTEGER NOT NULL,
    "transportadorId" INTEGER NOT NULL,
    "monto" INTEGER NOT NULL,
    "referencia" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PagoDesbloqueo_cargaId_fkey" FOREIGN KEY ("cargaId") REFERENCES "Carga" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PagoDesbloqueo_transportadorId_fkey" FOREIGN KEY ("transportadorId") REFERENCES "Transportador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PagoDesbloqueo" ("cargaId", "createdAt", "estado", "id", "monto", "transportadorId") SELECT "cargaId", "createdAt", "estado", "id", "monto", "transportadorId" FROM "PagoDesbloqueo";
DROP TABLE "PagoDesbloqueo";
ALTER TABLE "new_PagoDesbloqueo" RENAME TO "PagoDesbloqueo";
CREATE UNIQUE INDEX "PagoDesbloqueo_referencia_key" ON "PagoDesbloqueo"("referencia");
CREATE UNIQUE INDEX "PagoDesbloqueo_cargaId_transportadorId_key" ON "PagoDesbloqueo"("cargaId", "transportadorId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
