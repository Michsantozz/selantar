"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useLoginWithEmail, useLoginWithOAuth, useLoginWithSiwe } from "@privy-io/react-auth";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Loader2, ArrowLeft } from "lucide-react";
import { HeartHandshake } from "lucide-react";

type View = "main" | "email-input" | "email-code";

export function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [view, setView] = useState<View>("main");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const { sendCode, loginWithCode, state: emailState } = useLoginWithEmail({
    onComplete: () => {
      onClose();
      resetState();
    },
    onError: (error) => {
      console.error("Email login error:", error);
    },
  });

  const { initOAuth } = useLoginWithOAuth({
    onComplete: () => {
      onClose();
      resetState();
    },
    onError: (error) => {
      console.error("OAuth error:", error);
    },
  });

  const { generateSiweMessage, loginWithSiwe } = useLoginWithSiwe({
    onComplete: () => {
      onClose();
      resetState();
    },
    onError: (error: Error) => {
      console.error("Wallet login error:", error);
    },
  });

  const resetState = () => {
    setView("main");
    setEmail("");
    setCode("");
  };

  const handleSendCode = async () => {
    if (!email) return;
    await sendCode({ email });
    setView("email-code");
  };

  const handleVerifyCode = async () => {
    if (!code) return;
    await loginWithCode({ code });
  };

  const isLoading =
    emailState.status === "sending-code" ||
    emailState.status === "submitting-code";

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { onClose(); resetState(); }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={() => { onClose(); resetState(); }}
              className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            {/* Logo + Title */}
            <div className="mb-6 flex flex-col items-center gap-3">
              <HeartHandshake className="size-8 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">
                {view === "main" && "Sign in to Selantar"}
                {view === "email-input" && "Enter your email"}
                {view === "email-code" && "Check your inbox"}
              </h2>
              {view === "email-code" && (
                <p className="text-sm text-muted-foreground text-center">
                  We sent a code to <span className="text-foreground">{email}</span>
                </p>
              )}
            </div>

            {/* Main view */}
            {view === "main" && (
              <div className="flex flex-col gap-3">
                {/* Google */}
                <button
                  onClick={() => initOAuth({ provider: "google" })}
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Email */}
                <button
                  onClick={() => setView("email-input")}
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Mail className="size-5 text-muted-foreground" />
                  Continue with Email
                </button>

                {/* Wallet */}
                <button
                  onClick={async () => {
                    const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
                    if (!ethereum) { alert("Install a wallet to continue"); return; }
                    const accounts = await ethereum.request({ method: "eth_requestAccounts" }) as string[];
                    if (!accounts[0]) return;
                    const message = await generateSiweMessage({ address: accounts[0] as `0x${string}`, chainId: "eip155:8453" as `eip155:${number}` });
                    const signature = await ethereum.request({ method: "personal_sign", params: [message, accounts[0]] }) as string;
                    await loginWithSiwe({ signature: signature as `0x${string}`, message });
                  }}
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                    <circle cx="17" cy="14" r="1.5" fill="currentColor" />
                  </svg>
                  Continue with Wallet
                </button>

                <p className="mt-2 text-center text-xs text-muted-foreground">
                  By continuing, you agree to Selantar&apos;s Terms of Service
                </p>
              </div>
            )}

            {/* Email input */}
            {view === "email-input" && (
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setView("main")}
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground self-start"
                >
                  <ArrowLeft className="size-3.5" />
                  Back
                </button>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                  placeholder="your@email.com"
                  autoFocus
                  className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={handleSendCode}
                  disabled={!email || isLoading}
                  className="rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="mx-auto size-4 animate-spin" />
                  ) : (
                    "Send code"
                  )}
                </button>
              </div>
            )}

            {/* Email code verification */}
            {view === "email-code" && (
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setView("email-input")}
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground self-start"
                >
                  <ArrowLeft className="size-3.5" />
                  Back
                </button>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                  placeholder="Enter code"
                  autoFocus
                  maxLength={6}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-center text-lg font-mono tracking-[0.3em] text-foreground placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-sm outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={handleVerifyCode}
                  disabled={!code || isLoading}
                  className="rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="mx-auto size-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </button>
                <button
                  onClick={handleSendCode}
                  disabled={isLoading}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Resend code
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
