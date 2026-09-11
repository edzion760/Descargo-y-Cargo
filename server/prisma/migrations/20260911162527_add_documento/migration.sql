/*
  Warnings:

  - Added the required column `documento` to the `Publicador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documento` to the `Transportador` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Publicador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    CONSTRAINT "Publicador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Publicador" ("ciudad", "id", "nombre", "telefono", "usuarioId") SELECT "ciudad", "id", "nombre", "telefono", "usuarioId" FROM "Publicador";
DROP TABLE "Publicador";
ALTER TABLE "new_Publicador" RENAME TO "Publicador";
CREATE UNIQUE INDEX "Publicador_usuarioId_key" ON "Publicador"("usuarioId");
CREATE UNIQUE INDEX "Publicador_documento_key" ON "Publicador"("documento");
CREATE TABLE "new_Transportador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    CONSTRAINT "Transportador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transportador" ("ciudad", "id", "nombre", "telefono", "usuarioId") SELECT "ciudad", "id", "nombre", "telefono", "usuarioId" FROM "Transportador";
DROP TABLE "Transportador";
ALTER TABLE "new_Transportador" RENAME TO "Transportador";
CREATE UNIQUE INDEX "Transportador_usuarioId_key" ON "Transportador"("usuarioId");
CREATE UNIQUE INDEX "Transportador_documento_key" ON "Transportador"("documento");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
