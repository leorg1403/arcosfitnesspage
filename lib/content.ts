/**
 * Copys centralizados v2 — tono editorial corto, sin marketing.
 */

export const SITE = {
  name: "Arcos Fitness Club",
  shortName: "Arcos",
  tagline: "Strength. Recovery. Belonging.",
  address: "Paseo de los Tamarindos 98, Bosques de las Lomas, CDMX",
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
  { label: "Nosotros", href: "/nosotros" },
];

/** Hero photos curados — dark, architectural, premium */
export const HEROES = {
  home: "/images/hero/heroLOGO.jpeg",
  clases: "/images/hero/clases.jpg",
  hyrox: "/images/hero/home.jpg",
  membresias: "/images/hero/membresias.jpg",
  nosotros: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2400&q=85",
  ctaHome: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=2400&q=85",
  ctaClases: "/images/hero/clases.png",
  ctaHyrox: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=2400&q=85",
  ctaMembresias: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=2400&q=85",
  ctaNosotros: "https://images.unsplash.com/photo-1605296867424-35fc25c9212a?auto=format&fit=crop&w=2400&q=85",
};

/** Facilities scroll — fotos verticales premium */
export const FACILITIES = [
  {
    title: "Peso libre",
    image: "/images/facilities/peso-libre.png",
  },
  {
    title: "Hyrox",
    subtitle: "Cardio/Funcional",
    image: "/images/hero/hyrox.jpg",
  },
  {
    title: "Peso Integrado",
    image: "/images/facilities/peso-integrado.png",
  },
  {
    title: "Protein Lab",
    image: "/images/facilities/protein-lab.jpg",
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
    eyebrow: "01 / Filosofía",
    body: "Un club privado en Bosques de las Lomas. Para quienes vuelven no por obligación, sino porque acá se sienten en casa.",
    link: { label: "Conocer Arcos", href: "/nosotros" },
  },
  hyrox: {
    number: "03",
    headline: ["HYROX.", "Una sola meta."],
    italicWord: "meta.",
    body: "Único centro Hyrox certificado en la zona.",
    link: { label: "Conocer programa", href: "/hyrox" },
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
    cta: { label: "Reservar por WhatsApp", action: "wa-visit" },
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
    cta: { label: "Hablar con un especialista", action: "wa-generic" },
  },
};

export const HYROX = {
  hero: {
    eyebrow: "03 / Hyrox",
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
  cierre: {
    eyebrow: "Empezar",
    headline: ["¿Aún", "decidiendo?"],
    italicWord: "decidiendo?",
    cta: { label: "Hablar con el dueño", action: "wa-generic" },
  },
};

export const NOSOTROS = {
  hero: {
    eyebrow: "05 / Nosotros",
    headline: ["Un paraíso", "de fierros."],
    italicWord: "fierros.",
  },
  story: {
    eyebrow: "Cómo nació",
    body:
      "Arcos nació en plena pandemia. Cuando el gimnasio al que asistía el fundador cerró sus puertas, el entrenamiento en casa lo obligó a regresar a las raíces del fitness — y a ver lo que faltaba en la mayoría de los establecimientos: el paquete completo. Los conceptos sólidos de gym databan de hace cinco décadas. Así surgió Arcos: un espacio que se sintiera como un gimnasio de verdad. No un club social. No una moda. Un paraíso de fierros, con la experiencia y la tecnología del presente.",
    pillars: [
      { eyebrow: "Filosofía", title: "Paraíso de fierros." },
      { eyebrow: "Promesa", title: "El paquete completo." },
      { eyebrow: "Resultado", title: "Cuerpos de antaño, hoy." },
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
    headline: ["Te esperamos", "en Arcos."],
    italicWord: "Arcos.",
    cta: { label: "Agendar visita por WhatsApp", action: "wa-visit" },
  },
};
