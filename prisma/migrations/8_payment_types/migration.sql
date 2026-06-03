-- Tipos de pago finos (inscripción / membresía recurrente) + soporte para cobros
-- originados en facturas de suscripción + monto recurrente real en la suscripción.
-- Aditiva. (Los ADD VALUE no se USAN en esta misma migración → seguro en PG12+.)

-- AlterEnum: nuevos tipos de pago
ALTER TYPE "app"."ItemKind" ADD VALUE IF NOT EXISTS 'inscripcion';
ALTER TYPE "app"."ItemKind" ADD VALUE IF NOT EXISTS 'subscription';

-- AlterTable: Payment — stripeSessionId opcional (facturas no tienen session) + invoice
ALTER TABLE "app"."Payment" ALTER COLUMN "stripeSessionId" DROP NOT NULL;
ALTER TABLE "app"."Payment" ADD COLUMN "stripeInvoiceId" TEXT;

-- AlterTable: Subscription — monto recurrente real (para verificar que NO es el total)
ALTER TABLE "app"."Subscription" ADD COLUMN "recurringAmountCents" INTEGER;
ALTER TABLE "app"."Subscription" ADD COLUMN "recurringInterval" TEXT;
