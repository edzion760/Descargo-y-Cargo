-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminosVersion" TEXT NOT NULL DEFAULT '1.0',
    "terminosAceptadosEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminosIp" TEXT,
    "eliminadoEn" DATETIME,
    "esAdmin" BOOLEAN NOT NULL DEFAULT false,
    "ultimaLat" REAL,
    "ultimaLon" REAL,
    "ultimaUbicacionEn" DATETIME,
    "resetToken" TEXT,
    "resetTokenExpira" DATETIME
);
INSERT INTO "new_Usuario" ("createdAt", "eliminadoEn", "email", "id", "passwordHash", "resetToken", "resetTokenExpira", "terminosAceptadosEn", "terminosIp", "terminosVersion", "tipo", "ultimaLat", "ultimaLon", "ultimaUbicacionEn") SELECT "createdAt", "eliminadoEn", "email", "id", "passwordHash", "resetToken", "resetTokenExpira", "terminosAceptadosEn", "terminosIp", "terminosVersion", "tipo", "ultimaLat", "ultimaLon", "ultimaUbicacionEn" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
CREATE UNIQUE INDEX "Usuario_resetToken_key" ON "Usuario"("resetToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
