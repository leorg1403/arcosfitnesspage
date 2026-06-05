-- Historial de respuestas a leads (enviadas desde /recepcion/leads).
-- Aditiva: tabla nueva, sin tocar datos existentes.

-- CreateTable
CREATE TABLE "app"."LeadReply" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadReply_leadId_idx" ON "app"."LeadReply"("leadId");

-- AddForeignKey
ALTER TABLE "app"."LeadReply" ADD CONSTRAINT "LeadReply_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "app"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
