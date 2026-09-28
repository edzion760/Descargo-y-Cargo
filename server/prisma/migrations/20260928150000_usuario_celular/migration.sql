-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "celular" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_celular_key" ON "Usuario"("celular");
