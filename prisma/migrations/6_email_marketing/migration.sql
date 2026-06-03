-- Email marketing: baja (opt-out) por cliente + audiencias guardadas + historial
-- de campañas. Todo aditivo y transaccional (nueva enum, nuevas tablas, una
-- columna nullable). No toca flujos transaccionales existentes.

-- AlterTable: baja de marketing (null = recibe campañas)
ALTER TABLE "app"."Customer" ADD COLUMN "marketingOptOutAt" TIMESTAMP(3);

-- CreateEnum
CREATE TYPE "app"."EmailCampaignStatus" AS ENUM ('draft', 'sending', 'sent', 'failed');

-- CreateTable: audiencia guardada (define filtros, no correos congelados)
CREATE TABLE "app"."EmailList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "filters" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailList_pkey" PRIMARY KEY ("id")
);

-- CreateTable: historial de campañas
CREATE TABLE "app"."EmailCampaign" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preheader" TEXT,
    "heading" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "status" "app"."EmailCampaignStatus" NOT NULL DEFAULT 'draft',
    "listId" TEXT,
    "filters" JSONB,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailCampaign_status_idx" ON "app"."EmailCampaign"("status");
CREATE INDEX "EmailCampaign_createdAt_idx" ON "app"."EmailCampaign"("createdAt");

-- AddForeignKey
ALTER TABLE "app"."EmailCampaign" ADD CONSTRAINT "EmailCampaign_listId_fkey" FOREIGN KEY ("listId") REFERENCES "app"."EmailList"("id") ON DELETE SET NULL ON UPDATE CASCADE;
