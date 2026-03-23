"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, ExternalLink, Menu, FileUp, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

function MetaMaskIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 35 33" className={className} fill="none">
      <path d="M32.96 1l-13.14 9.72 2.45-5.73L32.96 1z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.66 1l13.02 9.81L13.35 4.99 2.66 1zM28.23 23.53l-3.5 5.34 7.49 2.06 2.14-7.28-6.13-.12zM.68 23.65l2.13 7.28 7.47-2.06-3.48-5.34-6.12.12z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.93 14.42l-2.07 3.13 7.37.34-.26-7.92-5.04 4.45zM25.69 14.42l-5.11-4.54-.17 8.01 7.37-.34-2.09-3.13zM10.28 28.87l4.44-2.16-3.83-2.99-.61 5.15zM20.9 26.71l4.43 2.16-.6-5.15-3.83 2.99z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M25.33 28.87l-4.43-2.16.36 2.88-.04 1.22 4.11-1.94zM10.28 28.87l4.13 1.94-.03-1.22.35-2.88-4.45 2.16z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.52 21.86l-3.7-1.08 2.61-1.2 1.09 2.28zM21.1 21.86l1.09-2.28 2.62 1.2-3.71 1.08z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.28 28.87l.63-5.34-4.11.12 3.48 5.22zM25.71 23.53l.62 5.34-3.5-5.22 2.88-.12zM27.78 17.55l-7.37.34.68 3.97 1.09-2.28 2.62 1.2 2.98-3.23zM10.82 20.78l2.62-1.2 1.09 2.28.68-3.97-7.37-.34 2.98 3.23z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.84 17.55l3.1 6.05-.1-2.82-3-3.23zM24.8 20.78l-.12 2.82 3.1-6.05-2.98 3.23zM15.21 17.89l-.68 3.97.86 4.43.19-5.84-.37-2.56zM20.41 17.89l-.36 2.55.18 5.85.86-4.43-.68-3.97z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.1 21.86l-.86 4.43.61.43 3.83-2.99.12-2.82-3.7.95zM10.82 20.78l.1 2.82 3.83 2.99.61-.43-.86-4.43-3.68-.95z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.17 30.81l.04-1.22-.33-.29h-5.14l-.32.29.03 1.22-4.13-1.94 1.44 1.18 2.93 2.03h5.23l2.93-2.03 1.44-1.18-4.12 1.94z" fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.9 26.71l-.61-.43h-3.96l-.61.43-.35 2.88.32-.29h5.14l.33.29-.26-2.88z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M33.52 11.35l1.1-5.36L32.96 1l-12.06 8.94 4.64 3.93 6.56 1.92 1.45-1.69-.63-.46 1-1.02-.77-.6 1-1.02-.66-.41zM.96 5.99l1.11 5.36-.71.41 1.01 1.02-.77.6 1.01 1.02-.63.46 1.44 1.69 6.56-1.92 4.64-3.93L2.66 1 .96 5.99z" fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32.1 15.79l-6.56-1.92 2.09 3.13-3.1 6.05 4.01-.05h5.99l-2.43-7.21zM9.93 13.87L3.37 15.79.96 23l5.98.05 4.01.05-3.1-6.05 2.08-3.18zM20.41 17.89l.42-7.15 1.92-5.18H12.87l1.9 5.18.43 7.15.17 2.56.01 5.84h3.96l.02-5.84.05-2.56z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#on-chain", label: "On-chain" },
];

const explorerUrl =
  "https://hashscan.io/testnet/account/0x377711a26B52F4AD8C548AAEF8297E0563b87Db4";

export function Navbar() {
  const pathname = usePathname();
  if (pathname.startsWith('/contract/')) return null;
  if (pathname.startsWith('/pitch')) return null;
  const isLanding = pathname === "/";
  const [wallet, setWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connectWallet = async () => {
    const eth = (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
    if (!eth) { alert("Install MetaMask to continue"); return; }
    setConnecting(true);
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (accounts[0]) setWallet(accounts[0]);
    } catch { /* user rejected */ }
    setConnecting(false);
  };

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
            // On landing page use anchor scroll, on other pages navigate
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
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
            HashScan
            <ExternalLink className="size-3 transition-transform group-hover:translate-x-0.5" />
          </a>

          {wallet ? (
            <button
              onClick={() => setWallet(null)}
              title="Disconnect wallet"
              className="inline-flex items-center gap-2 rounded-md border border-emerald/20 bg-emerald/5 px-3 py-2 text-[12px] font-mono text-emerald transition-colors hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
            >
              <span className="size-1.5 rounded-full bg-emerald animate-subtle-pulse" />
              {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </button>
          ) : (
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {connecting ? <Loader2 className="size-3.5 animate-spin" /> : <MetaMaskIcon className="size-4" />}
              {connecting ? "Connecting..." : "Connect"}
            </button>
          )}

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
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
                HashScan
                <ExternalLink className="size-3" />
              </a>

              {wallet ? (
                <button
                  onClick={() => setWallet(null)}
                  title="Disconnect wallet"
                  className="inline-flex items-center gap-2 rounded-md border border-emerald/20 bg-emerald/5 px-3 py-2.5 text-[12px] font-mono text-emerald hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                >
                  <span className="size-1.5 rounded-full bg-emerald animate-subtle-pulse" />
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </button>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={connecting}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {connecting ? <Loader2 className="size-3.5 animate-spin" /> : <MetaMaskIcon className="size-4" />}
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}

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
