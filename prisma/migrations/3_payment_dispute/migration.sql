-- Estados de pago para contracargos y reembolsos (Stripe charge.dispute / refund).
ALTER TYPE "app"."PaymentStatus" ADD VALUE IF NOT EXISTS 'disputed';
ALTER TYPE "app"."PaymentStatus" ADD VALUE IF NOT EXISTS 'refunded';
