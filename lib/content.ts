/**
 * Copys centralizados v2 — tono editorial corto, sin marketing.
 */

import type { DayKey } from "@/lib/classes";

/** Rango de horario del gym por día — usado en Open Gym */
export const GYM_HOURS_BY_DAY: Record<DayKey, string> = {
  lun: "6:00 — 22:00",
  mar: "6:00 — 22:00",
  mie: "6:00 — 22:00",
  jue: "6:00 — 22:00",
  vie: "6:00 — 21:00",
  sab: "8:00 — 17:00",
  dom: "9:00 — 15:00",
};

export const SITE = {
  name: "Arcos Fitness Club",
  shortName: "Arcos",
  tagline: "Strength. Recovery. Belonging.",
  address: "Paseo Arcos Bosques, CDMX. Dentro del hotel LIVE AQUA®.",
  phone: "55 9135 0325",
  email: "info@arcosfitness.com",
  hours: [
    { day: "Lun a Jue", time: "6:00 — 22:00" },
    { day: "Viernes", time: "6:00 — 21:00" },
    { day: "Sábado", time: "8:00 — 17:00" },
    { day: "Domingo", time: "9:00 — 15:00" },
  ],
  social: {
    instagram: "https://instagram.com/arcosfitnessclub",
    facebook: "https://facebook.com/arcosfitnessclub",
    tiktok: "https://tiktok.com/@arcos_fitness_club",
    youtube: "https://youtube.com/@arcosfitnessclub",
  },
};

export const NAV = [
  { label: "Inicio", href: "/" },
  { label: "Membresías", href: "/membresias" },
  { label: "Hyrox", href: "/hyrox" },
  { label: "Clases", href: "/clases-reservas" },
];

export const NAV_FOOTER = [
  ...NAV,
];

/** Hero photos curados — dark, architectural, premium */
export const HEROES = {
  home: "/images/hero/heroLOGO.jpeg",
  clases: "/images/hero/clases-hero.jpeg",
  hyrox: "/images/hero/home.jpg",
  membresias: "/images/hero/membresias.jpg",
  ctaHome: "/images/visita-bg.jpeg",
  ctaClases: "/images/hero/clases-cta.jpeg",
  ctaHyrox: "/images/hyrox-cta.jpeg",
  ctaMembresias: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=2400&q=85",
};

/** Facilities scroll — fotos verticales premium */
export const FACILITIES = [
  {
    title: "Peso libre",
    image: "/images/facilities/peso-libre.png",
  },
  {
    title: "Peso Integrado",
    image: "/images/facilities/peso-integrado.png",
  },
  {
    title: "Cardio / Funcional",
    image: "/images/hero/hyrox.jpg",
  },
  {
    title: "Protein Lab",
    image: "/images/facilities/protein-lab.png",
  },
  {
    title: "Vestidores",
    image: "/images/facilities/vestidores.png",
  },
];

export const HOME = {
  hero: {
    eyebrow: "01 / Inicio",
    headline: ["Fitness", "redefinido"],
    italicWord: "redefinido",
    cta: { label: "Reservar visita", action: "wa-visit" },
  },
  statement: {
    eyebrow: "Filosofía",
    body: "Club privado en Bosques de las Lomas. Para quienes vuelven no por obligación, sino por compromiso.",
  },
  hyrox: {
    number: "03",
    headline: ["HYROX.", "Fitness hecho carrera."],
    italicWord: "carrera.",
    body: "Prepárate para tu primer Hyrox.",
    link: { label: "Conocer más", href: "/hyrox" },
  },
  membresia: {
    eyebrow: "02 / Membresías",
    headline: ["Tres formas", "de pertenecer."],
    italicWord: "pertenecer.",
    body: "Básico · Pro · Élite. Sin contratos.",
    link: { label: "Ver planes", href: "/membresias" },
  },
  testimonial: {
    quote:
      "Cambié de gimnasio tres veces antes de Arcos. Aquí me quedo.",
    author: "Ricardo M.",
    role: "Miembro desde 2023",
  },
  cierre: {
    eyebrow: "Visita",
    headline: ["Conoce", "el club."],
    italicWord: "club.",
    cta: { label: "Reserva tu visita", action: "/clases-reservas" },
  },
};

export const CLASES = {
  hero: {
    eyebrow: "04 / Clases",
    headline: ["Reserva", "tu próxima sesión."],
    italicWord: "sesión.",
  },
  cierre: {
    eyebrow: "Visita",
    headline: ["Empieza", "esta semana."],
    italicWord: "semana.",
    cta: { label: "Agenda tu visita", action: "#schedule" },
  },
};

export const HYROX = {
  hero: {
    eyebrow: "03 / Hyrox",
    display: "HYROX",
  },
  manifesto: [
    "La carrera de fitness",
    "número 1 del mundo.",
    "Ocho kilómetros.",
    "Ocho estaciones de fuerza.",
    "Una sola meta.",
  ],
  program: [
    {
      number: "01",
      weeks: "Semanas 1 — 4",
      title: "Base aeróbica",
      body: "Construcción de resistencia y técnica de running. Sin cargas pesadas, foco en cadencia y respiración.",
    },
    {
      number: "02",
      weeks: "Semanas 5 — 8",
      title: "Fuerza específica",
      body: "Sled push, farmer carry, wall balls. Patrones reales de competencia con carga progresiva.",
    },
    {
      number: "03",
      weeks: "Semanas 9 — 12",
      title: "Race simulation",
      body: "Simulacros completos cronometrados. Llegas a race day listo para correr tu mejor tiempo.",
    },
  ],
  cierre: {
    eyebrow: "Empezar",
    headline: ["Tu primer", "Hyrox."],
    italicWord: "Hyrox.",
    cta: { label: "Contacta a un especialista en Hyrox", action: "wa-hyrox" },
  },
};

export const MEMBRESIAS = {
  hero: {
    eyebrow: "02 / Membresías",
    headline: ["Elige", "tu nivel."],
    italicWord: "nivel.",
  },
  faqs: [
    {
      q: "¿Hay contrato de permanencia?",
      a: "No. Todos los planes son mes a mes. Cancela cuando quieras avisando con 30 días de anticipación.",
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
      q: "¿Cómo pago la mensualidad?",
      a: "Cargo automático a tarjeta de débito o crédito. También aceptamos transferencia y efectivo en recepción.",
    },
    {
      q: "¿Puedo cambiar de plan después?",
      a: "Sí, en cualquier momento. El cambio aplica desde el siguiente ciclo de cobro.",
    },
  ],
};

