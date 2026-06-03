-- Reservas que llegan vía una app de fitness (TotalPass / Fitpass / Wellhub):
-- el pase cubre la clase → acceso incluido, sin cobro, se valida en recepción.
-- Campo OPCIONAL: solo se llena cuando el cliente declara que viene de una app.
-- (Sin tocar el enum ReservationKind: la reserva sigue siendo "member" =
--  acceso incluido; la columna fitnessApp distingue socio vs app y permite
--  conciliar con cada proveedor.)

-- CreateEnum
CREATE TYPE "app"."FitnessApp" AS ENUM ('totalpass', 'fitpass', 'wellhub');

-- AlterTable
ALTER TABLE "app"."Reservation" ADD COLUMN "fitnessApp" "app"."FitnessApp";
