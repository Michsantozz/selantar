"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, HeartHandshake } from "lucide-react";

// Pages that have their own topbar — don't render the layout header
const PAGES_WITH_OWN_HEADER = ["/contract/sentinel-plan", "/contract/sentinel-flow"];

export default function ContractLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hasOwnHeader = PAGES_WITH_OWN_HEADER.some((p) => pathname.startsWith(p));

  // Resolve back link
  const backHref =
    pathname === "/contract" ? "/forge" :
    pathname.startsWith("/contract/sentinel") ? "/contractv2" :
    "/contractv2";

  if (hasOwnHeader) return <>{children}</>;

  return (
    <>
      {/* Minimal back header — fixed, transparent, unobtrusive */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 pointer-events-none">
        <Link
          href={backHref}
          className="pointer-events-auto flex items-center gap-2 rounded-lg border border-border/50 bg-card/80 backdrop-blur-sm px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-border"
        >
          <ArrowLeft className="size-3" />
          Back
        </Link>

        <Link
          href="/"
          className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-border/50 bg-card/80 backdrop-blur-sm px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-border"
        >
          <HeartHandshake className="size-3" />
          Selantar
        </Link>
      </div>
      {children}
    </>
  );
}
