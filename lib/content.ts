/**
 * Copys centralizados. Edita aquí para cambiar el tono en todo el sitio.
 */

export const SITE = {
  name: "Arcos Fitness Club",
  shortName: "Arcos",
  tagline: "Entrena. Recupera. Pertenece.",
  address: "Paseo de los Tamarindos 98, Cuajimalpa, CDMX",
  phone: "55 9135 0325",
  email: "info@arcosfitness.com",
  hours: [
    { day: "Lunes a Jueves", time: "6:00 – 22:00" },
    { day: "Viernes", time: "6:00 – 21:00" },
    { day: "Sábado", time: "8:00 – 17:00" },
    { day: "Domingo", time: "9:00 – 15:00" },
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
  { label: "Clases & Reservas", href: "/clases-reservas" },
  { label: "Hyrox", href: "/hyrox" },
  { label: "Membresías", href: "/membresias" },
  { label: "Nosotros", href: "/nosotros" },
];

export const HOME_HERO = {
  eyebrow: "Cuajimalpa · CDMX",
  display: "Entrena. Recupera.\nPertenece.",
  subhead:
    "Un club privado de fitness donde cada detalle —desde el equipo hasta el café— está pensado para que vuelvas mañana.",
  primaryCTA: { label: "Reservar mi visita", action: "wa-visit" },
  secondaryCTA: { label: "Ver clases", href: "/clases-reservas" },
};

export const VALUE_PROPS = [
  { title: "Comunidad", body: "Donde el equipo conoce tu nombre y tu rutina.", icon: "Users" },
  { title: "Equipo Pro", body: "Coaches certificados, entrenamiento personalizado.", icon: "Dumbbell" },
  { title: "Hyrox Box", body: "El único centro Hyrox certificado de la zona.", icon: "Zap" },
  { title: "Spa & Recovery", body: "Sauna, vapor y zona de recuperación.", icon: "Droplets" },
];

export const TESTIMONIOS = [
  {
    quote:
      "Cambié de gimnasio tres veces antes de Arcos. Aquí me quedo. La gente, el equipo, el lugar — todo encaja.",
    author: "Ricardo M.",
    role: "Miembro desde 2023",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    quote:
      "Las clases de Hyrox cambiaron mi forma de entrenar. Y el spa hace que ir el viernes sea un ritual.",
    author: "Mariana L.",
    role: "Miembro desde 2024",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
  },
  {
    quote:
      "Vine por una visita y me inscribí el mismo día. La atención del dueño es directa, sin rodeos.",
    author: "Andrés T.",
    role: "Miembro desde 2024",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
];

export const FACILITIES = [
  {
    title: "Sala de Pesas",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80",
    description: "Equipo Hammer Strength, mancuernas hasta 50kg, racks olímpicos.",
  },
  {
    title: "Estudio Cycle",
    image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1600&q=80",
    description: "20 bicicletas Stages SC3 con sistema de iluminación.",
  },
  {
    title: "Hyrox Box",
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1600&q=80",
    description: "Único centro certificado Hyrox de la zona.",
  },
  {
    title: "Estudio Yoga & Pilates",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=80",
    description: "Pisos calefactados, luz natural, máquinas reformer.",
  },
  {
    title: "Spa & Sauna",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1600&q=80",
    description: "Sauna seco, vapor, zona de hielo y descanso.",
  },
  {
    title: "Café & Juice Bar",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80",
    description: "Café de especialidad, smoothies, comida saludable.",
  },
];

export const HYROX = {
  hero: {
    eyebrow: "Programa oficial",
    display: "HYROX",
    subhead:
      "El deporte de fitness más exigente del mundo. 8 estaciones funcionales. 8 km de carrera. Una sola meta.",
  },
  what: {
    title: "8 estaciones. 1 km entre cada una.",
    body:
      "Hyrox combina running con ejercicios funcionales en un formato estandarizado a nivel mundial. Empezamos con 1 km de carrera, seguido de una estación, y así por 8 rondas. La meta no es solo terminar — es competir contra ti, contra el reloj, y contra atletas en todo el mundo.",
  },
  program: [
    { weeks: "Semanas 1–4", title: "Base aeróbica", body: "Construcción de resistencia y técnica de running." },
    { weeks: "Semanas 5–8", title: "Fuerza específica", body: "Sled push, farmer carry, wall balls. Patrones reales de competencia." },
    { weeks: "Semanas 9–12", title: "Race simulation", body: "Simulacros completos cronometrados. Listos para race day." },
  ],
  faqs: [
    { q: "¿Necesito experiencia previa?", a: "No. Tenemos clases para todos los niveles, desde 'Hyrox Open' hasta 'Hyrox Race Day'. El coach te ubica el primer día." },
    { q: "¿Qué incluye el programa?", a: "Acceso a todas las clases Hyrox, un plan de 12 semanas, evaluaciones quincenales y descuento en eventos oficiales Hyrox." },
    { q: "¿Necesito plan Pro o Élite?", a: "El acceso Hyrox está incluido en planes Pro y Élite. Si tienes Básico, podemos hablar de upgrade." },
  ],
};

export const ABOUT = {
  hero: {
    eyebrow: "Desde 2018",
    display: "Más que un gym.",
    subhead: "Un espacio donde tu nombre se conoce y tu progreso se celebra.",
  },
  story: {
    eyebrow: "Nuestra historia",
    title: "Empezamos por algo simple: un mejor lugar para entrenar.",
    body: "Arcos nació en 2018 cuando el dueño, después de probar todos los gimnasios premium de la ciudad, decidió que faltaba algo: cercanía. Un lugar donde el equipo te saluda por nombre, donde el café del juice bar lo prepara alguien que sabe el tuyo, y donde cada clase se siente personal. Hoy somos más de 800 miembros y seguimos siendo, sobre todo, una comunidad.",
  },
  values: [
    { title: "Comunidad", body: "Cada miembro es parte del club. Sin números, sin filas anónimas." },
    { title: "Excelencia", body: "Equipo top, coaches certificados, instalaciones impecables. Sin atajos." },
    { title: "Bienestar integral", body: "Entrenar es parte. Recuperar, dormir, comer y conectar también." },
  ],
};

export const FINAL_CTA = {
  eyebrow: "Empieza hoy",
  title: "¿Listo para conocer Arcos?",
  body: "Agenda tu visita guiada por WhatsApp. Sin compromisos, sin presión.",
};
