import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SITE, NAV } from "@/lib/content";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { Logo } from "./Logo";
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
      <div className="container-app pt-24 pb-10">
        <div className="grid gap-16 lg:grid-cols-12">
          {/* Brand column */}
          <div className="lg:col-span-5 space-y-6">
            <Logo light />
            <p className="font-display text-3xl md:text-4xl leading-tight max-w-md">
              Donde tu nombre se conoce,
              <br />
              tu progreso se celebra.
            </p>
            <a
              href={buildWhatsAppLink(WA_MESSAGES.visit)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 group"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-volt text-ink transition-transform duration-300 group-hover:scale-110">
                <MessageCircle className="size-5" strokeWidth={1.75} />
              </span>
              <span className="font-display text-2xl group-hover:text-volt transition-colors">
                Reservar mi visita →
              </span>
            </a>
          </div>

          {/* Cols */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div>
              <FooterTitle>Contacto</FooterTitle>
              <ul className="space-y-3 text-sm text-paper/70">
                <li>{SITE.address}</li>
                <li>
                  <a href={`tel:+52${SITE.phone.replace(/\s/g, "")}`} className="hover:text-volt">
                    {SITE.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${SITE.email}`} className="hover:text-volt">
                    {SITE.email}
                  </a>
                </li>
                <li>
                  <a
                    href={buildWhatsAppLink(WA_MESSAGES.generic)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-volt"
                  >
                    WhatsApp directo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <FooterTitle>Horarios</FooterTitle>
              <ul className="space-y-3 text-sm text-paper/70">
                {SITE.hours.map((h) => (
                  <li key={h.day} className="flex flex-col">
                    <span className="text-paper">{h.day}</span>
                    <span className="font-mono text-xs">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <FooterTitle>Navegar</FooterTitle>
              <ul className="space-y-3 text-sm text-paper/70">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-volt">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-t border-paper/10 pt-8">
          <p className="font-mono text-xs text-paper/50 uppercase tracking-wider">
            © {new Date().getFullYear()} Arcos Fitness Club · Hecho en CDMX
          </p>
          <div className="flex items-center gap-3">
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
            <SocialIcon
              href={buildWhatsAppLink(WA_MESSAGES.generic)}
              label="WhatsApp"
            >
              <WhatsappIcon className="size-4" />
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-paper/40">
      {children}
    </h3>
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
      className="inline-flex size-10 items-center justify-center rounded-full border border-paper/15 text-paper/70 transition-all duration-300 hover:border-volt hover:bg-volt hover:text-ink"
    >
      {children}
    </a>
  );
}
