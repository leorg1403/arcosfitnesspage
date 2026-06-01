-- Fix: el índice real se llamaba "Reservation_active_email_unique" (R mayúscula);
-- la migración 2 usó minúsculas y no lo eliminó. Aquí se elimina con el nombre real.
DROP INDEX IF EXISTS "app"."Reservation_active_email_unique";
