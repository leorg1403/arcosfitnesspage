import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Arcos Fitness Club — Inicio"
      className={cn("group inline-flex items-center", className)}
    >
      <Image
        src="/images/logo-arcos.png"
        alt="Arcos Fitness Club"
        width={72}
        height={72}
        priority
      />
    </Link>
  );
}
