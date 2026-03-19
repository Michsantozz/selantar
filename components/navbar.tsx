"use client";

import Link from "next/link";
import { HeartHandshake, ExternalLink, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/forge", label: "Forge" },
  { href: "/mediation", label: "Mediation" },
];

const onChainLink = {
  href: "https://sepolia.basescan.org/address/0x377711a26B52F4AD8C548AAEF8297E0563b87Db4",
  label: "On-chain",
};

export function Navbar() {
  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg px-4 lg:px-9">
      <div className="mx-auto flex max-w-7xl items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <HeartHandshake className="size-4 text-primary" />
          <span className="text-sm font-medium tracking-tight">
            Veredict<span className="text-primary">LLM</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-normal uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}

          <div className="mx-1 h-4 w-px bg-border" />

          <a
            href={onChainLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-sm font-normal uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
            {onChainLink.label}
            <ExternalLink className="size-3 transition-transform group-hover:translate-x-0.5" />
          </a>
        </nav>

        {/* Mobile hamburger */}
        <Sheet>
          <SheetTrigger
            className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-background border-border">
            <nav className="flex flex-col gap-6 pt-10">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-normal uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              ))}

              <div className="h-px bg-border" />

              <a
                href={onChainLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm font-normal uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
                {onChainLink.label}
                <ExternalLink className="size-3" />
              </a>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
