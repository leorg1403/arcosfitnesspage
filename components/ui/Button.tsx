import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-volt text-ink hover:bg-volt-deep active:scale-[0.98] shadow-[0_0_0_0_rgba(255,245,1,0)] hover:shadow-[0_8px_24px_-8px_rgba(255,245,1,0.6)]",
        dark:
          "bg-ink text-paper hover:bg-ink-soft active:scale-[0.98]",
        outline:
          "border border-ink/15 text-ink bg-transparent hover:border-ink hover:bg-ink hover:text-paper",
        outlineLight:
          "border border-paper/30 text-paper bg-transparent hover:bg-paper hover:text-ink",
        ghost:
          "text-ink hover:bg-ink/5",
        link:
          "text-ink underline underline-offset-4 decoration-ink/20 hover:decoration-volt hover:text-ink p-0 h-auto",
      },
      size: {
        sm: "h-10 px-4 text-sm rounded-full",
        md: "h-12 px-6 text-[0.95rem] rounded-full",
        lg: "h-14 px-8 text-base rounded-full",
        xl: "h-16 px-10 text-lg rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    href?: string;
    external?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  href,
  external,
  children,
  ...props
}: Props) {
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
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
