/**
 * Copys centralizados v2 — tono editorial corto, sin marketing.
 */

export const SITE = {
  name: "Arcos Fitness Club",
  shortName: "Arcos",
  tagline: "Strength. Recovery. Belonging.",
  address: "Paseo de los Tamarindos 98, Cuajimalpa, CDMX",
  phone: "55 9135 0325",
  email: "info@arcosfitness.com",
  hours: [
    { day: "Lun a Jue", time: "6:00 — 22:00" },
    { day: "Viernes", time: "6:00 — 21:00" },
    { day: "Sábado", time: "8:00 — 17:00" },
    { day: "Domingo", time: "9:00 — 15:00" },
  ],
  social: {
    instagram: "https://instagram.com/arcosfitness",
    facebook: "https://facebook.com/arcosfitness",
    tiktok: "https://tiktok.com/@arcosfitness",
    youtube: "https://youtube.com/@arcosfitness",
  },
};

export const NAV = [
  { label: "Inicio", href: "/" },
  { label: "Clases", href: "/clases-reservas" },
  { label: "Hyrox", href: "/hyrox" },
  { label: "Membresías", href: "/membresias" },
];

export const NAV_FOOTER = [
  ...NAV,
  { label: "Nosotros", href: "/nosotros" },
];

/** Hero photos curados — dark, architectural, premium */
export const HEROES = {
  home: "https://images.unsplash.com/photo-1623874514711-0f321325f318?auto=format&fit=crop&w=2400&q=85",
  clases: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=2400&q=85",
  hyrox: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=2400&q=85",
  membresias: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=2400&q=85",
  nosotros: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2400&q=85",
  ctaHome: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=2400&q=85",
  ctaClases: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2400&q=85",
  ctaHyrox: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=2400&q=85",
  ctaMembresias: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=2400&q=85",
  ctaNosotros: "https://images.unsplash.com/photo-1605296867424-35fc25c9212a?auto=format&fit=crop&w=2400&q=85",
};

/** Facilities scroll — fotos verticales premium */
export const FACILITIES = [
  {
    title: "Sala de Pesas",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=85",
  },
  {
    title: "Hyrox Box",
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1600&q=85",
  },
  {
    title: "Estudio Yoga",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=85",
  },
  {
    title: "Spa & Recovery",
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1600&q=85",
  },
];

export const HOME = {
  hero: {
    eyebrow: "01 / Arcos Fitness Club",
    headline: ["Strength.", "Recovery.", "Belonging."],
    italicWord: "Belonging.",
    cta: { label: "Reservar visita", action: "wa-visit" },
  },
  statement: {
    eyebrow: "05 / Filosofía",
    body: "Un club privado en Cuajimalpa. Para quienes vuelven no por obligación, sino porque acá se sienten en casa.",
    link: { label: "Conocer Arcos", href: "/nosotros" },
  },
  hyrox: {
    number: "04",
    headline: ["HYROX.", "Una sola meta."],
    italicWord: "meta.",
    body: "Único centro Hyrox certificado en la zona.",
    link: { label: "Conocer programa", href: "/hyrox" },
  },
  membresia: {
    eyebrow: "04 / Membresías",
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
    cta: { label: "Reservar por WhatsApp", action: "wa-visit" },
  },
};

export const CLASES = {
  hero: {
    eyebrow: "02 / Agenda",
    headline: ["Reserva", "tu próxima clase."],
    italicWord: "clase.",
  },
  cierre: {
    eyebrow: "Visita",
    headline: ["Empieza", "esta semana."],
    italicWord: "semana.",
    cta: { label: "Hablar con un coach", action: "wa-generic" },
  },
};

export const HYROX = {
  hero: {
    eyebrow: "03 / Programa Oficial",
    display: "HYROX",
  },
  manifesto: [
    "El deporte de fitness",
    "más exigente del mundo.",
    "Ocho estaciones.",
    "Ocho kilómetros de carrera.",
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
    cta: { label: "Hablar con un coach Hyrox", action: "wa-hyrox" },
  },
};

export const MEMBRESIAS = {
  hero: {
    eyebrow: "04 / Membresías",
    headline: ["Tu ritmo,", "tu plan."],
    italicWord: "plan.",
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
  cierre: {
    eyebrow: "Empezar",
    headline: ["¿Aún", "decidiendo?"],
    italicWord: "decidiendo?",
    cta: { label: "Hablar con el dueño", action: "wa-generic" },
  },
};

export const NOSOTROS = {
  hero: {
    eyebrow: "05 / Nosotros · Desde 2018",
    headline: ["Más que", "un gym."],
    italicWord: "gym.",
  },
  story: {
    eyebrow: "Nuestra historia",
    body:
      "Arcos nació en 2018 cuando el dueño, después de probar todos los gimnasios premium de la ciudad, decidió que faltaba algo: cercanía. Un lugar donde el equipo te saluda por nombre, donde el café del juice bar lo prepara alguien que sabe el tuyo, y donde cada clase se siente personal. Hoy somos más de 800 miembros y seguimos siendo, sobre todo, una comunidad.",
    stats: [
      { value: 800, suffix: "+", label: "Miembros" },
      { value: 8, suffix: " años", label: "Operando" },
      { value: 2400, suffix: " m²", label: "Espacio" },
    ],
  },
  values: [
    {
      number: "01",
      title: "Comunidad",
      body: "Cada miembro es parte del club. Sin números, sin filas anónimas. El equipo conoce tu nombre.",
    },
    {
      number: "02",
      title: "Excelencia",
      body: "Equipo top, coaches certificados, instalaciones impecables. Sin atajos en lo que importa.",
    },
    {
      number: "03",
      title: "Bienestar integral",
      body: "Entrenar es una parte. Recuperar, dormir, comer y conectar también. Cuidamos todas.",
    },
  ],
  cierre: {
    eyebrow: "Visita",
    headline: ["Te esperamos", "en Cuajimalpa."],
    italicWord: "Cuajimalpa.",
    cta: { label: "Agendar visita por WhatsApp", action: "wa-visit" },
  },
};
