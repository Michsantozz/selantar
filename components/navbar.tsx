"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, ExternalLink, Menu, FileUp, LogIn, LogOut } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AuthModal } from "@/components/auth-modal";

const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#on-chain", label: "On-chain" },
];

const baseScanUrl =
  "https://sepolia.basescan.org/address/0x377711a26B52F4AD8C548AAEF8297E0563b87Db4";

function AuthButton() {
  const { ready, authenticated, logout, user } = usePrivy();
  const [authOpen, setAuthOpen] = useState(false);

  if (!ready) return null;

  if (authenticated && user) {
    const walletAddr = user.wallet?.address;
    const label =
      user.email?.address ??
      user.google?.email ??
      (walletAddr ? `${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)}` : null) ??
      "Connected";

    return (
      <button
        onClick={logout}
        title="Sign out"
        className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-[12px] font-mono text-primary transition-colors hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
      >
        <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
        {label}
        <LogOut className="size-3" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setAuthOpen(true)}
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary/10"
      >
        <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        <LogIn className="size-3.5 text-primary" />
        Sign in
      </button>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

export function Navbar() {
  const pathname = usePathname();
  if (pathname.startsWith('/contract/')) return null;
  if (pathname.startsWith('/pitch')) return null;
  const isLanding = pathname === "/";

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg px-4 lg:px-9">
      <div className="mx-auto flex max-w-7xl items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <HeartHandshake className="size-4 text-primary" />
          <span className="text-sm font-medium tracking-tight">
            Selantar
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label }) => {
            const resolvedHref = isLanding ? href.replace("/", "") : href;
            return (
              <a
                key={href}
                href={resolvedHref}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            );
          })}

          <div className="mx-1 h-4 w-px bg-border" />

          <a
            href={baseScanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
            BaseScan
            <ExternalLink className="size-3 transition-transform group-hover:translate-x-0.5" />
          </a>

          <AuthButton />

          <Link
            href="/forge"
            className="hero-cta ml-2 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileUp className="size-3.5 text-primary" />
            Drop Contract
          </Link>
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
                <a
                  key={href}
                  href={href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </a>
              ))}

              <div className="h-px bg-border" />

              <a
                href={baseScanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
                BaseScan
                <ExternalLink className="size-3" />
              </a>

              <AuthButton />

              <Link
                href="/forge"
                className="hero-cta inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-foreground"
              >
                <FileUp className="size-3.5 text-primary" />
                Drop Contract
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
