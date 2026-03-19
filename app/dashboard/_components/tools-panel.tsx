"use client";

import { Badge } from "@/components/ui/badge";
import {
  Search,
  Handshake,
  Zap,
  Star,
  FileCheck,
  Loader2,
  CheckCircle,
  XCircle,
  Wrench,
} from "lucide-react";

interface ToolsPanelProps {
  toolParts: Array<{
    type: string;
    state: string;
    output?: unknown;
    messageId: string;
  }>;
}

const toolIcons: Record<string, typeof Search> = {
  analyzeEvidence: Search,
  proposeSettlement: Handshake,
  executeSettlement: Zap,
  postFeedback: Star,
  registerVerdict: FileCheck,
};

const toolLabels: Record<string, string> = {
  analyzeEvidence: "Evidencias",
  proposeSettlement: "Settlement",
  executeSettlement: "Execucao",
  postFeedback: "Feedback",
  registerVerdict: "Veredito",
};

export function ToolsPanel({ toolParts }: ToolsPanelProps) {
  // Aggregate tool usage counts
  const toolNames = [
    "analyzeEvidence",
    "proposeSettlement",
    "executeSettlement",
    "postFeedback",
    "registerVerdict",
  ];

  const toolStats = toolNames.map((name) => {
    const parts = toolParts.filter(
      (p) => p.type === `tool-${name}`
    );
    const completed = parts.filter(
      (p) => p.state === "output-available"
    ).length;
    const active = parts.filter(
      (p) =>
        p.state === "input-streaming" || p.state === "input-available"
    ).length;
    const errors = parts.filter(
      (p) => p.state === "output-error"
    ).length;

    return { name, total: parts.length, completed, active, errors };
  });

  const totalCalls = toolParts.length;
  const totalCompleted = toolParts.filter(
    (p) => p.state === "output-available"
  ).length;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        <div className="flex items-center gap-2">
          <Wrench className="size-3.5 text-primary" />
          <span className="text-xs font-medium uppercase tracking-wider">
            Tools
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/50">
          {totalCompleted}/{totalCalls}
        </span>
      </div>

      {/* Tool list */}
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {toolStats.map((tool) => {
          const Icon = toolIcons[tool.name] ?? Search;
          const label = toolLabels[tool.name] ?? tool.name;
          const isActive = tool.active > 0;
          const hasError = tool.errors > 0;

          return (
            <div
              key={tool.name}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors ${
                isActive
                  ? "bg-primary/5 border border-primary/10"
                  : "border border-transparent hover:bg-secondary/20"
              }`}
            >
              <div
                className={`flex size-5 items-center justify-center rounded-md ${
                  isActive ? "bg-primary/15" : "bg-secondary/40"
                }`}
              >
                <Icon
                  className={`size-2.5 ${
                    isActive ? "text-primary" : "text-muted-foreground/60"
                  }`}
                />
              </div>
              <span className="flex-1 text-[11px] font-medium truncate">
                {label}
              </span>
              {isActive && (
                <Loader2 className="size-3 animate-spin text-primary/60" />
              )}
              {tool.completed > 0 && !isActive && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="size-3 text-emerald" />
                  {tool.completed > 1 && (
                    <span className="text-[9px] font-mono text-muted-foreground/50">
                      x{tool.completed}
                    </span>
                  )}
                </div>
              )}
              {hasError && <XCircle className="size-3 text-destructive/60" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
