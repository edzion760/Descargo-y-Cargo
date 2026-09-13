-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Prospecto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT,
    "tipoInteres" TEXT NOT NULL,
    "fuente" TEXT NOT NULL,
    "telefonos" TEXT NOT NULL,
    "email" TEXT,
    "nit" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "departamento" TEXT,
    "sector" TEXT,
    "contactadoEn" DATETIME,
    "noContactar" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Prospecto" ("ciudad", "contactadoEn", "createdAt", "departamento", "direccion", "email", "fuente", "id", "nit", "nombre", "sector", "telefonos", "tipoInteres") SELECT "ciudad", "contactadoEn", "createdAt", "departamento", "direccion", "email", "fuente", "id", "nit", "nombre", "sector", "telefonos", "tipoInteres" FROM "Prospecto";
DROP TABLE "Prospecto";
ALTER TABLE "new_Prospecto" RENAME TO "Prospecto";
CREATE INDEX "Prospecto_tipoInteres_idx" ON "Prospecto"("tipoInteres");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
