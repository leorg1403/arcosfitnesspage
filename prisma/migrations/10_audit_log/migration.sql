-- AddTable: AuditLog
-- Tabla de auditoría inmutable. action y area son texto (la fuente de verdad
-- es lib/audit/types.ts, no enums de BD) para poder agregar acciones sin migrar.

CREATE TABLE "app"."AuditLog" (
    "id"         TEXT        NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorKind"  TEXT        NOT NULL,
    "adminId"    TEXT,
    "adminEmail" TEXT,
    "adminName"  TEXT,
    "ip"         TEXT,
    "action"     TEXT        NOT NULL,
    "area"       TEXT        NOT NULL,
    "entityKind" TEXT,
    "entityId"   TEXT,
    "summary"    TEXT        NOT NULL,
    "before"     JSONB,
    "after"      JSONB,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_occurredAt_idx" ON "app"."AuditLog"("occurredAt" DESC);
CREATE INDEX "AuditLog_area_idx"       ON "app"."AuditLog"("area");
CREATE INDEX "AuditLog_action_idx"     ON "app"."AuditLog"("action");
CREATE INDEX "AuditLog_adminId_idx"    ON "app"."AuditLog"("adminId");
