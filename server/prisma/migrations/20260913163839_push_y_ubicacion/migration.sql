-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "ultimaLat" REAL;
ALTER TABLE "Usuario" ADD COLUMN "ultimaLon" REAL;
ALTER TABLE "Usuario" ADD COLUMN "ultimaUbicacionEn" DATETIME;

-- CreateTable
CREATE TABLE "SuscripcionPush" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SuscripcionPush_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SuscripcionPush_endpoint_key" ON "SuscripcionPush"("endpoint");
