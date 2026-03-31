"use client";

import { useState, useRef, useEffect } from "react";
import { isToolUIPart } from "ai";
import type { UIMessage } from "ai";
import {
  ShieldCheckIcon,
  SparklesIcon,
  XIcon,
  SendIcon,
} from "lucide-react";
import { ACCENT, MUTED } from "./sentinel-constants";

interface SentinelChatProps {
  messages: UIMessage[];
  sendMessage: (msg: { text: string }) => void;
  status: string;
  onClose: () => void;
}

export function SentinelChat({
  messages,
  sendMessage,
  status,
  onClose,
}: SentinelChatProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isStreaming = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage({ text });
  };

  return (
    <div
      className="flex flex-col border-r border-border bg-card/50 backdrop-blur-sm shrink-0 min-h-0"
      style={{ width: 380 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div
          className="flex size-8 items-center justify-center rounded-lg"
          style={{
            background: `oklch(0.7 0.18 50 / 0.12)`,
            border: `1px solid oklch(0.7 0.18 50 / 0.25)`,
          }}
        >
          <ShieldCheckIcon className="size-4" style={{ color: ACCENT }} />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-foreground">
            Sentinel Chat
          </p>
          <p className="text-[10px] text-muted-foreground/40">
            Contract assistant
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex size-6 items-center justify-center rounded-md transition-all hover:bg-muted/20"
        >
          <XIcon className="size-3.5 text-muted-foreground/50" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3"
      >
        {messages.map((msg) => {
          if (msg.role === "user") {
            return (
              <div key={msg.id} className="flex justify-end">
                <div
                  className="rounded-xl rounded-tr-sm px-3 py-2 max-w-[85%]"
                  style={{
                    background: `oklch(0.7 0.18 50 / 0.08)`,
                    border: `1px solid oklch(0.7 0.18 50 / 0.15)`,
                  }}
                >
                  {msg.parts
                    .filter((p) => p.type === "text")
                    .map((p, i) => (
                      <p
                        key={i}
                        className="text-[11px] leading-relaxed text-foreground/75"
                      >
                        {p.text}
                      </p>
                    ))}
                </div>
              </div>
            );
          }

          if (msg.role === "assistant") {
            const textParts = msg.parts.filter((p) => p.type === "text");
            const toolParts = msg.parts.filter((p) => isToolUIPart(p));

            return (
              <div key={msg.id} className="flex flex-col gap-2">
                {/* Tool indicators */}
                {toolParts.map((part) => {
                  if (!isToolUIPart(part)) return null;
                  const isLoading =
                    part.state === "input-streaming" ||
                    part.state === "input-available";
                  return (
                    <div
                      key={part.toolCallId}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                      style={{
                        background: `oklch(0.7 0.18 50 / 0.04)`,
                        border: `1px solid oklch(0.7 0.18 50 / 0.1)`,
                      }}
                    >
                      <div
                        className="size-1.5 rounded-full"
                        style={{
                          background: isLoading ? ACCENT : "#22c55e",
                          animation: isLoading
                            ? "sp-pulse 1s ease-in-out infinite"
                            : undefined,
                        }}
                      />
                      <span className="text-[9px] font-medium text-muted-foreground/50">
                        {isLoading ? "Processing..." : "Done"}
                      </span>
                    </div>
                  );
                })}

                {/* Text content */}
                {textParts.length > 0 && (
                  <div className="flex gap-2.5">
                    <div
                      className="flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5"
                      style={{
                        background: `oklch(0.7 0.18 50 / 0.12)`,
                        border: `1px solid oklch(0.7 0.18 50 / 0.2)`,
                      }}
                    >
                      <SparklesIcon
                        className="size-2.5"
                        style={{ color: ACCENT }}
                      />
                    </div>
                    <div
                      className="rounded-xl rounded-tl-sm border px-3 py-2 max-w-[85%]"
                      style={{
                        borderColor: `${MUTED}30`,
                        background: `${MUTED}08`,
                      }}
                    >
                      {textParts.map((p, i) => (
                        <p
                          key={i}
                          className="text-[11px] leading-relaxed text-foreground/75"
                        >
                          {p.text}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border px-3 py-3">
        <div
          className="flex items-center gap-2 rounded-xl border px-3 py-2"
          style={{ borderColor: `${MUTED}40`, background: `${MUTED}06` }}
        >
          <input
            type="text"
            placeholder="Talk to Sentinel..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-[11px] text-foreground outline-none placeholder:text-muted-foreground/25 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="flex size-7 items-center justify-center rounded-lg transition-all hover:brightness-125 disabled:opacity-30"
            style={{ background: ACCENT }}
          >
            <SendIcon
              className="size-3"
              style={{ color: "oklch(0.08 0.01 50)" }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
