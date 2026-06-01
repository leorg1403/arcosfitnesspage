-- CreateEnum
CREATE TYPE "app"."MembershipStatus" AS ENUM ('active', 'expired', 'cancelled');

-- CreateTable
CREATE TABLE "app"."Membership" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "periodicity" TEXT NOT NULL,
    "status" "app"."MembershipStatus" NOT NULL DEFAULT 'active',
    "startsAt" DATE NOT NULL,
    "endsAt" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Membership_customerId_idx" ON "app"."Membership"("customerId");

-- CreateIndex
CREATE INDEX "Membership_status_idx" ON "app"."Membership"("status");

-- AddForeignKey
ALTER TABLE "app"."Membership" ADD CONSTRAINT "Membership_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "app"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

