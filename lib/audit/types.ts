// Fuente de verdad de áreas y acciones de auditoría.
// Los valores de la BD son texto libre; nunca usar enums de Postgres aquí
// para agregar acciones sin necesitar una migración.

export const AUDIT_AREAS = {
  AUTH:      "auth",
  RESERVAS:  "reservas",
  CLASES:    "clases",
  CLIENTES:  "clientes",
  MEMBRESIAS:"membresias",
  PAGOS:     "pagos",
  LEADS:     "leads",
  MARKETING: "marketing",
  ANALYTICS: "analytics",
  SISTEMA:   "sistema",
} as const;

export type AuditArea = (typeof AUDIT_AREAS)[keyof typeof AUDIT_AREAS];

export const AUDIT_ACTIONS = {
  // Auth
  ADMIN_LOGIN:                 "admin.login",
  ADMIN_LOGOUT:                "admin.logout",
  // Reservas — admin
  RESERVATION_ATTENDANCE:      "reservation.attendance",
  RESERVATION_CANCEL_ADMIN:    "reservation.cancel.admin",
  RESERVATION_BULK_NOSHOW:     "reservation.bulk_noshow",
  RESERVATION_SESSION_NOSHOW:  "reservation.session_noshow",
  // Reservas — cliente
  RESERVATION_CREATE_CUSTOMER: "reservation.create.customer",
  RESERVATION_CANCEL_CUSTOMER: "reservation.cancel.customer",
  RESERVATION_RESCHEDULE:      "reservation.reschedule",
  // Clases
  CLASS_SAVE:                  "class.save",
  CLASS_CAPACITY:              "class.capacity",
  CLASS_TOGGLE_ACTIVE:         "class.toggle_active",
  CLASS_DELETE:                "class.delete",
  // Clientes
  CUSTOMER_CREATE:             "customer.create",
  CUSTOMER_UPDATE:             "customer.update",
  CUSTOMER_STATUS:             "customer.status",
  // Membresías
  MEMBERSHIP_ADD:              "membership.add",
  MEMBERSHIP_CANCEL:           "membership.cancel",
  // Leads
  LEAD_REPLY:                  "lead.reply",
  LEAD_STATUS:                 "lead.status",
  // Marketing
  CAMPAIGN_SEND:               "campaign.send",
  LIST_SAVE:                   "list.save",
  LIST_DELETE:                 "list.delete",
  // Analytics
  ANALYTICS_CLEAR:             "analytics.clear",
  // Auditoría
  AUDIT_PURGE_OLD:             "audit.purge_old",
  // Sistema / Stripe
  STRIPE_CHECKOUT_COMPLETED:   "stripe.checkout.completed",
  STRIPE_CHECKOUT_EXPIRED:     "stripe.checkout.expired",
  STRIPE_SUBSCRIPTION_UPDATED: "stripe.subscription.updated",
  STRIPE_SUBSCRIPTION_DELETED: "stripe.subscription.deleted",
  STRIPE_INVOICE_PAID:         "stripe.invoice.paid",
  STRIPE_INVOICE_FAILED:       "stripe.invoice.failed",
  STRIPE_DISPUTE:              "stripe.dispute",
  STRIPE_REFUND:               "stripe.refund",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
