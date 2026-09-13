-- CreateTable
CREATE TABLE "Prospecto" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Prospecto_tipoInteres_idx" ON "Prospecto"("tipoInteres");
