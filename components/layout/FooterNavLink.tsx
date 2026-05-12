"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Footer nav link que detecta si ya estás en esa página.
 * Si es la misma → previene navegación y hace smooth scroll al top.
 * Si es otra → navegación normal de Next.js.
 */
export function FooterNavLink({ href, children, className }: Props) {
  const pathname = usePathname();
  const isCurrentPage = pathname === href || (href !== "/" && pathname.startsWith(href));

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isCurrentPage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
