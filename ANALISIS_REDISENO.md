# Análisis y Documentación: Rediseño Arcos Fitness Club

> **Fecha:** Mayo 2026  
> **Versión:** 1.0  
> **Autor:** Equipo de desarrollo

---

## 1. Resumen ejecutivo

La nueva página es una reconstrucción completa desde cero, migrando de un sitio hecho en **Wix** a una aplicación web custom con **Next.js 16 + React 19 + TypeScript**. El resultado es un producto propio, con sistema de diseño propio, control total del código y una experiencia premium que la plataforma Wix no podía ofrecer.

---

## 2. Stack tecnológico

### Página original (arcosfitness.com)

| Capa | Tecnología |
|---|---|
| Plataforma | Wix (SaaS, sin acceso al código) |
| Imágenes | `static.wixstatic.com` con parámetros de compresión |
| Tipografía | Sans-serif genérica del tema Wix |
| Hosting | Servidores de Wix |
| Formularios | Sistema nativo de Wix (sin validación avanzada) |
| SEO | Limitado a las opciones del panel de Wix |
| Animaciones | Nulas o mínimas (las del template) |
| Código fuente | Inaccesible / no personalizable |

### Nueva página

| Capa | Tecnología |
|---|---|
| Framework | **Next.js 16.2.6** con **Turbopack** (bundler ultra-rápido) |
| UI runtime | **React 19** |
| Lenguaje | **TypeScript 5** |
| Estilos | **Tailwind CSS v4** (nueva sintaxis `@theme`, sin config.js) |
| Animaciones | **Framer Motion 12** (scroll-triggered, spring physics) |
| Íconos | **Lucide React** |
| Drawer/Sheet | **Vaul** (primitive nativo tipo iOS) |
| Carrusel | **Embla Carousel** |
| Fuentes | **next/font/google** → Inter, Instrument Serif, JetBrains Mono (cero layout shift) |
| Helpers de clase | `clsx` + `tailwind-merge` + `class-variance-authority` |
| Hosting esperado | Vercel (optimizado para Next.js) |

---

## 3. Arquitectura del proyecto

```
arcosfitnesspage/
├── app/                        ← App Router de Next.js (SSR por default)
│   ├── page.tsx                ← Home
│   ├── clases-reservas/        ← Agenda semanal + reservas
│   ├── hyrox/                  ← Página dedicada al programa Hyrox
│   ├── membresias/             ← Planes y comparador
│   ├── nosotros/               ← Historia, equipo, ubicación
│   ├── sitemap.ts              ← Sitemap auto-generado
│   └── robots.ts               ← robots.txt
├── components/
│   ├── layout/                 ← Header, Footer, WhatsApp FAB, Logo
│   ├── sections/               ← Secciones de página (Hero, Schedule, etc.)
│   ├── primitives/             ← Reveal, Marquee, AnimatedCounter, Eyebrow
│   └── ui/                     ← Button, Accordion (design system base)
└── lib/
    ├── content.ts              ← Todos los textos centralizados
    ├── classes.ts              ← Datos de clases e instructores
    ├── memberships.ts          ← Planes y FAQs
    ├── whatsapp.ts             ← Constructor de links de WhatsApp
    ├── motion.ts               ← Variantes de animación compartidas
    └── cn.ts                   ← Helper de clases condicionales
```

---

## 4. Páginas y secciones implementadas

### Home (`/`)

| Sección | Descripción |
|---|---|
| **Hero** | Título animado con stagger line-by-line, foto principal, social proof (+800 miembros con avatares), dos CTAs |
| **Marquee** | Banda infinita animada con tags del club |
| **ValueProps** | 4 propuestas de valor (Comunidad, Equipo Pro, Hyrox Box, Spa) |
| **FacilityShowcase** | Grid de 6 instalaciones con imágenes y descripciones |
| **ClassPreview** | Vista previa de disciplinas disponibles |
| **HyroxSplit** | Sección destacada para el programa Hyrox |
| **MembershipCards** | Los 3 planes con precios, features y CTAs |
| **Testimonials** | 3 testimonios reales con foto y rol |
| **CTASection** | Cierre de página con CTA principal |

### Clases & Reservas (`/clases-reservas`)

| Sección | Descripción |
|---|---|
| **PageHero** | Hero de sección reutilizable |
| **ScheduleGrid** | Agenda 7 días × 6 disciplinas, filtro por categoría, grid desktop / acordeón mobile, animación de filtro con Framer Motion |
| **ReservaDrawer** | Drawer lateral (Vaul) con detalle completo de la clase: imagen, instructor, duración, cupo, nivel, sala, descripción + botón de reserva por WhatsApp con mensaje pre-formado |
| **Marquee volt** | Banda de disciplinas en color acento |
| **InstructorsGrid** | Grid de coaches con foto, nombre y especialidad |

### Hyrox (`/hyrox`)

| Sección | Descripción |
|---|---|
| **Hero full-bleed** | Imagen a pantalla completa con overlay, tipografía display gigante |
| **¿Qué es Hyrox?** | Explicación del formato con stats: 8 estaciones, 8 km, 60 min objetivo |
| **Timeline 12 semanas** | Grid de 3 fases del programa (Base → Fuerza → Race Simulation) con hover animado a color volt |
| **Clases Hyrox** | ScheduleGrid filtrado solo para clases Hyrox |
| **Coaches Hyrox** | Sub-grid de los coaches especializados |
| **FAQs** | Accordion interactivo con preguntas frecuentes |

### Membresías (`/membresias`)

| Sección | Descripción |
|---|---|
| **MembershipCards** | Los 3 planes (Básico, Pro, Élite) con precio, tagline y features |
| **ComparisonTable** | Tabla comparativa detallada feature por feature |
| **CommonAmenities** | Amenidades compartidas por todos los planes |
| **FAQs** | Accordion con las preguntas más comunes antes de inscribirse |

### Nosotros (`/nosotros`)

| Sección | Descripción |
|---|---|
| **StorySection** | Historia de la fundación del club (2018) |
| **FacilityShowcase** | Reutilización del componente de instalaciones |
| **Values** | Los 3 valores del club |
| **InstructorsGrid** | Equipo completo de coaches |
| **LocationSection** | Ubicación, mapa, horarios completos |

---

## 5. Sistema de diseño

La nueva página tiene un **design system propio** definido en `globals.css` con la nueva API `@theme` de Tailwind v4:

| Token | Valor | Uso |
|---|---|---|
| `--color-ink` | `#0a0a0a` | Texto principal, fondos oscuros |
| `--color-paper` | `#fafafa` | Fondo base del sitio |
| `--color-bone` | `#f1efe9` | Fondo cálido para secciones alternas |
| `--color-volt` | `#fff501` | Amarillo neón — color de acción y acento |
| `--color-mute` | `#6b6b6b` | Textos secundarios, labels |
| `--font-sans` | Inter | Texto corrido y UI |
| `--font-display` | Instrument Serif | Títulos editoriales, italics |
| `--font-mono` | JetBrains Mono | Labels, datos técnicos, eyebrows |
| `--text-display` | `clamp(3rem, 8vw, 7.5rem)` | Tipografía fluida |
| `--ease-premium` | `cubic-bezier(0.22, 1, 0.36, 1)` | Curva de animación premium |
| `--spacing-section` | `clamp(4rem, 10vw, 9rem)` | Padding de sección fluido |

---

## 6. Mejoras respecto a la página original

### 6.1 Arquitectura y control

| Aspecto | Original (Wix) | Nueva |
|---|---|---|
| Acceso al código | ❌ Ninguno | ✅ 100% propio |
| Dependencia de plataforma | ❌ Total | ✅ Código libre, deploy en cualquier servicio |
| Personalización | ❌ Limitada al editor Wix | ✅ Sin límites |
| Control de contenido | ❌ Panel Wix | ✅ Archivo `lib/content.ts` — editar texto es cambiar una línea |

### 6.2 Rendimiento

| Aspecto | Original | Nueva |
|---|---|---|
| Bundler | JavaScript de Wix (no optimizable) | **Turbopack** (compilación incremental en ms) |
| Imágenes | Servidas desde `wixstatic.com` | **`next/image`** con lazy loading, tamaños adaptativos, AVIF/WebP |
| Fuentes | Cargadas desde CDN externo (bloquean render) | **`next/font`** — cero layout shift, zero network request extra |
| JavaScript enviado al cliente | Todo el runtime de Wix | Server Components por default — JS mínimo al cliente |
| Layout shift (CLS) | Alto potencial | Eliminado por `next/font` + `next/image` |

### 6.3 Experiencia de usuario

| Aspecto | Original | Nueva |
|---|---|---|
| Animaciones | Nulas (template básico) | Scroll-triggered reveals, stagger de títulos, animated counters, marquee, spring nav underline |
| Navegación mobile | Menú hamburguesa genérico | Full-screen overlay animado con display serif, numeración, spring motion |
| Header | Estático | Sticky con transición a glassmorphism al hacer scroll |
| Agenda de clases | No existía en la web | **ScheduleGrid**: 7 días × 6 disciplinas, filtro por categoría, reserva por drawer |
| Reserva de clases | Formulario genérico | **ReservaDrawer** con imagen, detalles, coach, sala, cupo, nivel y mensaje de WhatsApp pre-formado |
| WhatsApp | Botón fijo genérico | **FAB flotante con animación volt-pulse**, mensaje diferente según contexto y página |
| Membresías | Sección básica sin comparación | Cards + **Tabla comparativa** feature-by-feature + FAQs |

### 6.4 SEO y posicionamiento

| Aspecto | Original | Nueva |
|---|---|---|
| Metadata | Básica vía panel Wix | **Metadata API de Next.js**: title template, description, keywords, OG, Twitter card |
| Sitemap | Generado por Wix (limitado) | **`/sitemap.xml`** auto-generado con prioridades y frecuencias personalizadas |
| robots.txt | Genérico de Wix | **`/robots.txt`** propio |
| Locale HTML | No definido | `lang="es-MX"` en el HTML root |
| URLs | Genéricas de Wix | Slugs propios: `/clases-reservas`, `/hyrox`, `/membresias`, `/nosotros` |
| Horarios en la web | Truncados (bug existente) | Completos y correctos en footer y página de nosotros |

### 6.5 Profundidad de contenido

| Aspecto | Original | Nueva |
|---|---|---|
| Hyrox | Una sección mínima | **Página completa**: qué es, programa 12 semanas, coaches, agenda filtrada, FAQs |
| Instalaciones | Nombres genéricos | 6 instalaciones con nombre, imagen y descripción detallada |
| Instructores | No visibles en la web | **Grid de coaches** con foto, nombre y especialidad |
| Testimoniales | No existían | 3 testimonios con foto, nombre y antigüedad |
| Historia del club | Muy básica | StorySection completa: fundación 2018, motivación, comunidad |
| Valores del club | No existían | Sección de 3 valores |

### 6.6 Integración WhatsApp contextual

La nueva página genera mensajes diferentes según la acción del usuario — no es el mismo botón en todas partes:

| Contexto | Mensaje generado |
|---|---|
| FAB flotante / header | "Hola Arcos Fitness 👋, me gustaría más información sobre el club." |
| Reservar visita | "...me gustaría agendar una visita al club." |
| Programa Hyrox | "...estoy interesado en el programa Hyrox. ¿Podemos hablar?" |
| Plan de membresía | "...me interesa el plan [Básico/Pro/Élite]. ¿Podemos agendar una visita?" |
| Clase específica | "...quiero reservar la clase de [nombre] el [día] a las [hora] con [coach]. ¿Hay cupo disponible?" |

---

## 7. Lo que aún no tiene la nueva página (áreas de mejora futura)

- **Fotos reales del club** — actualmente usa imágenes de Unsplash como placeholders
- **CMS o panel de edición** — el contenido vive en archivos `.ts`; no hay panel para que el staff edite sin código
- **Pagos en línea** — el flujo de reserva termina en WhatsApp; no hay integración con Stripe u otra plataforma
- **Formulario de contacto** — se simplificó a WhatsApp directo; no hay formulario de email
- **Blog o noticias** — podría sumarse como ruta dinámica de Next.js
- **Sistema de gestión de clases en tiempo real** — el schedule actual es estático en `lib/classes.ts`

---

## 8. Conclusión

La nueva página eleva la presencia digital de Arcos Fitness Club de un sitio Wix genérico sin interactividad real, a una aplicación web premium con:

- Sistema de diseño editorial propio (tipografía en tres niveles, color volt como firma)
- Arquitectura escalable y código 100% propietario
- UX diseñada para convertir visitantes en miembros vía WhatsApp (reserva en menos de 1 minuto)
- Rendimiento optimizado: Turbopack, Server Components, `next/image`, `next/font`
- SEO técnico completo: metadata, sitemap, robots, OG tags, locale
- Una base técnica sobre la que se puede construir cualquier funcionalidad futura sin restricciones de plataforma
