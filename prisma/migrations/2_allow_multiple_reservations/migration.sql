-- Permitir MÚLTIPLES reservas del mismo correo en la misma clase (apartar lugares
-- para amigos / pagar por adelantado por varios). Se elimina el índice único parcial.
DROP INDEX IF EXISTS "app"."reservation_active_email_unique";
