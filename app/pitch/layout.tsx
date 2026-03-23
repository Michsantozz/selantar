import type { ReactNode } from "react";

/* Pitch page has no navbar, no footer — fullscreen only */
export default function PitchLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
