import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Aviso de Privacidad",
  description:
    "Aviso de privacidad de Arcos Fitness Club: qué datos personales recabamos, para qué los usamos y cómo ejercer tus derechos ARCO.",
};

/** Fecha de última actualización del aviso (actualizar al modificar el texto). */
const LAST_UPDATED = "4 de junio de 2026";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-14 mb-4 font-display text-2xl md:text-3xl font-bold tracking-[-0.02em] text-ink">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-base leading-relaxed text-ink/70">{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="relative pl-5 text-base leading-relaxed text-ink/70 before:absolute before:left-0 before:top-[0.7em] before:size-1 before:bg-gold">
      {children}
    </li>
  );
}

export default function AvisoDePrivacidadPage() {
  return (
    <section className="bg-paper">
      <div className="container-wide section-y">
        <div className="max-w-3xl">
          <Eyebrow tone="gold" withLine>
            Legal
          </Eyebrow>
          <h1 className="mt-6 font-display text-headline tracking-[-0.03em] leading-[0.95] font-bold text-ink">
            Aviso de Privacidad
          </h1>
          <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-concrete">
            Última actualización · {LAST_UPDATED}
          </p>

          <P>
            En cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de
            los Particulares (LFPDPPP), su Reglamento y los Lineamientos del Aviso de
            Privacidad, ponemos a tu disposición el presente aviso.
          </P>

          <SectionTitle>1. Responsable del tratamiento</SectionTitle>
          <P>
            <span className="font-medium text-ink">{SITE.name}</span> (en adelante, “el Club”),
            con domicilio en {SITE.address}, es responsable del tratamiento de tus datos
            personales. Para cualquier tema relacionado con este aviso puedes escribirnos a{" "}
            <a href={`mailto:${SITE.email}`} className="text-gold-deep underline underline-offset-2">
              {SITE.email}
            </a>
            .
          </P>

          <SectionTitle>2. Datos personales que recabamos</SectionTitle>
          <P>Recabamos únicamente los datos que tú nos proporcionas a través del sitio:</P>
          <ul className="mt-4 space-y-3">
            <Li>
              <span className="font-medium text-ink">Identificación y contacto:</span> nombre,
              apellidos, correo electrónico y teléfono — al enviar el formulario de contacto,
              reservar una clase o contratar una membresía.
            </Li>
            <Li>
              <span className="font-medium text-ink">Datos de reserva:</span> clase, fecha,
              asistencia y, en su caso, la app de fitness con la que accedes (TotalPass,
              Fitpass o Wellhub).
            </Li>
            <Li>
              <span className="font-medium text-ink">Datos de pago:</span> los pagos en línea
              los procesa Stripe; el Club <span className="font-medium text-ink">no recibe ni
              almacena números de tarjeta</span>. Conservamos el registro de la operación
              (concepto, monto, estado) asociado a tu nombre y correo.
            </Li>
            <Li>
              <span className="font-medium text-ink">Historial de membresías y pagos</span>,
              necesario para administrar tu relación con el Club.
            </Li>
          </ul>
          <P>No recabamos datos personales sensibles.</P>

          <SectionTitle>3. Finalidades del tratamiento</SectionTitle>
          <P>
            <span className="font-medium text-ink">Finalidades primarias</span> (necesarias
            para el servicio): gestionar tus reservas y membresías, procesar pagos, responder
            tus dudas y solicitudes de información, y enviarte confirmaciones y avisos
            transaccionales (reserva, pago, cancelación o reagenda).
          </P>
          <P>
            <span className="font-medium text-ink">Finalidad secundaria:</span> enviarte
            comunicaciones de novedades y marketing del Club por correo electrónico. Puedes
            negarte u oponerte a esta finalidad en cualquier momento: cada correo de marketing
            incluye un enlace de baja que surte efecto de inmediato, sin afectar tus correos
            transaccionales.
          </P>

          <SectionTitle>4. Transferencias y encargados</SectionTitle>
          <P>
            No vendemos ni cedemos tus datos a terceros para sus propios fines. Para operar el
            servicio utilizamos proveedores que tratan datos por cuenta del Club (encargados),
            lo que implica transferencias internacionales necesarias para la prestación del
            servicio:
          </P>
          <ul className="mt-4 space-y-3">
            <Li>Stripe — procesamiento de pagos.</Li>
            <Li>Postmark — envío de correos transaccionales y de marketing.</Li>
            <Li>Vercel y Supabase — alojamiento del sitio y de la base de datos.</Li>
          </ul>
          <P>
            Estos proveedores están obligados contractualmente a proteger tus datos y solo los
            tratan conforme a nuestras instrucciones.
          </P>

          <SectionTitle>5. Cookies y analítica</SectionTitle>
          <P>
            El sitio utiliza una medición de audiencia propia que{" "}
            <span className="font-medium text-ink">no usa cookies ni identificadores
            persistentes</span>: las visitas se cuentan mediante un identificador técnico
            irreversible que cambia cada día, por lo que no es posible reidentificarte ni
            seguirte entre días. No almacenamos tu dirección IP con fines de analítica ni
            usamos publicidad ni rastreadores de terceros. El pago en línea puede requerir
            cookies técnicas propias de Stripe durante el proceso de pago.
          </P>

          <SectionTitle>6. Derechos ARCO y revocación del consentimiento</SectionTitle>
          <P>
            Tienes derecho a Acceder, Rectificar y Cancelar tus datos personales, así como a
            Oponerte a su tratamiento (derechos ARCO) y a revocar el consentimiento que nos
            hayas otorgado. Para ejercerlos, envía una solicitud a{" "}
            <a href={`mailto:${SITE.email}`} className="text-gold-deep underline underline-offset-2">
              {SITE.email}
            </a>{" "}
            indicando tu nombre completo, el derecho que deseas ejercer y un medio para
            responderte. Te contestaremos en los plazos que marca la LFPDPPP.
          </P>
          <P>
            Para dejar de recibir correos de marketing no necesitas una solicitud formal: usa
            el enlace de baja incluido en cualquiera de esos correos.
          </P>

          <SectionTitle>7. Conservación y seguridad</SectionTitle>
          <P>
            Conservamos tus datos mientras exista una relación contigo (reservas, membresías,
            pagos) y durante los plazos exigidos por las obligaciones legales y fiscales
            aplicables. Aplicamos medidas administrativas y técnicas razonables para proteger
            tus datos contra acceso no autorizado, pérdida o alteración.
          </P>

          <SectionTitle>8. Cambios a este aviso</SectionTitle>
          <P>
            Cualquier modificación a este aviso se publicará en esta misma página
            (arcosfitness.com/aviso-de-privacidad) con su fecha de actualización. Te
            recomendamos revisarla periódicamente.
          </P>

          <div className="mt-16">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-[0.22em] text-gold-deep hover:text-gold transition-colors"
            >
              Volver al inicio →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
