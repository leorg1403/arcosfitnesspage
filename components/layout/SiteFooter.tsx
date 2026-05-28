import { SITE, NAV_FOOTER } from "@/lib/content";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { Logo } from "./Logo";
import { FooterNavLink } from "./FooterNavLink";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
  TiktokIcon,
  WhatsappIcon,
} from "./SocialIcons";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <div className="container-wide pt-24 pb-10">
        <div className="grid gap-16 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-6">
            <Logo />
            <p className="text-sm text-paper/60 leading-relaxed max-w-sm">
              Arcos Fitness Club®. Bosques de las Lomas, CDMX.
            </p>
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-gold leading-relaxed">
              Gym · Funcional · Hyrox · Protein Lab
            </p>
          </div>

          {/* Cols */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            <FooterCol title="Información de contacto">
              <p>{SITE.address}</p>
              <a
                href={`tel:+52${SITE.phone.replace(/\s/g, "")}`}
                className="block hover:text-gold transition-colors duration-300"
              >
                {SITE.phone}
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="block hover:text-gold transition-colors duration-300"
              >
                {SITE.email}
              </a>
              <a
                href={buildWhatsAppLink(WA_MESSAGES.generic)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold hover:text-gold-soft transition-colors duration-300"
              >
                <WhatsappIcon className="size-3.5" />
                WhatsApp
              </a>
              {/* Redes sociales — visibles arriba del fold del footer */}
              <div className="pt-3 flex items-center gap-4">
                <SocialIcon href={SITE.social.instagram} label="Instagram">
                  <InstagramIcon className="size-4" />
                </SocialIcon>
                <SocialIcon href={SITE.social.facebook} label="Facebook">
                  <FacebookIcon className="size-4" />
                </SocialIcon>
                <SocialIcon href={SITE.social.tiktok} label="TikTok">
                  <TiktokIcon className="size-4" />
                </SocialIcon>
                <SocialIcon href={SITE.social.youtube} label="YouTube">
                  <YoutubeIcon className="size-4" />
                </SocialIcon>
              </div>
            </FooterCol>

            <FooterCol title="Horarios">
              {SITE.hours.map((h) => (
                <div key={h.day} className="flex flex-col">
                  <span className="text-paper">{h.day}</span>
                  <span className="font-mono text-xs text-paper/50">{h.time}</span>
                </div>
              ))}
            </FooterCol>

            <FooterCol title="Navegar" className="col-span-2 md:col-span-1">
              {NAV_FOOTER.map((item) => (
                <FooterNavLink
                  key={item.href}
                  href={item.href}
                  className="block hover:text-gold transition-colors duration-300"
                >
                  {item.label}
                </FooterNavLink>
              ))}
            </FooterCol>
          </div>
        </div>

        {/* Hairline gold */}
        <div className="mt-20 mb-8 h-px bg-gold/30" />

        <div className="flex items-center justify-between gap-6">
          <p className="font-mono text-[0.625rem] text-paper/40 uppercase tracking-[0.22em]">
            © {new Date().getFullYear()} Arcos Fitness Club · Todos los derechos reservados®
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="mb-6 font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-gold">
        {title}
      </h3>
      <div className="space-y-3 text-sm text-paper/70">{children}</div>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gold hover:text-gold-soft transition-colors duration-300"
    >
      {children}
    </a>
  );
}
