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
    "eliminadoEn" DATETIME
);
INSERT INTO "new_Usuario" ("createdAt", "email", "id", "passwordHash", "tipo") SELECT "createdAt", "email", "id", "passwordHash", "tipo" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
