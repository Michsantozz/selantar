"use client";

import { useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import { motion } from "framer-motion";
import { OnChainPanel } from "./_components/on-chain-panel";
import { ChatPanel } from "./_components/chat-panel";
import { ToolsPanel } from "./_components/tools-panel";
import { SettlementPanel } from "./_components/settlement-panel";
import { MOCK_TOOL_PARTS, MOCK_SETTLEMENT_DATA } from "./_components/mock-data";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

export default function DashboardPage() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/mediation-chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading) return;
      sendMessage({ text });
      setInput("");
    },
    [isLoading, sendMessage]
  );

  // Use real tool parts when available, fall back to mock
  const realToolParts = messages.flatMap((msg) =>
    msg.parts
      .filter((p) => isToolUIPart(p))
      .map((p) => ({
        ...p,
        messageId: msg.id,
      }))
  );

  const toolParts = realToolParts.length > 0 ? realToolParts : MOCK_TOOL_PARTS;

  // Use real settlement data when available, fall back to mock
  const realSettlement = realToolParts
    .filter(
      (p) =>
        p.state === "output-available" &&
        (p.type === "tool-proposeSettlement" ||
          p.type === "tool-executeSettlement" ||
          p.type === "tool-registerVerdict" ||
          p.type === "tool-postFeedback")
    )
    .map((p) => ({
      type: p.type.replace("tool-", ""),
      output: p.output as Record<string, unknown>,
    }));

  const settlementData = realSettlement.length > 0 ? realSettlement : MOCK_SETTLEMENT_DATA;

  return (
    <div className="relative min-h-screen">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-[600px] w-[600px] rounded-full bg-primary/3 blur-[160px]" />
        <div className="absolute -right-40 bottom-20 h-[500px] w-[500px] rounded-full bg-primary/2 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-4 py-6 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }}
          className="mb-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Dashboard
            </span>
            <div className="mx-2 h-4 w-px bg-border" />
            <span className="text-xs text-muted-foreground/60 font-mono">
              Mediacao ativa
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
            <span className="text-[11px] font-mono text-muted-foreground/50">
              Base Sepolia
            </span>
          </div>
        </motion.div>

        {/* 4-Panel Bento Grid */}
        <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-3 lg:grid-cols-12 lg:grid-rows-2">
          {/* Panel 1: Chat — left 7 cols, full height */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 lg:row-span-2 min-h-0"
          >
            <ChatPanel
              messages={messages}
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              status={status}
              onStop={stop}
            />
          </motion.div>

          {/* Panel 2: On-chain Status — top-right */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 min-h-0"
          >
            <OnChainPanel toolParts={toolParts} />
          </motion.div>

          {/* Panel 3: Tools — bottom-right-left */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 min-h-0"
          >
            <ToolsPanel toolParts={toolParts} />
          </motion.div>

          {/* Panel 4: Settlement — bottom-right-right */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-3 min-h-0"
          >
            <SettlementPanel data={settlementData} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
