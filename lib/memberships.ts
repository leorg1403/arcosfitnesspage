/**
 * Planes y precios reales extraídos de arcosfitness.com/membresias
 */

export type PlanCategory = "principal" | "segmento";

export type Plan = {
  id: "all-access" | "all-access-gold" | "ejecutiva" | "junior" | "weekend" | "drop-in" | "test-1-peso";
  name: string;
  /** Subtítulo/contexto: restricción horaria, ideal para, etc. */
  tagline?: string;
  price: number; // MXN
  inscripcion?: number; // costo único MXN, opcional
  inscripcionLabel?: string;
  periodicity: "mensual" | "unico";
  features: string[];
  /** Plan destacado (gold accent) */
  highlight?: boolean;
  category: PlanCategory;
};

const FEATURES_COMMON = [
  "Acceso a todas las instalaciones",
  "Acceso a todas las clases",
  "Acceso a baños y vestidores",
  "Acceso a The Protein Station",
  "Descuento del 20% en restaurante",
  "Estacionamiento preferencial LIVE AQUA®",
];

export const PLANS: Plan[] = [
  {
    id: "test-1-peso",
    name: "TEST $1",
    tagline: "Solo para pruebas internas.",
    price: 11,
    periodicity: "unico",
    category: "principal",
    features: ["Prueba de cobro Stripe"],
  },
  {
    id: "all-access",
    name: "All Access",
    tagline: "Acceso total al club.",
    price: 2800,
    inscripcion: 5000,
    periodicity: "mensual",
    category: "principal",
    features: [
      "Acceso a todas las instalaciones",
      "Acceso a todas las clases",
      "1er Análisis Inbody",
      "Descuento del 20% en restaurante LIVE AQUA®",
    ],
  },
  {
    id: "all-access-gold",
    name: "All Access Gold",
    tagline: "Acceso total al club.",
    price: 2800,
    inscripcion: 5000,
    inscripcionLabel: "DE PROGRAMA PERSONALIZADO",
    periodicity: "mensual",
    highlight: true,
    category: "principal",
    features: [
      "20 sesiones de programa personalizado",
      "Acceso a todas las instalaciones",
      "Acceso a todas las clases",
      "1er Análisis Inbody",
      "Descuento del 20% en restaurante LIVE AQUA®",
    ],
  },
  {
    id: "junior",
    name: "Junior All Access",
    tagline: "Con credencial de estudiante vigente, hasta 24 años de edad.",
    price: 1700,
    periodicity: "mensual",
    category: "segmento",
    features: [
      "Acceso a todas las instalaciones",
      "Acceso a todas las clases",
      "Descuento del 20% en restaurante LIVE AQUA®",
    ],
  },
  {
    id: "ejecutiva",
    name: "Ejecutiva",
    tagline: "Horario 12:00 – 17:00 hrs.",
    price: 1700,
    inscripcion: 1000,
    periodicity: "mensual",
    category: "segmento",
    features: [
      "Acceso a todas las instalaciones",
      "Descuento del 20% en restaurante LIVE AQUA®",
    ],
  },
  {
    id: "weekend",
    name: "Weekend",
    tagline: "De jueves a domingo dentro de un mes.",
    price: 1800,
    inscripcion: 1500,
    periodicity: "mensual",
    category: "segmento",
    features: [
      "Acceso a todas las instalaciones",
      "Acceso a todas las clases de jueves a domingo",
      "Descuento del 20% en restaurante LIVE AQUA®",
    ],
  },
  {
    id: "drop-in",
    name: "7 Day Drop In",
    tagline: "Una semana completa dentro de un mes.",
    price: 2450,
    periodicity: "unico",
    category: "segmento",
    features: [
      "Acceso a todas las instalaciones",
      "Acceso a todas las clases",
      "Descuento del 20% en restaurante LIVE AQUA®",
    ],
  },
];

export const MAIN_PLANS: Plan[] = PLANS.filter((p) => p.category === "principal");
export const SEGMENT_PLANS: Plan[] = PLANS.filter((p) => p.category === "segmento");

/** Comparación directa entre los dos planes principales */
export const MAIN_COMPARISON = {
  difference: {
    label: "La única diferencia",
    body: "All Access Gold incluye un programa personalizado de 20 sesiones con coach dedicado. Todo lo demás es idéntico.",
  },
};

/** Pagos por adelantado con descuento */
export type PrePayment = {
  id: "anual" | "semestral" | "cuatrimestre" | "trimestre";
  label: string;
  price: number;
  originalPrice: number;
  discount: string;
};

export const PRE_PAYMENTS: PrePayment[] = [
  { id: "trimestre",    label: "Trimestre",    price:  7560, originalPrice:  8400, discount: "10% off" },
  { id: "cuatrimestre", label: "Cuatrimestre", price:  9800, originalPrice: 11200, discount: "12.5% off" },
  { id: "semestral",    label: "Semestral",   price: 14280, originalPrice: 16800, discount: "15% off" },
  { id: "anual",        label: "Anual",       price: 26880, originalPrice: 33600, discount: "20% off" },
];

export const MEMBERSHIP_FAQS = [
  {
    q: "¿Hay contrato de permanencia?",
    a: "No. Las membresías mensuales son mes a mes. Cancela cuando quieras avisando con 15 días de anticipación.",
  },
  {
    q: "¿Hay costo de inscripción?",
    a: "Sí, varía por membresía. All Access tiene $5,000 de inscripción. Ejecutiva $1,000. Weekend $1,500. Junior y membresías anticipadas sin inscripción.",
  },
  {
    q: "¿Puedo congelar mi membresía si viajo?",
    a: "Sí. Hasta 30 días al año en bloques mínimos de 7 días, sin costo extra.",
  },
  {
    q: "¿Tienen día de prueba?",
    a: "Sí. Agenda tu visita guiada por WhatsApp y te invitamos a una clase y un día completo de gimnasio sin costo.",
  },
  {
    q: "¿Cómo pago la membresía?",
    a: "Para tu conveniencia, aceptamos pago con tarjeta de crédito o débito, transferencia y efectivo. Y también todo esto lo puedes hacer directamente en recepción.",
  },
  {
    q: "¿Puedo cambiar de plan después?",
    a: "Sí, en cualquier momento.",
  },
];
