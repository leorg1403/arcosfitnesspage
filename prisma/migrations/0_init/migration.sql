-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app";

-- CreateEnum
CREATE TYPE "app"."ClassCategory" AS ENUM ('funcional', 'hyrox', 'boxeo', 'open_gym');

-- CreateEnum
CREATE TYPE "app"."ClassLevel" AS ENUM ('principiante', 'intermedio', 'avanzado', 'todos');

-- CreateEnum
CREATE TYPE "app"."ClassKind" AS ENUM ('weekly', 'oneoff');

-- CreateEnum
CREATE TYPE "app"."SessionStatus" AS ENUM ('open', 'closed', 'cancelled');

-- CreateEnum
CREATE TYPE "app"."ReservationKind" AS ENUM ('member', 'reception', 'online');

-- CreateEnum
CREATE TYPE "app"."ReservationStatus" AS ENUM ('pending', 'confirmed', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "app"."ClassPaymentStatus" AS ENUM ('none', 'pending_reception', 'paid');

-- CreateEnum
CREATE TYPE "app"."ItemKind" AS ENUM ('plan', 'prepayment', 'class');

-- CreateEnum
CREATE TYPE "app"."PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'expired');

-- CreateEnum
CREATE TYPE "app"."SubscriptionStatus" AS ENUM ('active', 'past_due', 'canceled', 'incomplete', 'trialing', 'unpaid');

-- CreateEnum
CREATE TYPE "app"."LeadStatus" AS ENUM ('new', 'contacted', 'converted', 'archived');

-- CreateEnum
CREATE TYPE "app"."AttendanceStatus" AS ENUM ('pending', 'attended', 'no_show', 'late_cancel');

-- CreateEnum
CREATE TYPE "app"."CustomerStatus" AS ENUM ('active', 'flagged', 'blocked');

-- CreateEnum
CREATE TYPE "app"."AdminRole" AS ENUM ('owner', 'staff');

-- CreateTable
CREATE TABLE "app"."Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "app"."AdminRole" NOT NULL DEFAULT 'owner',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."Customer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "status" "app"."CustomerStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."ClassTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "app"."ClassCategory" NOT NULL,
    "kind" "app"."ClassKind" NOT NULL DEFAULT 'weekly',
    "weekday" INTEGER,
    "intervalWeeks" INTEGER NOT NULL DEFAULT 1,
    "anchorDate" DATE,
    "eventDate" DATE,
    "startTime" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "instructor" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "level" "app"."ClassLevel" NOT NULL DEFAULT 'todos',
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 20,
    "priceCents" INTEGER,
    "onlineOnly" BOOLEAN NOT NULL DEFAULT false,
    "tracksSpots" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."ClassSession" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "availableSpots" INTEGER,
    "status" "app"."SessionStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."Lead" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "dedupeHash" TEXT NOT NULL,
    "resubmitCount" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'contact-form',
    "status" "app"."LeadStatus" NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSubmittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."Reservation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerEmailLower" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "kind" "app"."ReservationKind" NOT NULL,
    "status" "app"."ReservationStatus" NOT NULL DEFAULT 'pending',
    "attendance" "app"."AttendanceStatus" NOT NULL DEFAULT 'pending',
    "paymentStatus" "app"."ClassPaymentStatus" NOT NULL DEFAULT 'none',
    "amountDueCents" INTEGER NOT NULL,
    "holdExpiresAt" TIMESTAMP(3),
    "stripeSessionId" TEXT,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."Payment" (
    "id" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeSubscriptionId" TEXT,
    "itemKind" "app"."ItemKind" NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "amountTotalCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'mxn',
    "status" "app"."PaymentStatus" NOT NULL DEFAULT 'pending',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerId" TEXT,
    "subscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."Subscription" (
    "id" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "status" "app"."SubscriptionStatus" NOT NULL DEFAULT 'active',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."WebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "app"."Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "app"."Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "app"."Customer"("status");

-- CreateIndex
CREATE INDEX "ClassTemplate_active_category_idx" ON "app"."ClassTemplate"("active", "category");

-- CreateIndex
CREATE INDEX "ClassSession_date_idx" ON "app"."ClassSession"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSession_templateId_date_key" ON "app"."ClassSession"("templateId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_dedupeHash_key" ON "app"."Lead"("dedupeHash");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "app"."Lead"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_code_key" ON "app"."Reservation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_stripeSessionId_key" ON "app"."Reservation"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_paymentId_key" ON "app"."Reservation"("paymentId");

-- CreateIndex
CREATE INDEX "Reservation_sessionId_status_idx" ON "app"."Reservation"("sessionId", "status");

-- CreateIndex
CREATE INDEX "Reservation_customerId_idx" ON "app"."Reservation"("customerId");

-- CreateIndex
CREATE INDEX "Reservation_shortCode_idx" ON "app"."Reservation"("shortCode");

-- CreateIndex
CREATE INDEX "Reservation_status_holdExpiresAt_idx" ON "app"."Reservation"("status", "holdExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeSessionId_key" ON "app"."Payment"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "app"."Subscription"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "app"."ClassSession" ADD CONSTRAINT "ClassSession_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "app"."ClassTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Reservation" ADD CONSTRAINT "Reservation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "app"."ClassSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Reservation" ADD CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "app"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Reservation" ADD CONSTRAINT "Reservation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "app"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "app"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "app"."Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Subscription" ADD CONSTRAINT "Subscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "app"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ Hardening (SQL custom — no generado por Prisma)                           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Índice único PARCIAL: impide doble reserva ACTIVA del mismo correo en la
-- misma sesión (más barato que un lock; la reserva captura P2002 y avisa).
CREATE UNIQUE INDEX "Reservation_active_email_unique"
  ON "app"."Reservation" ("sessionId", "customerEmailLower")
  WHERE status IN ('pending', 'confirmed');

-- Defensa en profundidad: los roles públicos de Supabase (anon/authenticated)
-- NO deben tocar el esquema `app`. Se ejecuta solo si esos roles existen, para
-- que la migración siga funcionando en un Postgres local sin Supabase.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON SCHEMA "app" FROM anon, authenticated;
    REVOKE ALL ON ALL TABLES IN SCHEMA "app" FROM anon, authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA "app" FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "app" REVOKE ALL ON TABLES FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "app" REVOKE ALL ON SEQUENCES FROM anon, authenticated;
  END IF;
END $$;

-- RLS deny-all (última línea). Prisma usa un rol que IGNORA RLS; esto solo
-- protege la ruta anon/authenticated de PostgREST si el esquema se expusiera.
ALTER TABLE "app"."Customer"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app"."Reservation"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app"."Payment"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app"."Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app"."Lead"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app"."Admin"        ENABLE ROW LEVEL SECURITY;
