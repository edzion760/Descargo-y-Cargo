-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Carga" (
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
    "ejemplo" BOOLEAN NOT NULL DEFAULT false,
    "estado" TEXT NOT NULL DEFAULT 'DISPONIBLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Carga_publicadorId_fkey" FOREIGN KEY ("publicadorId") REFERENCES "Publicador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Carga" ("createdAt", "destacada", "destino", "estado", "fechaCarga", "id", "origen", "pisoSiceTac", "precio", "publicadorId", "tipoCarga", "tipoPublicacion", "titulo", "toneladas", "vehiculoRequerido", "verificado") SELECT "createdAt", "destacada", "destino", "estado", "fechaCarga", "id", "origen", "pisoSiceTac", "precio", "publicadorId", "tipoCarga", "tipoPublicacion", "titulo", "toneladas", "vehiculoRequerido", "verificado" FROM "Carga";
DROP TABLE "Carga";
ALTER TABLE "new_Carga" RENAME TO "Carga";
CREATE INDEX "Carga_estado_tipoPublicacion_idx" ON "Carga"("estado", "tipoPublicacion");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
