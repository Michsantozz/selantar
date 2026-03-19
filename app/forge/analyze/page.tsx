"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion } from "framer-motion";
import { ArrowRight, ScanSearch, ShieldAlert, FileCheck } from "lucide-react";
import Link from "next/link";
import { ContractUpload } from "../_components/contract-upload";
import { RiskAnalysis } from "../_components/risk-analysis";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export default function ForgePage() {
  const [analyzed, setAnalyzed] = useState(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/analyze-contract" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleAnalyze = (contractText: string) => {
    setAnalyzed(true);
    sendMessage({ text: contractText });
  };

  const analysisContent = messages
    .filter((m) => m.role === "assistant")
    .map((m) => m.parts.filter((p) => p.type === "text").map((p) => p.text).join(""))
    .join("");

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background pattern */}
      <DotPattern
        width={20}
        height={20}
        cr={0.6}
        className="text-primary/[0.04] [mask-image:radial-gradient(800px_circle_at_50%_30%,white,transparent)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-9 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }}
        >
          {/* Header */}
          <div className="mb-12">
            <div className="mb-6 flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Forge
              </span>
            </div>
            <h1 className="mb-3 text-3xl font-normal tracking-tight leading-tight lg:text-5xl">
              Analise de contrato
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              Upload do contrato para analise de risco com IA antes de iniciar a mediacao.
            </p>
          </div>

          {/* Split layout: Upload left, context right */}
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
            {/* Left — Upload + Results */}
            <div className="space-y-6">
              <ContractUpload onSubmit={handleAnalyze} isLoading={isLoading} />

              {analyzed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <RiskAnalysis
                    content={analysisContent}
                    isStreaming={isLoading}
                  />

                  {!isLoading && analysisContent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-6 flex justify-end"
                    >
                      <Link href="/mediation">
                        <ShimmerButton
                          shimmerColor="oklch(0.72 0.17 55)"
                          shimmerSize="0.08em"
                          background="oklch(0.72 0.17 55)"
                          borderRadius="0.375rem"
                          className="text-sm font-medium uppercase tracking-wider text-primary-foreground"
                        >
                          <span className="flex items-center gap-2">
                            Iniciar mediacao
                            <ArrowRight className="size-3.5" />
                          </span>
                        </ShimmerButton>
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right — Context panel (what to expect) */}
            {!analyzed && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col gap-5"
              >
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    O que a IA analisa
                  </h3>
                  <div className="flex flex-col gap-4">
                    {[
                      {
                        icon: ScanSearch,
                        title: "Clausulas de risco",
                        desc: "Identifica termos ambiguos, lacunas e clausulas que podem gerar disputa.",
                      },
                      {
                        icon: ShieldAlert,
                        title: "Score de ambiguidade",
                        desc: "Cada clausula recebe uma nota de risco — alta, media ou baixa.",
                      },
                      {
                        icon: FileCheck,
                        title: "Recomendacoes",
                        desc: "Sugere protecoes e ajustes para blindar ambas as partes.",
                      },
                    ].map(({ icon: Icon, title, desc }) => (
                      <div key={title} className="flex items-start gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/8">
                          <Icon className="size-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground">{title}</span>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                            {desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Example output preview */}
                <div className="rounded-xl border border-border bg-card/60 p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Exemplo de output
                    </span>
                    <span className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">
                      preview
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "Clausula 4.2 — Penalidade por atraso", risk: "high" },
                      { label: "Clausula 7.1 — Propriedade intelectual", risk: "medium" },
                      { label: "Clausula 3.5 — Escopo de entrega", risk: "medium" },
                      { label: "Clausula 1.1 — Partes contratantes", risk: "low" },
                    ].map(({ label, risk }) => (
                      <div key={label} className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2">
                        <span className="text-xs text-muted-foreground truncate mr-3">{label}</span>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                          risk === "high"
                            ? "border border-destructive/30 bg-destructive/10 text-destructive"
                            : risk === "medium"
                            ? "border border-primary/30 bg-primary/10 text-primary"
                            : "border border-emerald/30 bg-emerald/10 text-emerald"
                        }`}>
                          {risk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity signal */}
                <div className="flex items-center gap-2 px-1">
                  <span className="size-1.5 rounded-full bg-emerald animate-subtle-pulse" />
                  <span className="font-mono text-[10px] text-muted-foreground/50">
                    47 contratos analisados esta semana
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
