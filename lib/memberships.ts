export type Plan = {
  id: "basico" | "pro" | "elite";
  name: string;
  tagline: string;
  price: number; // MXN/mes
  badge?: string;
  features: string[];
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "basico",
    name: "Básico",
    tagline: "Para empezar.",
    price: 1490,
    features: [
      "Acceso a sala de pesas y cardio",
      "Lunes a viernes 6:00–22:00",
      "Vestidores y lockers",
      "Estacionamiento incluido",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "El plan favorito.",
    price: 1990,
    badge: "Más popular",
    highlight: true,
    features: [
      "Todo lo del plan Básico",
      "Acceso 7 días a la semana",
      "Clases en grupo ilimitadas",
      "Acceso a Hyrox y áreas especializadas",
      "1 sesión de evaluación con coach",
    ],
  },
  {
    id: "elite",
    name: "Élite",
    tagline: "La experiencia completa.",
    price: 2890,
    features: [
      "Todo lo del plan Pro",
      "Spa, sauna y vapor incluidos",
      "Toallas premium ilimitadas",
      "Invitado +1, 2 veces al mes",
      "2 sesiones de personal training al mes",
      "Acceso prioritario a clases con cupo",
    ],
  },
];

export const COMPARISON_FEATURES = [
  { label: "Sala de pesas y cardio", basico: true, pro: true, elite: true },
  { label: "Acceso 7 días", basico: false, pro: true, elite: true },
  { label: "Clases en grupo ilimitadas", basico: false, pro: true, elite: true },
  { label: "Hyrox", basico: false, pro: true, elite: true },
  { label: "Spa & sauna", basico: false, pro: false, elite: true },
  { label: "Personal training", basico: false, pro: "1 evaluación", elite: "2 sesiones/mes" },
  { label: "Invitado +1", basico: false, pro: false, elite: "2 veces/mes" },
  { label: "Toallas premium", basico: false, pro: false, elite: true },
  { label: "Estacionamiento", basico: true, pro: true, elite: true },
  { label: "Lockers", basico: true, pro: true, elite: true },
];

export const COMMON_AMENITIES = [
  { label: "Estacionamiento", icon: "Car" },
  { label: "Vestidores", icon: "Lock" },
  { label: "Wi-Fi", icon: "Wifi" },
  { label: "Café & juice bar", icon: "Coffee" },
  { label: "App móvil", icon: "Smartphone" },
  { label: "Tienda Arcos", icon: "ShoppingBag" },
];

export const MEMBERSHIP_FAQS = [
  {
    q: "¿Hay contrato de permanencia?",
    a: "No. Todos los planes son mes a mes. Cancela cuando quieras avisando con 30 días de anticipación.",
  },
  {
    q: "¿Puedo congelar mi membresía si viajo?",
    a: "Sí. Puedes congelar hasta 30 días al año, en bloques mínimos de 7 días, sin costo extra.",
  },
  {
    q: "¿Tienen día de prueba?",
    a: "Sí. Agenda tu visita guiada por WhatsApp y te invitamos a una clase y un día completo de gimnasio sin costo.",
  },
  {
    q: "¿Cómo pago la mensualidad?",
    a: "Cargo automático a tarjeta de débito o crédito. También aceptamos transferencia y efectivo en recepción.",
  },
  {
    q: "¿Puedo cambiar de plan después?",
    a: "Sí, en cualquier momento. El cambio aplica desde el siguiente ciclo de cobro.",
  },
];
