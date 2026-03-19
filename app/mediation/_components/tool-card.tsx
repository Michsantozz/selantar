"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Handshake,
  Zap,
  Star,
  FileCheck,
  Loader2,
  CheckCircle,
} from "lucide-react";

const toolMeta: Record<
  string,
  { label: string; icon: typeof Search; accent: string }
> = {
  analyzeEvidence: {
    label: "Analisando evidencias",
    icon: Search,
    accent: "bg-primary/10 text-primary",
  },
  proposeSettlement: {
    label: "Proposta de settlement",
    icon: Handshake,
    accent: "bg-primary/10 text-primary",
  },
  executeSettlement: {
    label: "Executando settlement",
    icon: Zap,
    accent: "bg-primary/10 text-primary",
  },
  postFeedback: {
    label: "Feedback on-chain",
    icon: Star,
    accent: "bg-primary/10 text-primary",
  },
  registerVerdict: {
    label: "Registrando veredito",
    icon: FileCheck,
    accent: "bg-primary/10 text-primary",
  },
};

interface ToolCardProps {
  toolName: string;
  state: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export function ToolCard({ toolName, state, input, output }: ToolCardProps) {
  const meta = toolMeta[toolName] ?? {
    label: toolName,
    icon: Search,
    accent: "bg-muted text-muted-foreground",
  };
  const Icon = meta.icon;
  const isDone = state === "output-available";

  return (
    <Card className="overflow-hidden shadow-none border border-border bg-card">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={`flex size-8 items-center justify-center rounded-lg ${meta.accent}`}>
          <Icon className="size-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium">{meta.label}</span>
            {isDone ? (
              <Badge variant="secondary" className="text-[10px] font-medium h-5 px-1.5">
                <CheckCircle className="mr-1 size-2.5 text-emerald" />
                Concluido
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] font-medium h-5 px-1.5 border-primary/20 text-primary/60">
                <Loader2 className="mr-1 size-2.5 animate-spin" />
                Processando
              </Badge>
            )}
          </div>
        </div>
      </div>

      {isDone && output && (
        <div className="border-t border-border px-4 py-3">
          <ToolOutput toolName={toolName} output={output} />
        </div>
      )}
    </Card>
  );
}

function ToolOutput({
  toolName,
  output,
}: {
  toolName: string;
  output: Record<string, unknown>;
}) {
  if (toolName === "analyzeEvidence") {
    const data = output as {
      keyFindings?: string[];
      credibilityScore?: number;
    };
    return (
      <div className="space-y-2">
        {data.keyFindings?.map((finding, i) => (
          <div key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/50" />
            {finding}
          </div>
        ))}
        {data.credibilityScore && (
          <div className="mt-2 text-[12px] text-muted-foreground">
            Score de credibilidade:{" "}
            <span className="font-medium text-foreground/80 font-mono">
              {data.credibilityScore}/100
            </span>
          </div>
        )}
      </div>
    );
  }

  if (toolName === "proposeSettlement") {
    const data = output as {
      proposal?: {
        clientAmount?: string;
        developerAmount?: string;
        clientPercentage?: number;
      };
      reasoning?: string;
    };
    return (
      <div className="space-y-3">
        {data.proposal && (
          <div className="flex gap-3">
            <div className="flex-1 rounded-lg bg-primary/8 px-3 py-2.5">
              <span className="text-[11px] text-muted-foreground">Cliente</span>
              <div className="text-[16px] font-medium text-primary font-mono">
                ${data.proposal.clientAmount}
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                {data.proposal.clientPercentage}%
              </span>
            </div>
            <div className="flex-1 rounded-lg bg-secondary px-3 py-2.5">
              <span className="text-[11px] text-muted-foreground">Desenvolvedor</span>
              <div className="text-[16px] font-medium font-mono">
                ${data.proposal.developerAmount}
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                {100 - (data.proposal.clientPercentage ?? 0)}%
              </span>
            </div>
          </div>
        )}
        {data.reasoning && (
          <p className="text-[12px] leading-relaxed text-muted-foreground">{data.reasoning}</p>
        )}
      </div>
    );
  }

  if (
    toolName === "executeSettlement" ||
    toolName === "postFeedback" ||
    toolName === "registerVerdict"
  ) {
    const data = output as { txHash?: string; status?: string; chain?: string };
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[12px]">
          <span className="text-muted-foreground">Status:</span>
          <Badge variant="secondary" className="text-[10px] h-5">
            {data.status}
          </Badge>
        </div>
        {data.txHash && (
          <div className="text-[12px] text-muted-foreground">
            TX:{" "}
            <span className="font-mono text-[11px] text-foreground/60">
              {data.txHash.slice(0, 10)}...{data.txHash.slice(-8)}
            </span>
          </div>
        )}
        {data.chain && (
          <div className="text-[12px] text-muted-foreground">
            Chain: <span className="text-foreground/60">{data.chain}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <pre className="overflow-auto text-[11px] font-mono text-muted-foreground/70">
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}
