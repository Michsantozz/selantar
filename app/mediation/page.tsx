"use client";

import { useState, useCallback, useRef, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import type { UIMessage } from "ai";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { ScenarioSelector } from "./_components/scenario-selector";
import { MediationChat } from "./_components/mediation-chat";
import { CaseInfoPanel } from "./_components/case-info-panel";
import { IntelligencePanel } from "./_components/intelligence-panel";
import { SettlementModal, type SettlementData } from "./_components/settlement-modal";
import { OriginalContractModal } from "./_components/original-contract-modal";
import { scenarios, type Scenario } from "@/lib/scenarios";
import { registerDemoAction } from "@/lib/demo-actions";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  }),
};

// Synthetic message to show the client's complaint visually in the chat
interface ClientMessage extends Omit<UIMessage, "parts"> {
  parts: { type: "text"; text: string }[];
  _isClientOpening: true;
  _clientName: string;
}

export default function MediationPage() {
  return (
    <Suspense>
      <MediationPageContent />
    </Suspense>
  );
}

function MediationPageContent() {
  const searchParams = useSearchParams();
  const scenarioParam = searchParams.get("scenario");
  const initialScenario = scenarioParam
    ? scenarios.find((s) => s.id === scenarioParam) ?? null
    : null;

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(
    initialScenario
  );
  const [mediationStarted, setMediationStarted] = useState(false);
  const [input, setInput] = useState("");
  const [clientMessages, setClientMessages] = useState<ClientMessage[]>([]);
  const hasStartedRef = useRef(false);
  const lastMediatorCountRef = useRef(0);
  const isGeneratingClientRef = useRef(false);

  // Settlement modal state
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementSealed, setSettlementSealed] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  // Original contract modal state
  const [showOriginalContract, setShowOriginalContract] = useState(false);

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/mediation-chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Extract settlement data from proposeSettlement tool output
  const settlementData = useMemo<SettlementData | null>(() => {
    for (const msg of messages) {
      if (msg.role !== "assistant") continue;
      for (const part of msg.parts) {
        if (!isToolUIPart(part)) continue;
        if (part.type !== "tool-proposeSettlement") continue;
        if (part.state !== "output-available" || !part.output) continue;
        const output = part.output as Record<string, unknown>;
        // Tool returns { proposal: { clientAmount, developerAmount, ... }, reasoning, conditions }
        const proposal = (output.proposal ?? output) as Record<string, unknown>;
        return {
          clientAmount: String(proposal.clientAmount ?? "0"),
          developerAmount: String(proposal.developerAmount ?? "0"),
          clientPercentage: Number(proposal.clientPercentage ?? 0),
          developerPercentage: Number(proposal.developerPercentage ?? 0),
          reasoning: String(output.reasoning ?? ""),
          conditions: (output.conditions as string[]) ?? [],
        };
      }
    }
    return null;
  }, [messages]);

  // Connect wallet handler
  const handleConnectWallet = useCallback(async () => {
    const eth = (
      window as unknown as {
        ethereum?: {
          request: (args: { method: string }) => Promise<string[]>;
        };
      }
    ).ethereum;
    if (!eth) return;
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (accounts[0]) setWalletAddress(accounts[0]);
    } catch {
      // user rejected
    }
  }, []);

  // Seal handler — triggers executeSettlement via Clara
  const handleSeal = useCallback(
    (signature: string) => {
      setSettlementSealed(true);
      setShowSettlementModal(false);

      // Send message to Clara to execute the settlement on-chain
      if (settlementData) {
        sendMessage({
          text: `The developer has signed the settlement agreement (signature: ${signature.slice(0, 10)}...). Both parties agree. Please execute the settlement on-chain now: developer receives ${settlementData.developerAmount}, client receives ${settlementData.clientAmount}.`,
        });
      }
    },
    [sendMessage, settlementData]
  );

  // Auto-generate client response after Clara finishes (first round only for now)
  const mediatorMessages = messages.filter((m) => m.role === "assistant");
  const mediatorCount = mediatorMessages.length;

  useEffect(() => {
    // Only trigger when mediator count increases and we're idle
    if (
      !selectedScenario ||
      isLoading ||
      mediatorCount === 0 ||
      mediatorCount === lastMediatorCountRef.current ||
      isGeneratingClientRef.current ||
      mediatorCount > 2 // max 2 auto-responses from client
    ) {
      return;
    }

    lastMediatorCountRef.current = mediatorCount;
    const lastMediatorMsg = mediatorMessages[mediatorMessages.length - 1];

    // Extract Clara's text from her last message
    const claraText = lastMediatorMsg.parts
      .filter((p) => p.type === "text")
      .map((p) => ("text" in p ? p.text : ""))
      .join("\n")
      .trim();

    if (!claraText) return;

    // Generate client response via /api/client-chat
    isGeneratingClientRef.current = true;

    // Build conversation summary for context
    const convSoFar = messages
      .map((m) => {
        const text = m.parts
          .filter((p) => p.type === "text")
          .map((p) => ("text" in p ? p.text : ""))
          .join("\n");
        return `${m.role === "user" ? "User" : "Mediator"}: ${text}`;
      })
      .join("\n\n");

    // Small delay so user sees Clara's message first
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/client-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: selectedScenario.id,
            messages: [
              {
                role: "user",
                parts: [
                  {
                    type: "text",
                    text: `Here is the mediation conversation so far:\n\n${convSoFar}\n\nThe mediator just said:\n"${claraText}"\n\nRespond in character. Be natural, short (2-3 paragraphs max). Push back if you haven't been heard yet.`,
                  },
                ],
              },
            ],
          }),
        });

        if (!res.ok || !res.body) return;

        // Parse streaming response to extract text
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let clientText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE lines
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "text-delta" && data.delta) {
                  clientText += data.delta;
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }

        if (clientText.trim()) {
          // Add as synthetic client message
          const clientMsg: ClientMessage = {
            id: `client-${Date.now()}`,
            role: "user",
            parts: [{ type: "text", text: clientText.trim() }],
            _isClientOpening: true,
            _clientName: selectedScenario.parties.client.name,
          };
          setClientMessages((prev) => [...prev, clientMsg]);

          // Now send the client's response to Clara
          sendMessage({
            text: `The client (${selectedScenario.parties.client.name}) responds:\n\n"${clientText.trim()}"\n\nContinue the mediation. Respond to their concerns directly.`,
          });
        }
      } finally {
        isGeneratingClientRef.current = false;
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [mediatorCount, isLoading, selectedScenario, messages, mediatorMessages, sendMessage]);

  const handleSubmit = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading) return;
      const devName = selectedScenario?.parties.developer.name ?? "The developer";
      sendMessage({
        text: `The developer (${devName}) responds:\n\n"${text.trim()}"\n\nThis is the DEVELOPER speaking, not the client. Respond accordingly — they are defending their work, not asking for a refund.`,
      });
      setInput("");
    },
    [isLoading, sendMessage, selectedScenario]
  );

  const handleSelectScenario = useCallback(
    (scenario: Scenario) => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;
      setSelectedScenario(scenario);

      // Create the client opening message for display
      const opening: ClientMessage = {
        id: "client-opening",
        role: "user",
        parts: [{ type: "text", text: scenario.clientOpening }],
        _isClientOpening: true,
        _clientName: scenario.parties.client.name,
      };
      setClientMessages([opening]);

      // Send context + client complaint to the mediator
      const mediatorPrompt = `${scenario.contextMessage}

--- CLIENT'S OPENING STATEMENT ---
The client (${scenario.parties.client.name}) has just filed this complaint:

"${scenario.clientOpening}"

--- YOUR TASK ---
Respond to the client directly. Address their frustration first, then analyze the evidence. Do NOT repeat the case details back — the client already knows their own situation. Be empathetic but fair. Speak to them like a real person. Use the same language as the client (Portuguese if they wrote in Portuguese, English if English).`;

      sendMessage({ text: mediatorPrompt });
    },
    [sendMessage]
  );

  // Start mediation only when user clicks the play button
  const handleStartMediation = useCallback(() => {
    if (!selectedScenario || mediationStarted) return;
    setMediationStarted(true);
    handleSelectScenario(selectedScenario);
  }, [selectedScenario, mediationStarted, handleSelectScenario]);

  // Register demo actions
  useEffect(() => {
    registerDemoAction("med-start", () => handleStartMediation());
  }, [handleStartMediation]);

  useEffect(() => {
    registerDemoAction("med-review-settlement", () => {
      if (settlementData) setShowSettlementModal(true);
    });
  }, [settlementData]);

  // Build the display messages: interleave client messages with mediator responses
  const displayMessages: UIMessage[] = [];

  // First: client opening
  if (clientMessages.length > 0) {
    displayMessages.push(clientMessages[0] as unknown as UIMessage);
  }

  // Then interleave: mediator response, then client auto-response, etc.
  let clientIdx = 1; // start from 1 (opening already added)
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    // Skip context messages (user messages with CONTRACT: that are just prompts)
    if (
      msg.role === "user" &&
      msg.parts.some(
        (p) =>
          p.type === "text" &&
          "text" in p &&
          p.text.length > 200 &&
          (p.text.includes("CONTRACT:") || p.text.includes("The client ("))
      )
    ) {
      continue;
    }

    displayMessages.push(msg);

    // After each mediator message, check if there's a corresponding client response
    if (msg.role === "assistant" && clientIdx < clientMessages.length) {
      displayMessages.push(clientMessages[clientIdx] as unknown as UIMessage);
      clientIdx++;
    }
  }

  /* ─── Scenario selection screen ─── */
  if (!selectedScenario) {
    return (
      <div className="relative min-h-screen">
        <ScenarioSelector onSelect={(s) => { setSelectedScenario(s); }} />
      </div>
    );
  }

  /* ─── Active mediation layout ─── */
  return (
    <div className="relative min-h-screen">
      <div className="relative mx-auto max-w-[1600px] px-4 py-4 lg:px-6">
        {/* Header bar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] as const }}
          className="mb-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedScenario(null);
                setMediationStarted(false);
                setClientMessages([]);
                hasStartedRef.current = false;
                lastMediatorCountRef.current = 0;
              }}
              className="group flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
              Cases
            </button>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Live Mediation
              </span>
            </div>

            <div className="h-4 w-px bg-border" />

            <span className="text-xs text-muted-foreground/50 font-mono">
              {selectedScenario.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
              ERC-8004
            </span>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
              <span className="text-[11px] font-mono text-muted-foreground/50">
                Base Sepolia
              </span>
            </div>
          </div>
        </motion.div>

        {/* 3-Panel Grid */}
        <div className="grid h-[calc(100vh-10rem)] grid-cols-1 gap-3 lg:grid-cols-12">
          {/* Left: Case Info */}
          <motion.div
            id="med-case-info"
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-3 min-h-0 overflow-y-auto"
          >
            <CaseInfoPanel
              scenario={selectedScenario}
              onViewContract={() => setShowOriginalContract(true)}
              wallet={walletAddress}
            />
          </motion.div>

          {/* Center: Chat */}
          <motion.div
            id="med-chat"
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 min-h-0"
          >
            <MediationChat
              messages={displayMessages}
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              status={status}
              onStop={stop}
              scenario={selectedScenario}
              started={mediationStarted}
              onStart={handleStartMediation}
              onReviewSettlement={settlementData ? () => setShowSettlementModal(true) : undefined}
              settlementSealed={settlementSealed}
            />
          </motion.div>

          {/* Right: Intelligence + Evidence */}
          <motion.div
            id="med-intelligence"
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-3 min-h-0 overflow-y-auto"
          >
            <IntelligencePanel scenario={selectedScenario} messages={displayMessages} />
          </motion.div>
        </div>
      </div>

      {/* Settlement Modal */}
      {settlementData && (
        <SettlementModal
          open={showSettlementModal}
          onClose={() => setShowSettlementModal(false)}
          onSeal={handleSeal}
          scenario={selectedScenario}
          settlement={settlementData}
          wallet={walletAddress}
          onConnectWallet={handleConnectWallet}
        />
      )}

      {/* Original Contract Modal */}
      <OriginalContractModal
        open={showOriginalContract}
        onClose={() => setShowOriginalContract(false)}
        scenario={selectedScenario}
      />
    </div>
  );
}
