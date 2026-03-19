"use client";

import { useState } from "react";
import { ScenarioSelector } from "../mediation/_components/scenario-selector";
import type { Scenario } from "@/lib/scenarios";

export default function ScenariosPrototypePage() {
  const [selected, setSelected] = useState<Scenario | null>(null);

  return (
    <div className="min-h-screen">
      <ScenarioSelector
        onSelect={(scenario) => {
          setSelected(scenario);
        }}
      />
    </div>
  );
}
