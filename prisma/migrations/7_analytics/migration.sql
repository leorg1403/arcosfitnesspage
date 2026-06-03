-- Analytics propio (estilo Vercel): tabla de visitas de página. Cookieless y sin
-- PII (visitorHash rota a diario). Aditiva y transaccional.

-- CreateTable
CREATE TABLE "app"."PageView" (
    "id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "path" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "referrerHost" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "visitorHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_day_idx" ON "app"."PageView"("day");
CREATE INDEX "PageView_path_idx" ON "app"."PageView"("path");
CREATE INDEX "PageView_referrerHost_idx" ON "app"."PageView"("referrerHost");
