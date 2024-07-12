-- CreateTable
CREATE TABLE "Person" (
    "governmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("governmentId")
);

-- CreateTable
CREATE TABLE "Boleto" (
    "id" TEXT NOT NULL,
    "linhaDigitavel" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL,
    "pagadorId" TEXT NOT NULL,

    CONSTRAINT "Boleto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_governmentId_key" ON "Person"("governmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Boleto_id_key" ON "Boleto"("id");

-- AddForeignKey
ALTER TABLE "Boleto" ADD CONSTRAINT "Boleto_pagadorId_fkey" FOREIGN KEY ("pagadorId") REFERENCES "Person"("governmentId") ON DELETE RESTRICT ON UPDATE CASCADE;
