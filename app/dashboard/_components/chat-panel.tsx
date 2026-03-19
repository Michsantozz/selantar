"use client";

import type { UIMessage, ChatStatus } from "ai";
import { isToolUIPart } from "ai";
import { Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Search,
  Handshake,
  Zap,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  Scale as ScaleIcon,
} from "lucide-react";

interface ChatPanelProps {
  messages: UIMessage[];
  input: string;
  setInput: (v: string) => void;
  onSubmit: (text: string) => void;
  status: ChatStatus;
  onStop: () => void;
}

export function ChatPanel({
  messages,
  input,
  setInput,
  onSubmit,
  status,
  onStop,
}: ChatPanelProps) {
  // Use mock messages when no real conversation
  const displayMessages = messages.length > 0 ? messages : null;
  const showMock = !displayMessages;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
            <Scale className="size-3.5 text-primary" />
          </div>
          <div>
            <span className="text-xs font-medium">Selantar Mediator</span>
            <span className="ml-2 text-[10px] text-muted-foreground/50 font-mono">
              claude-sonnet-4-6
            </span>
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 border-primary/20 text-primary/60"
        >
          {showMock
            ? "Demo"
            : status === "streaming"
              ? "Respondendo..."
              : status === "submitted"
                ? "Processando..."
                : "Pronto"}
        </Badge>
      </div>

      {/* Conversation area */}
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className="gap-5 px-4 py-4">
          {showMock ? (
            <MockConversation />
          ) : (
            displayMessages?.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent
                  className={
                    message.role === "user"
                      ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground"
                      : ""
                  }
                >
                  {message.parts.map((part, i) => {
                    if (part.type === "text" && part.text.trim()) {
                      return (
                        <MessageResponse key={`text-${i}`}>
                          {part.text}
                        </MessageResponse>
                      );
                    }

                    if (part.type === "reasoning") {
                      return (
                        <Reasoning key={`reason-${i}`} defaultOpen={false} duration={12}>
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    }

                    if (isToolUIPart(part)) {
                      const toolName = part.type.replace("tool-", "");
                      return (
                        <Tool key={`tool-${i}`}>
                          <ToolHeader
                            type={part.type as `tool-${string}`}
                            state={part.state}
                            title={getToolLabel(toolName)}
                          />
                          <ToolContent>
                            {(part.state === "input-available" ||
                              part.state === "output-available") && (
                              <ToolInput input={part.input} />
                            )}
                            {part.state === "output-available" && (
                              <ToolOutput
                                output={part.output}
                                errorText={undefined}
                              />
                            )}
                          </ToolContent>
                        </Tool>
                      );
                    }

                    return null;
                  })}
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input */}
      <div className="border-t border-border p-3">
        <PromptInput
          onSubmit={({ text }) => onSubmit(text)}
          className="rounded-lg border border-border/50 bg-secondary/20"
        >
          <PromptInputTextarea
            placeholder="Descreva a disputa ou responda ao mediador..."
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            className="min-h-10 text-[13px] bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground/40"
          />
          <PromptInputFooter>
            <div />
            <PromptInputSubmit
              status={status}
              onStop={onStop}
              className="glow-accent"
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

// ============================================================================
// Mock Conversation — full demo with reasoning, chain-of-thought, tools
// ============================================================================

function MockConversation() {
  return (
    <>
      {/* === User message === */}
      <Message from="user">
        <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
          <MessageResponse>
            Contratei um desenvolvedor para criar um MVP de marketplace. O contrato era de $8,000 USDC com 5 milestones. Ele entregou 3 dos 5, mas com 2 semanas de atraso. Agora ele pede o valor total dizendo que eu nao forneci acesso ao staging a tempo. Quero resolver isso de forma justa.
          </MessageResponse>
        </MessageContent>
      </Message>

      {/* === Assistant: Reasoning (Shimmer) === */}
      <Message from="assistant">
        <MessageContent>
          {/* Reasoning block — shows "Thought for 12 seconds" */}
          <Reasoning defaultOpen duration={12}>
            <ReasoningTrigger />
            <ReasoningContent>
              {`O usuario apresenta uma disputa contratual B2B classica envolvendo entrega parcial e responsabilidade compartilhada.

**Analise inicial:**
- Contrato: $8,000 USDC, 5 milestones
- Entregue: 3/5 milestones (60%)
- Atraso: 2 semanas
- Alegacao do dev: cliente nao forneceu acesso ao staging
- Alegacao do cliente: quer resolucao justa

**Fatores a considerar:**
1. Proporcionalidade — 60% entregue sugere pagamento proporcional como base
2. Responsabilidade do cliente — se staging nao foi fornecido, dev pode ter justificativa parcial para atraso
3. Atraso — 2 semanas em projeto de ~3 meses e moderado, nao critico
4. Boa-fe — ambas as partes parecem querer resolucao

Preciso analisar as evidencias antes de propor settlement. Vou usar analyzeEvidence para examinar o contrato, emails e historico de commits.`}
            </ReasoningContent>
          </Reasoning>

          {/* Chain of Thought */}
          <ChainOfThought defaultOpen>
            <ChainOfThoughtHeader>
              Cadeia de raciocinio
            </ChainOfThoughtHeader>
            <ChainOfThoughtContent>
              <ChainOfThoughtStep
                icon={Search}
                label="Analisando evidencias do contrato"
                status="complete"
              />
              <ChainOfThoughtStep
                icon={AlertTriangle}
                label="Identificando pontos de conflito"
                description="Atraso de 2 semanas vs. falta de acesso ao staging"
                status="complete"
              />
              <ChainOfThoughtStep
                icon={ScaleIcon}
                label="Calculando proporcionalidade"
                description="60% milestones entregues, responsabilidade compartilhada"
                status="complete"
              />
              <ChainOfThoughtStep
                icon={Handshake}
                label="Formulando proposta de settlement"
                status="complete"
              />
            </ChainOfThoughtContent>
          </ChainOfThought>

          {/* Tool: analyzeEvidence */}
          <Tool>
            <ToolHeader
              type={"tool-analyzeEvidence" as `tool-${string}`}
              state="output-available"
              title="Analisando evidencias"
            />
            <ToolContent>
              <ToolInput
                input={{
                  evidence: "Contrato PDF + emails + commits do repositorio",
                  disputeAmount: "$8,000 USDC",
                  milestones: "5 total, 3 entregues",
                }}
              />
              <ToolOutput
                output={{
                  keyFindings: [
                    "Contrato assinado em 15/01/2026 com clausula de entrega em 60 dias",
                    "Desenvolvedor entregou 3 de 5 milestones dentro do prazo original",
                    "Cliente nao forneceu acesso ao staging por 11 dias (confirmado via email)",
                    "Extensao verbal de 2 semanas registrada em comunicacao por email",
                  ],
                  credibilityScore: 78,
                  riskLevel: "medium",
                }}
                errorText={undefined}
              />
            </ToolContent>
          </Tool>

          {/* AI Response text */}
          <MessageResponse>
            {`Analisei as evidencias apresentadas. Aqui esta minha avaliacao:

**Conclusoes principais:**
- O desenvolvedor cumpriu **60% dos milestones** dentro do prazo contratual
- Houve **responsabilidade compartilhada** no atraso: o cliente demorou 11 dias para fornecer acesso ao staging
- A comunicacao por email confirma que ambas as partes concordaram informalmente com uma extensao

**Score de credibilidade: 78/100**

Com base nessa analise, vou formular uma proposta de settlement proporcional.`}
          </MessageResponse>

          {/* Tool: proposeSettlement */}
          <Tool>
            <ToolHeader
              type={"tool-proposeSettlement" as `tool-${string}`}
              state="output-available"
              title="Proposta de settlement"
            />
            <ToolContent>
              <ToolOutput
                output={{
                  proposal: {
                    clientAmount: "$3,200 USDC",
                    developerAmount: "$4,800 USDC",
                    clientPercentage: "40%",
                    developerPercentage: "60%",
                  },
                  reasoning: "Baseado em 60% de entrega + responsabilidade compartilhada no atraso",
                }}
                errorText={undefined}
              />
            </ToolContent>
          </Tool>

          <MessageResponse>
            {`## Proposta de Settlement

| Parte | Valor | % |
|-------|-------|---|
| **Cliente** | $3,200 USDC | 40% |
| **Desenvolvedor** | $4,800 USDC | 60% |

**Justificativa:** O desenvolvedor completou 60% dos milestones, e o atraso foi parcialmente causado pela demora do cliente em fornecer acesso ao staging (11 dias). A proposta reflete responsabilidade compartilhada.

Deseja que eu execute este settlement on-chain?`}
          </MessageResponse>
        </MessageContent>
      </Message>

      {/* === User confirms === */}
      <Message from="user">
        <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
          <MessageResponse>
            Sim, pode executar. Me parece justo.
          </MessageResponse>
        </MessageContent>
      </Message>

      {/* === Assistant executes === */}
      <Message from="assistant">
        <MessageContent>
          <Reasoning defaultOpen={false} duration={3}>
            <ReasoningTrigger />
            <ReasoningContent>
              {`O usuario aprovou a proposta. Vou executar o settlement on-chain via ERC-20 transfer e registrar o veredito via ERC-8004.

Sequencia:
1. executeSettlement — transferir USDC
2. postFeedback — registrar feedback no Reputation Registry
3. registerVerdict — registrar evidencia no Validation Registry`}
            </ReasoningContent>
          </Reasoning>

          {/* Tool: executeSettlement */}
          <Tool>
            <ToolHeader
              type={"tool-executeSettlement" as `tool-${string}`}
              state="output-available"
              title="Executando settlement"
            />
            <ToolContent>
              <ToolOutput
                output={{
                  txHash: "0x7a3f8e2b1c9d4a5f...6e7f8a",
                  status: "confirmed",
                  chain: "Base Sepolia",
                  gasUsed: "142,387",
                }}
                errorText={undefined}
              />
            </ToolContent>
          </Tool>

          {/* Tool: postFeedback */}
          <Tool>
            <ToolHeader
              type={"tool-postFeedback" as `tool-${string}`}
              state="output-available"
              title="Feedback on-chain"
            />
            <ToolContent>
              <ToolOutput
                output={{
                  txHash: "0xb4c5d6e7f8a9b0c1...f2a3b4",
                  status: "confirmed",
                  chain: "Base Sepolia",
                  registry: "ERC-8004 Reputation",
                }}
                errorText={undefined}
              />
            </ToolContent>
          </Tool>

          {/* Tool: registerVerdict */}
          <Tool>
            <ToolHeader
              type={"tool-registerVerdict" as `tool-${string}`}
              state="output-available"
              title="Registrando veredito"
            />
            <ToolContent>
              <ToolOutput
                output={{
                  txHash: "0xc5d6e7f8a9b0c1d2...b4c5d6",
                  status: "confirmed",
                  chain: "Base Sepolia",
                  registry: "ERC-8004 Validation",
                  verdictHash: "0xabc123...def456",
                }}
                errorText={undefined}
              />
            </ToolContent>
          </Tool>

          <MessageResponse>
            {`## Settlement executado com sucesso

Todas as transacoes foram confirmadas on-chain:

- **Settlement ERC-20:** $3,200 -> Cliente | $4,800 -> Desenvolvedor
- **Feedback ERC-8004:** Registrado no Reputation Registry
- **Veredito ERC-8004:** Evidencia verificavel no Validation Registry

A mediacao foi concluida. Ambas as partes podem verificar as transacoes no [BaseScan](https://sepolia.basescan.org). O veredito fica permanentemente registrado como evidencia on-chain via **ERC-8004**.`}
          </MessageResponse>
        </MessageContent>
      </Message>

      {/* Shimmer "thinking" indicator at bottom */}
      <Message from="assistant">
        <MessageContent>
          <div className="flex items-center gap-2">
            <Shimmer className="text-sm text-muted-foreground" duration={2}>
              Gerando relatorio final da mediacao...
            </Shimmer>
          </div>
        </MessageContent>
      </Message>
    </>
  );
}

function getToolLabel(toolName: string): string {
  const labels: Record<string, string> = {
    analyzeEvidence: "Analisando evidencias",
    proposeSettlement: "Proposta de settlement",
    executeSettlement: "Executando settlement",
    postFeedback: "Feedback on-chain",
    registerVerdict: "Registrando veredito",
  };
  return labels[toolName] ?? toolName;
}
