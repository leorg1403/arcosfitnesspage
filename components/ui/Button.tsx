import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center font-medium tracking-tight transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        // Texto subrayado fino con flecha que se mueve al hover. La primaria del sitio.
        link: "group gap-2 py-3 text-ink hover:text-gold-deep",
        linkLight: "group gap-2 py-3 text-paper hover:text-gold",
        linkGold: "group gap-2 py-3 text-gold hover:text-gold-soft",
        // Hairline (borde fino, sin background)
        hairline:
          "h-12 px-7 gap-2 border border-ink text-ink hover:bg-ink hover:text-paper rounded-none",
        hairlineLight:
          "h-12 px-7 gap-2 border border-paper/60 text-paper hover:bg-paper hover:text-ink rounded-none",
        hairlineGold:
          "h-12 px-7 gap-2 border border-gold text-gold hover:bg-gold hover:text-ink rounded-none",
        // Solid dark (sobre paper)
        solid:
          "h-12 px-7 gap-2 bg-ink text-paper hover:bg-graphite rounded-none",
        solidGold:
          "h-12 px-7 gap-2 bg-gold text-ink hover:bg-gold-soft rounded-none",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base h-14 px-8",
      },
    },
    defaultVariants: { variant: "link", size: "md" },
  }
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    href?: string;
    external?: boolean;
    /** Mostrar flecha al final */
    withArrow?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  href,
  external,
  children,
  withArrow = true,
  ...props
}: Props) {
  const isLinkStyle =
    variant === "link" || variant === "linkLight" || variant === "linkGold";

  const renderArrow = withArrow && (
    <ArrowUpRight
      strokeWidth={1.5}
      className={cn(
        "size-4 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isLinkStyle && "group-hover:translate-x-1 group-hover:-translate-y-1"
      )}
    />
  );

  const inner = (
    <>
      {isLinkStyle ? (
        <span className="relative inline-flex flex-col overflow-hidden">
          <span className="block">{children}</span>
          <span className="block h-px w-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left scale-x-100 group-hover:scale-x-0" />
        </span>
      ) : (
        <span>{children}</span>
      )}
      {renderArrow}
    </>
  );

  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    if (external || href.startsWith("http")) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {inner}
    </button>
  );
}
