/**
 * JSON-LD structured data (schema.org).
 * Construido desde la fuente única de verdad: SITE, PLANS, MEMBERSHIP_FAQS.
 * Si cambian precios/horarios/datos en esos archivos, este schema se actualiza solo.
 */

import { SITE } from "@/lib/content";
import { PLANS, MEMBERSHIP_FAQS } from "@/lib/memberships";

const BASE = "https://www.arcosfitness.com";

/** Mapea los horarios de SITE a openingHoursSpecification de schema.org */
const OPENING_HOURS = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    opens: "06:00",
    closes: "22:00",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Friday",
    opens: "06:00",
    closes: "21:00",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Saturday",
    opens: "08:00",
    closes: "17:00",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Sunday",
    opens: "09:00",
    closes: "15:00",
  },
];

/** HealthClub es un subtipo de LocalBusiness — el más específico para un gimnasio. */
export function healthClubSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HealthClub",
    "@id": `${BASE}/#organization`,
    name: SITE.name,
    description:
      "Club privado de fitness en Bosques de las Lomas, CDMX, dentro del hotel LIVE AQUA®. Hyrox, clases en grupo, entrenamiento personalizado y recuperación.",
    slogan: SITE.tagline,
    url: BASE,
    telephone: "+525591350325",
    email: SITE.email,
    image: `${BASE}/images/hero/home.jpg`,
    logo: `${BASE}/images/logo-arcos.png`,
    priceRange: "$$",
    currenciesAccepted: "MXN",
    paymentAccepted: "Tarjeta de crédito, Tarjeta de débito, Transferencia, Efectivo",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Paseo Arcos Bosques",
      addressLocality: "Bosques de las Lomas",
      addressRegion: "Ciudad de México",
      addressCountry: "MX",
    },
    areaServed: { "@type": "City", name: "Ciudad de México" },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 19.3862201,
      longitude: -99.2529004,
    },
    hasMap: "https://www.google.com/maps/search/?api=1&query=19.3862201,-99.2529004",
    openingHoursSpecification: OPENING_HOURS,
    sameAs: [
      SITE.social.instagram,
      SITE.social.facebook,
      SITE.social.tiktok,
      SITE.social.youtube,
    ],
    makesOffer: PLANS.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: plan.price,
      priceCurrency: "MXN",
      category: plan.periodicity === "mensual" ? "Membresía mensual" : "Pago único",
    })),
  };
}

/** FAQPage desde las preguntas frecuentes de membresías (texto plano). */
export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: MEMBERSHIP_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}
