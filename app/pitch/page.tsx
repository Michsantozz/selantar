"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Heatmap } from "@paper-design/shaders-react";

/* ─── Image loader ─── */
function useLoadedImage(src: string) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => setImg(image);
    image.src = src;
  }, [src]);
  return img;
}

/* ─── Helpers ─── */
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function easeOutExpo(t: number) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function easeOutQuart(t: number) { return 1 - Math.pow(1 - t, 4); }
function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }

const HEAT_COLORS = ["#120500","#2a0d00","#5a2205","#a84a10","#d96b1c","#f5893a","#ffd090"];

/* ═══════════════════════════════════════════════════════
   TIMELINE — 13 slides, timestamps do áudio (reviewed)

   1  0.00s    "Smart contracts... emotional creatures"      (6s)
   2  6.00s    "Blockchain promised to fix trust"            (16.8s)
   3  22.79s   "Eight billion humans..." 8B counter          (13.1s)
   4  35.90s   "Billions of variables..."                    (9.4s)
   5  45.30s   "Now here's what's interesting" + 40M AI      (20.5s)
   6  65.82s   "People trust AI with fears/loneliness"       (13.2s)
   7  79.06s   "But nobody put that where money gets stuck"  (7.6s)
   8  86.62s   "Oracles for everything — except people"      (9.7s)
   9  96.30s   "Until me." — big moment                      (11.1s)
   10 107.45s  "The world built oracles — People ✗"          (16.6s)
   11 124.09s  "$160B stuck / chase money"                   (16.1s)
   12 140.22s  "The conversation sucks" + Selantar moment    (18.9s)
   13 159.16s  "What if?" + close + coração
   ═══════════════════════════════════════════════════════ */

const S2  = 6000;
const S3  = 22790;
const S4  = 35900;
const S5  = 45300;    // "interesting" + 40M
const S6  = 65820;    // "fears, loneliness, doesn't judge"
const S7  = 79060;    // "stops where money gets stuck"
const S8  = 86620;    // oracles checklist
const S9  = 96300;    // "Until me"
const S10 = 107450;   // "world built oracles"
const S11 = 124090;   // "$160B"
const S12 = 140220;   // "And that little moment..." (was 141600, corrected to audio)
const S13 = 159160;   // close
const TOTAL = 208000;  // audio ends ~203.5s + 4.5s fade
const SLIDE_COUNT = 13;

const FADE = 400;

function slideOp(t: number, start: number, end: number): number {
  if (t < start) return 0;
  if (t < start + FADE) return clamp01((t - start) / FADE);
  if (t < end - FADE) return 1;
  if (t < end) return clamp01(1 - (t - (end - FADE)) / FADE);
  return 0;
}

const FRAGMENTS = [
  { text: "TRUST", x: "12%", y: "22%", rot: -4, delay: 2000 },
  { text: "IMMUTABLE", x: "68%", y: "18%", rot: 2.5, delay: 3000 },
  { text: "TRUSTLESS", x: "20%", y: "52%", rot: -1.5, delay: 4200 },
  { text: "CODE IS LAW", x: "58%", y: "60%", rot: 3, delay: 5500 },
  { text: "DECENTRALIZED", x: "15%", y: "75%", rot: -2.5, delay: 7000 },
  { text: "CONSENSUS", x: "72%", y: "42%", rot: 1.5, delay: 8500 },
  { text: "PERMISSIONLESS", x: "42%", y: "80%", rot: -1, delay: 10000 },
];

const VARIABLES = [
  { text: "MOOD", x: "10%", y: "20%", rot: -2, delay: 1200 },
  { text: "CONTEXT", x: "75%", y: "15%", rot: 3, delay: 2000 },
  { text: "MEMORY", x: "18%", y: "45%", rot: -1, delay: 2800 },
  { text: "EGO", x: "65%", y: "55%", rot: 2, delay: 3400 },
  { text: "FEAR", x: "30%", y: "70%", rot: -3, delay: 4000 },
  { text: "CULTURE", x: "70%", y: "38%", rot: 1.5, delay: 4600 },
  { text: "TRAUMA", x: "22%", y: "82%", rot: -1.5, delay: 5200 },
  { text: "PRIDE", x: "78%", y: "72%", rot: 2.5, delay: 5800 },
  { text: "HISTORY", x: "50%", y: "25%", rot: -0.5, delay: 6400 },
];

const AUDIO_URL = "https://fsn1.your-objectstorage.com/testeclaude/seltnar-inicial-colet.mp3";

export default function PitchPage() {
  const logoImage = useLoadedImage("/selantar-logo.png");
  const [t, setT] = useState(-1);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio(AUDIO_URL);
    a.preload = "auto";
    audioRef.current = a;
    return () => { a.pause(); a.src = ""; };
  }, []);

  const play = useCallback(() => {
    setT(0);
    startRef.current = performance.now();
    if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); }
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      setT(elapsed);
      if (elapsed < TOTAL + 2000) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const restart = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setT(-1);
    setTimeout(play, 80);
  }, [play]);

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); if (audioRef.current) audioRef.current.pause(); }, []);

  const playing = t >= 0;

  const BOUNDARIES = [0, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13];

  const jumpTo = useCallback((target: number) => {
    if (t < 0) return;
    startRef.current -= (target - t);
    if (audioRef.current) audioRef.current.currentTime = target / 1000;
  }, [t]);

  const next = useCallback(() => {
    if (t < 0) return;
    const nb = BOUNDARIES.find(b => b > t + 200);
    if (nb) jumpTo(nb);
  }, [t, jumpTo, BOUNDARIES]);

  const prev = useCallback(() => {
    if (t < 0) return;
    const pb = [...BOUNDARIES].reverse().find(b => b < t - 1000);
    jumpTo(pb ?? 0);
  }, [t, jumpTo, BOUNDARIES]);

  /* ══════ OPACITIES ══════ */
  const o1 = playing ? slideOp(t, 0, S2) : 0;         // cold numbers
  const o2 = playing ? slideOp(t, S2, S3) : 0;       // broken promise
  const o3 = playing ? slideOp(t, S3, S4) : 0;       // 8B humans
  const o4 = playing ? slideOp(t, S4, S5) : 0;       // variables
  const o5 = playing ? slideOp(t, S5, S6) : 0;       // interesting + 40M
  const o6 = playing ? slideOp(t, S6, S7) : 0;       // fears/loneliness/listens
  const o7 = playing ? slideOp(t, S7, S8) : 0;       // stops where money lives
  const o8 = playing ? slideOp(t, S8, S9) : 0;       // oracles checklist
  const o9 = playing ? slideOp(t, S9, S10) : 0;      // "Until me."
  const o10 = playing ? slideOp(t, S10, S11) : 0;    // world built oracles
  const o11 = playing ? slideOp(t, S11, S12) : 0;    // $160B
  const o12 = playing ? slideOp(t, S12, S13) : 0;    // conversation sucks
  const o13 = playing ? (t >= S13 ? clamp01((t - S13) / FADE) : 0) : 0; // close

  /* ══════ S1 — cold numbers (0 → 6s) ══════ */
  const coldIn = playing && t >= 400;
  const emotIn = playing && t >= 2000;
  const iceIn = playing && t >= 1200;
  const fireIn = playing && t >= 2800;

  /* ══════ S2 — broken promise (6 → 22.8s) ══════ */
  const promIn = playing && t >= S2 + 400;
  const strikeIn = playing && t >= S2 + 2200;
  const rigidIn = playing && t >= S2 + 3000;   // "rigid code" starts 9.04s

  /* ══════ S3 — 8B humans (22.8 → 35.9s) ══════ */
  const eightIn = playing && t >= S3 + 300;
  const c3s = S3 + 3500;
  const c3v = playing ? (t < c3s ? 0 : t > c3s + 2000 ? 8 : +(8 * easeOutQuart(clamp01((t - c3s) / 2000))).toFixed(1)) : 0;
  const panicIn = playing && t >= S3 + 5500;
  const everyIn = playing && t >= S3 + 8000;

  /* ══════ S4 — variables (35.9 → 45.3s) ══════ */
  const billIn = playing && t >= S4 + 400;
  const impoIn = playing && t >= S4 + 2500;
  const vc4s = S4 + 1200;
  const vc4 = playing ? (t < vc4s ? 0 : t > vc4s + 3000 ? 999 : Math.round(999 * easeOutQuart(clamp01((t - vc4s) / 3000)))) : 0;

  /* ══════ S5 — "interesting" + 40M + why they trust (45.3 → 65.8s = 20.5s) ══════ */
  const nowIn = playing && t >= S5 + 300;
  const intIn = playing && t >= S5 + 1200;
  const fortyIn = playing && t >= S5 + 3000;
  const c5s = S5 + 4500;
  const c5v = playing ? (t < c5s ? 0 : t > c5s + 1800 ? 40 : Math.round(40 * easeOutQuart(clamp01((t - c5s) / 1800)))) : 0;
  const trustAiIn = playing && t >= S5 + 9200;  // "Half the planet..." 54.49s
  const statsIn = playing && t >= S5 + 11000;
  const fearsIn = playing && t >= S5 + 14000;

  /* ══════ S6 — fears/loneliness/doesn't judge (65.8 → 79s = 13.2s) ══════ */
  const fearsLineIn = playing && t >= S6 + 500;
  const lonelyIn = playing && t >= S6 + 3000;
  const judgeIn = playing && t >= S6 + 6000;

  /* ══════ S7 — stops where money lives (79 → 86.6s = 7.6s) ══════ */
  const stopsIn = playing && t >= S7 + 400;
  const moneyIn = playing && t >= S7 + 3800;   // "money gets stuck" ~82.9s
  const stuckIn = playing && t >= S7 + 4500;

  /* ══════ S8 — oracles checklist (86.6 → 96.3s = 9.7s) ══════ */
  const oraclesIn = playing && t >= S8 + 400;
  const checkPrices = playing && t >= S8 + 2800;  // "prices" ~89.4s
  const checkWeather = playing && t >= S8 + 3600;  // "weather" ~90.2s
  const checkScores = playing && t >= S8 + 4400;   // "scores" ~91s
  const crossPeople = playing && t >= S8 + 5600;   // "Nobody solved it for people" 92.14s

  /* ══════ S9 — "Until me." (96.3 → 107.5s = 11s) ══════ */
  const untilIn = playing && t >= S9 + 300;
  const meIn = playing && t >= S9 + 1800;
  const meAge = playing && t >= S9 + 1800 ? clamp01((t - (S9 + 1800)) / 4000) : 0;

  /* ══════ S10 — world built oracles (107.5 → 124s = 16.6s) ══════ */
  const worldOraclesIn = playing && t >= S10 + 500;
  const woPrices = playing && t >= S10 + 3400;   // "Prices" ~110.8s
  const woWeather = playing && t >= S10 + 4600;  // "weather" ~112s
  const woScores = playing && t >= S10 + 5800;   // "sports scores" ~113.2s
  const woPeople = playing && t >= S10 + 7000;
  const woNobody = playing && t >= S10 + 9500;

  /* ══════ S11 — $160B (124 → 141.6s = 17.5s) ══════ */
  const chaseIn = playing && t >= S11 + 400;
  const c11s = S11 + 2000;
  const c11v = playing ? (t < c11s ? 0 : t > c11s + 2500 ? 160 : Math.round(160 * easeOutQuart(clamp01((t - c11s) / 2500)))) : 0;
  const awkwardIn = playing && t >= S11 + 6000;

  /* ══════ S12 — conversation sucks (140.22 → 159.2s = 18.9s) ══════ */
  const convIn = playing && t >= S12 + 500;         // "And that little moment" 140.72s
  const destroysIn = playing && t >= S12 + 3500;    // "billions of dollars" ~143.7s
  const notDishonestIn = playing && t >= S12 + 8630; // "Not because anyone's a bad person" 148.85s
  /* "So Selantar was built on..." 155.01s = S12 + 14790 */
  const selantarMoment = playing && t >= S12 + 14790;
  const selantarAge = playing && t >= S12 + 14790 ? clamp01((t - (S12 + 14790)) / 2000) : 0;

  /* ══════ S13 — "What if?" + close (159.16s → end) ══════ */
  // 159.16s "What if that conversation didn't have to happen"
  const whatIfIn = playing && t >= S13 + 500;
  // 195.66s "And people are messy and complicated and emotional"
  const messyIn = playing && t >= S13 + 36500;
  // 183.05s "And I turn stuck money into settled money" — shader starts here
  const shaderStart = S13 + 23900;
  const shaderDur = 4000;
  const sp = playing && t >= shaderStart ? clamp01((t - shaderStart) / shaderDur) : 0;
  const se = easeOutExpo(sp);
  const sg = easeOutQuart(sp);
  const shScale = lerp(0.12, 0.78, se);
  const shSpeed = lerp(0, 1.2, se);
  const shIG = lerp(0, 0.8, sg);
  const shOG = lerp(0, 0.9, sg);
  const shOp = clamp01(sp / 0.12);
  const shVS = lerp(0.15, 0.46, se);
  // 199.65s "And honestly, that's not a bug" — tagline appears
  const tagIn = playing && t >= S13 + 40500;

  const done = playing && t >= TOTAL;

  const currentSlide = !playing ? -1
    : t < S2 ? 0 : t < S3 ? 1 : t < S4 ? 2 : t < S5 ? 3
    : t < S6 ? 4 : t < S7 ? 5 : t < S8 ? 6 : t < S9 ? 7
    : t < S10 ? 8 : t < S11 ? 9 : t < S12 ? 10 : t < S13 ? 11 : 12;

  /* ── Shared slide wrapper ── */
  const Slide = ({ op, children }: { op: number; children: React.ReactNode }) => (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: op, pointerEvents: op < 0.1 ? "none" : "auto",
    }}>{children}</div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000",
      overflow: "hidden",
      fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
    }}>

      {/* ═══ 1 — Cold numbers ═══ */}
      <Slide op={o1}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 48px", textAlign: "center", maxWidth: 800 }}>
          <p style={{ margin: 0, fontSize: "clamp(1.3rem,2.4vw,1.9rem)", lineHeight: 1.5, fontWeight: 300, color: "oklch(0.7 0.015 60)", opacity: coldIn ? 1 : 0, transform: coldIn ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.9s ease, transform 0.9s ease" }}>
            Smart contracts gave us <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontWeight: 500, color: "oklch(0.6 0.06 230)" }}>hard, cold numbers</span>
          </p>
          <p style={{ margin: 0, marginTop: 12, fontSize: "clamp(1.3rem,2.4vw,1.9rem)", lineHeight: 1.5, fontWeight: 300, color: "oklch(0.7 0.015 60)", opacity: emotIn ? 1 : 0, transform: emotIn ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.9s ease, transform 0.9s ease" }}>
            for <span style={{ fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.5rem,2.8vw,2.2rem)", color: "oklch(0.85 0.16 55)" }}>emotional creatures.</span>
          </p>
          <div style={{ marginTop: 48, display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: iceIn ? 1 : 0, transform: iceIn ? "translateX(0)" : "translateX(-12px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
              <div style={{ width: 28, height: 2, background: "linear-gradient(to right, oklch(0.5 0.08 230), transparent)" }} />
              <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", color: "oklch(0.5 0.08 230)" }}>LOGIC</span>
            </div>
            <span style={{ fontSize: 10, color: "oklch(0.25 0 0)", opacity: iceIn && fireIn ? 1 : 0, transition: "opacity 0.4s ease" }}>vs</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: fireIn ? 1 : 0, transform: fireIn ? "translateX(0)" : "translateX(12px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
              <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", color: "oklch(0.72 0.17 55)" }}>EMOTION</span>
              <div style={{ width: 28, height: 2, background: "linear-gradient(to left, oklch(0.72 0.17 55), transparent)" }} />
            </div>
          </div>
        </div>
      </Slide>

      {/* ═══ 2 — Broken promise ═══ */}
      <Slide op={o2}>
        {FRAGMENTS.map((f, i) => {
          const fIn = playing && t >= S2 + f.delay;
          const fAge = fIn ? clamp01((t - (S2 + f.delay)) / 3000) : 0;
          const fading = fAge > 0.7 ? 1 - (fAge - 0.7) / 0.3 : 1;
          return <span key={i} style={{ position: "absolute", left: f.x, top: f.y, fontFamily: "var(--font-geist-mono),monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", color: "oklch(0.42 0.08 55)", transform: fIn ? `rotate(${f.rot}deg)` : `rotate(${f.rot}deg) translateY(10px)`, opacity: fIn ? fading * 0.85 : 0, transition: fIn ? "none" : "opacity 0.6s ease, transform 0.6s ease", pointerEvents: "none", textDecoration: "line-through", textDecorationColor: "oklch(0.45 0.14 25/0.7)" }}>{f.text}</span>;
        })}
        <div style={{ position: "relative", zIndex: 1, padding: "0 48px", textAlign: "center" }}>
          <p style={{ margin: 0, maxWidth: 700, fontSize: "clamp(1.4rem,2.6vw,2rem)", lineHeight: 1.5, fontWeight: 300, color: "oklch(0.75 0.02 60)", opacity: promIn ? 1 : 0, transform: promIn ? "translateY(0)" : "translateY(18px)", transition: "opacity 1s ease, transform 1s ease" }}>
            The blockchain promised to <span style={{ position: "relative", color: strikeIn ? "oklch(0.4 0.04 60)" : "oklch(0.75 0.02 60)", transition: "color 0.6s ease" }}>fix trust.<span style={{ position: "absolute", left: 0, right: 0, top: "55%", height: 2, background: "oklch(0.55 0.18 25)", transform: strikeIn ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)" }} /></span>
          </p>
          <p style={{ margin: 0, marginTop: 32, maxWidth: 650, fontSize: "clamp(1.05rem,1.7vw,1.3rem)", lineHeight: 1.6, fontWeight: 300, color: "oklch(0.5 0.015 60)", opacity: rigidIn ? 1 : 0, transform: rigidIn ? "translateY(0)" : "translateY(14px)", transition: "opacity 1s ease, transform 1s ease" }}>
            It gave us rigid, cold logic<br />for creatures that run on <span style={{ fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", color: "oklch(0.8 0.14 55)", fontWeight: 400 }}>context, ego, and fear.</span>
          </p>
        </div>
      </Slide>

      {/* ═══ 3 — 8 Billion ═══ */}
      <Slide op={o3}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(oklch(0.72 0.17 55/0.05) 1px, transparent 1px)", backgroundSize: "32px 32px", maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)", WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 900, padding: "0 48px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "clamp(1.05rem,1.8vw,1.35rem)", lineHeight: 1.5, color: "oklch(0.6 0.02 60)", fontWeight: 300, opacity: eightIn ? 1 : 0, transform: eightIn ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>Eight billion humans on this planet,<br />every single one unpredictable.</p>
          <div style={{ marginTop: 48, opacity: playing && t >= c3s ? 1 : 0, transform: playing && t >= c3s ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: "clamp(4rem,10vw,7.5rem)", fontWeight: 600, color: "oklch(0.82 0.18 55)", letterSpacing: "-0.04em", lineHeight: 1 }}>{c3v}B</span>
            <div style={{ marginTop: 8, fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "oklch(0.4 0.06 55)" }}>unpredictable humans</div>
          </div>
          <p style={{ margin: 0, marginTop: 36, fontSize: "clamp(0.95rem,1.4vw,1.1rem)", lineHeight: 1.65, color: "oklch(0.5 0.015 60)", fontWeight: 300, maxWidth: 600, opacity: panicIn ? 1 : 0, transform: panicIn ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.9s ease, transform 0.9s ease" }}>
            We change our minds, we panic at 3 AM,<br />we forget, we get sick, we get <span style={{ color: "oklch(0.75 0.14 55)", fontWeight: 400 }}>emotional.</span>
          </p>
          <p style={{ margin: 0, marginTop: 32, fontSize: "clamp(0.85rem,1.2vw,0.95rem)", fontWeight: 500, letterSpacing: "0.06em", color: "oklch(0.45 0.08 55)", opacity: everyIn ? 1 : 0, transition: "opacity 0.8s ease" }}>And every single one of us signs contracts.</p>
        </div>
      </Slide>

      {/* ═══ 4 — Billions of variables ═══ */}
      <Slide op={o4}>
        {VARIABLES.map((v, i) => {
          const vIn = playing && t >= S4 + v.delay;
          return <span key={i} style={{ position: "absolute", left: v.x, top: v.y, fontFamily: "var(--font-geist-mono),monospace", fontSize: 9, fontWeight: 600, letterSpacing: "0.2em", color: "oklch(0.45 0.1 55)", transform: vIn ? `rotate(${v.rot}deg)` : `rotate(${v.rot}deg) translateY(8px)`, opacity: vIn ? 0.8 : 0, transition: "opacity 0.5s ease, transform 0.5s ease", pointerEvents: "none" }}>{v.text}</span>;
        })}
        <div style={{ position: "relative", zIndex: 1, padding: "0 48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ opacity: playing && t >= vc4s ? 0.12 : 0, transition: "opacity 0.4s ease", position: "absolute", top: -80 }}>
            <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: "clamp(5rem,14vw,10rem)", fontWeight: 700, color: "oklch(0.72 0.17 55/0.15)", letterSpacing: "-0.06em", lineHeight: 1 }}>{vc4.toLocaleString()}</span>
          </div>
          <p style={{ margin: 0, maxWidth: 650, fontSize: "clamp(1.4rem,2.6vw,2rem)", lineHeight: 1.5, fontWeight: 300, color: "oklch(0.75 0.02 60)", opacity: billIn ? 1 : 0, transform: billIn ? "translateY(0)" : "translateY(18px)", transition: "opacity 1s ease, transform 1s ease" }}>Billions of variables,</p>
          <p style={{ margin: 0, marginTop: 12, fontSize: "clamp(1.4rem,2.6vw,2rem)", lineHeight: 1.5, fontWeight: 300, opacity: impoIn ? 1 : 0, transform: impoIn ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.9s ease, transform 0.9s ease" }}>
            <span style={{ fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", color: "oklch(0.82 0.16 55)", fontWeight: 400 }}>impossible to predict.</span>
          </p>
        </div>
      </Slide>

      {/* ═══ 5 — "Interesting" + 40M (merged, 20.5s) ═══ */}
      <Slide op={o5}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(oklch(0.72 0.17 55/0.04) 1.5px, transparent 1.5px)", backgroundSize: "20px 20px", maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)", WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 900, padding: "0 48px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {/* "Now here's what's interesting" — intro */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32, opacity: nowIn ? 1 : 0, transform: nowIn ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", color: "oklch(0.45 0.06 55)" }}>NOW</span>
            <span style={{ marginTop: 8, fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", fontSize: "clamp(1.3rem,2.4vw,1.8rem)", fontWeight: 400, color: "oklch(0.8 0.1 55)", opacity: intIn ? 1 : 0, transition: "opacity 0.8s ease" }}>here&apos;s what&apos;s interesting.</span>
          </div>
          {/* 40M counter */}
          <p style={{ margin: 0, fontSize: "clamp(1rem,1.6vw,1.2rem)", color: "oklch(0.55 0.02 60)", fontWeight: 300, opacity: fortyIn ? 1 : 0, transform: fortyIn ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>Forty million people already talk to an AI.</p>
          <div style={{ marginTop: 32, opacity: playing && t >= c5s ? 1 : 0, transform: playing && t >= c5s ? "scale(1)" : "scale(0.9)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: "clamp(3.5rem,9vw,6.5rem)", fontWeight: 600, color: "oklch(0.82 0.18 55)", letterSpacing: "-0.04em", lineHeight: 1 }}>{c5v}M</span>
            <div style={{ marginTop: 8, fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "oklch(0.4 0.06 55)" }}>humans trust AI daily</div>
          </div>
          <p style={{ margin: 0, marginTop: 32, fontSize: "clamp(0.95rem,1.4vw,1.1rem)", lineHeight: 1.6, color: "oklch(0.5 0.015 60)", fontWeight: 300, maxWidth: 550, opacity: trustAiIn ? 1 : 0, transform: trustAiIn ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.9s ease, transform 0.9s ease" }}>
            People trust AI with their <span style={{ color: "oklch(0.75 0.12 55)", fontWeight: 400 }}>fears</span>, their <span style={{ color: "oklch(0.75 0.12 55)", fontWeight: 400 }}>loneliness</span>, their <span style={{ color: "oklch(0.75 0.12 55)", fontWeight: 400 }}>secrets</span>.
          </p>
          <div style={{ marginTop: 28, display: "flex", gap: 16, opacity: statsIn ? 1 : 0, transform: statsIn ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            {[{ n: "28%", l: "use AI for therapy" }, { n: "52%", l: "prefer AI over humans" }].map(({ n, l }) => (
              <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 18px", borderRadius: 8, border: "1px solid oklch(0.72 0.17 55/0.15)", background: "oklch(0.06 0.01 55)" }}>
                <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: 18, fontWeight: 600, color: "oklch(0.82 0.18 55)" }}>{n}</span>
                <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.08em", color: "oklch(0.45 0.04 55)", marginTop: 4 }}>{l}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: 0, marginTop: 24, fontSize: "clamp(0.85rem,1.2vw,0.95rem)", fontWeight: 400, color: "oklch(0.45 0.02 60)", opacity: fearsIn ? 1 : 0, transition: "opacity 0.8s ease" }}>
            It doesn&apos;t judge. It just <span style={{ fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", color: "oklch(0.7 0.12 55)" }}>listens.</span>
          </p>
        </div>
      </Slide>

      {/* ═══ 6 — Fears, loneliness, doesn't judge (13.2s) ═══ */}
      <Slide op={o6}>
        <div style={{ position: "relative", padding: "0 48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 700 }}>
          <p style={{ margin: 0, fontSize: "clamp(1.2rem,2.2vw,1.7rem)", lineHeight: 1.6, fontWeight: 300, color: "oklch(0.7 0.015 60)", opacity: fearsLineIn ? 1 : 0, transform: fearsLineIn ? "translateY(0)" : "translateY(18px)", transition: "opacity 1s ease, transform 1s ease" }}>
            {"People already trust AI with their "}
            <span style={{ color: "oklch(0.75 0.12 55)", fontWeight: 400 }}>{"fears"}</span>
            {", their "}
            <span style={{ color: "oklch(0.75 0.12 55)", fontWeight: 400 }}>{"loneliness"}</span>
            {", their "}
            <span style={{ color: "oklch(0.75 0.12 55)", fontWeight: 400 }}>{"secrets"}</span>
            {"."}
          </p>
          <p style={{ margin: 0, marginTop: 32, fontSize: "clamp(1rem,1.6vw,1.25rem)", lineHeight: 1.6, color: "oklch(0.55 0.015 60)", fontWeight: 300, maxWidth: 550, opacity: lonelyIn ? 1 : 0, transform: lonelyIn ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.9s ease, transform 0.9s ease" }}>
            {"They tell it things they won\u2019t tell their therapist."}
          </p>
          <p style={{ margin: 0, marginTop: 32, fontSize: "clamp(1.1rem,1.8vw,1.4rem)", fontWeight: 400, opacity: judgeIn ? 1 : 0, transform: judgeIn ? "translateY(0) scale(1)" : "translateY(10px) scale(0.97)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
            {"Because it doesn\u2019t "}
            <span style={{ fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", color: "oklch(0.88 0.16 55)", fontSize: "clamp(1.3rem,2.2vw,1.7rem)" }}>{"judge."}</span>
          </p>
        </div>
      </Slide>

      {/* ═══ 7 — Stops where money lives (7.6s) ═══ */}
      <Slide op={o7}>
        <div style={{ position: "relative", padding: "0 48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 750 }}>
          <p style={{ margin: 0, fontSize: "clamp(1.2rem,2.2vw,1.7rem)", lineHeight: 1.5, fontWeight: 300, color: "oklch(0.7 0.015 60)", opacity: stopsIn ? 1 : 0, transform: stopsIn ? "translateY(0)" : "translateY(18px)", transition: "opacity 1s ease, transform 1s ease" }}>{"But that understanding?"}<br />{"It "}<span style={{ fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", color: "oklch(0.85 0.14 55)", fontWeight: 400 }}>{"stops"}</span>{" where money lives."}</p>
          <p style={{ margin: 0, marginTop: 28, fontSize: "clamp(1.3rem,2.4vw,1.9rem)", lineHeight: 1.4, fontWeight: 300, color: "oklch(0.75 0.02 60)", opacity: moneyIn ? 1 : 0, transform: moneyIn ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.9s ease, transform 0.9s ease" }}>
            {"Where "}<span style={{ fontFamily: "var(--font-geist-mono),monospace", fontWeight: 600, color: "oklch(0.82 0.18 55)", fontSize: "clamp(1.5rem,3vw,2.3rem)" }}>{"money"}</span>{" gets stuck."}
          </p>
          <div style={{ marginTop: 48, display: "flex", alignItems: "center", gap: 0, opacity: stuckIn ? 1 : 0, transform: stuckIn ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
            <div style={{ width: 80, height: 4, background: "oklch(0.72 0.17 55)", borderRadius: "2px 0 0 2px" }} />
            <div style={{ width: 40, height: 4, background: "transparent", position: "relative" }}>
              <span style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontFamily: "var(--font-geist-mono),monospace", fontSize: 8, fontWeight: 600, letterSpacing: "0.2em", color: "oklch(0.55 0.14 25)", animation: "blink 1.5s ease-in-out infinite" }}>{"STUCK"}</span>
            </div>
            <div style={{ width: 80, height: 4, background: "oklch(0.35 0.06 55)", borderRadius: "0 2px 2px 0" }} />
          </div>
        </div>
      </Slide>

      {/* ═══ 8 — Oracles checklist (9.7s) ═══ */}
      <Slide op={o8}>
        <div style={{ padding: "0 48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ margin: 0, fontSize: "clamp(1.1rem,1.8vw,1.4rem)", color: "oklch(0.6 0.02 60)", fontWeight: 300, opacity: oraclesIn ? 1 : 0, transform: oraclesIn ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>The world solved the Oracle problem for:</p>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
            {[{ label: "Prices", check: checkPrices }, { label: "Weather", check: checkWeather }, { label: "Scores", check: checkScores }].map(({ label, check }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, opacity: check ? 1 : 0, transform: check ? "translateX(0)" : "translateX(-20px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
                <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: 16, color: "oklch(0.6 0.18 145)" }}>&#10003;</span>
                <span style={{ fontSize: "clamp(1.2rem,2vw,1.6rem)", fontWeight: 400, color: "oklch(0.7 0.02 60)" }}>{label}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: crossPeople ? 1 : 0, transform: crossPeople ? "translateX(0) scale(1)" : "translateX(-20px) scale(0.95)", transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
              <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: 18, color: "oklch(0.65 0.22 25)", fontWeight: 700 }}>&#10007;</span>
              <span style={{ fontSize: "clamp(1.4rem,2.4vw,1.9rem)", fontWeight: 500, fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", color: "oklch(0.85 0.16 55)" }}>People</span>
            </div>
          </div>
        </div>
      </Slide>

      {/* ═══ 9 — "Until me." (11s) ═══ */}
      <Slide op={o9}>
        {/* Ripple rings */}
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: "1px solid oklch(0.72 0.17 55/0.1)", opacity: meAge * 0.6, transform: `scale(${1 + meAge * 2})`, transition: "none", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: "1px solid oklch(0.72 0.17 55/0.06)", opacity: meAge * 0.4, transform: `scale(${1 + meAge * 3.5})`, transition: "none", pointerEvents: "none" }} />

        {/* Coração/brasão — glow silhueta atrás do texto */}
        <div style={{
          position: "absolute",
          width: 280, height: 280,
          opacity: meIn ? meAge * 0.25 : 0,
          transform: `scale(${meIn ? 1 + meAge * 0.15 : 0.8})`,
          transition: "opacity 1.5s ease, transform 1.5s ease",
          pointerEvents: "none",
          filter: `blur(${8 - meAge * 4}px)`,
        }}>
          <svg viewBox="0 0 100 100" fill="none" style={{ width: "100%", height: "100%" }}>
            <defs>
              <radialGradient id="heartGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="oklch(0.82 0.22 55)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="oklch(0.72 0.17 55)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d="M50 88 C25 65 8 50 8 35 C8 22 18 12 30 12 C38 12 45 17 50 24 C55 17 62 12 70 12 C82 12 92 22 92 35 C92 50 75 65 50 88Z" fill="url(#heartGlow)" />
          </svg>
        </div>

        {/* Glow âmbar pulsante — acende quando "me." aparece */}
        <div style={{
          position: "absolute",
          width: 500, height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(0.72 0.17 55 / 0.12) 0%, oklch(0.72 0.17 55 / 0.04) 40%, transparent 70%)",
          opacity: meIn ? 1 : 0,
          transform: `scale(${meIn ? 1 : 0.5})`,
          transition: "opacity 1s ease, transform 1.2s cubic-bezier(0.16,1,0.3,1)",
          pointerEvents: "none",
          animation: meIn ? "heartPulse 3s ease-in-out infinite" : "none",
        }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
          <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: 12, fontWeight: 500, letterSpacing: "0.3em", color: "oklch(0.4 0.04 60)", opacity: untilIn ? 1 : 0, transform: untilIn ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>{"UNTIL"}</span>
          <span style={{ marginTop: 8, fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", fontSize: "clamp(4rem,12vw,9rem)", fontWeight: 400, color: "oklch(0.92 0.16 55)", letterSpacing: "-0.04em", opacity: meIn ? 1 : 0, transform: meIn ? "scale(1)" : "scale(0.7)", transition: "opacity 0.5s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)", textShadow: "0 0 80px oklch(0.72 0.17 55/0.4), 0 0 160px oklch(0.72 0.17 55/0.15)" }}>{"me."}</span>
        </div>
      </Slide>

      {/* ═══ 10 — World built oracles (16.6s) ═══ */}
      <Slide op={o10}>
        <div style={{ padding: "0 48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 750 }}>
          <p style={{ margin: 0, fontSize: "clamp(1.1rem,1.8vw,1.4rem)", color: "oklch(0.6 0.02 60)", fontWeight: 300, opacity: worldOraclesIn ? 1 : 0, transform: worldOraclesIn ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
            So look, the world built Oracles for everything.
          </p>
          <div style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {[{ l: "Prices", c: woPrices }, { l: "Weather", c: woWeather }, { l: "Scores", c: woScores }].map(({ l, c }) => (
              <span key={l} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid oklch(0.6 0.18 145/0.3)", background: "oklch(0.08 0.02 145)", fontSize: 12, fontWeight: 500, color: "oklch(0.6 0.14 145)", opacity: c ? 1 : 0, transform: c ? "scale(1)" : "scale(0.9)", transition: "opacity 0.4s ease, transform 0.4s ease" }}>{l} &#10003;</span>
            ))}
            <span style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid oklch(0.65 0.22 25/0.3)", background: "oklch(0.08 0.02 25)", fontSize: 12, fontWeight: 600, color: "oklch(0.65 0.22 25)", opacity: woPeople ? 1 : 0, transform: woPeople ? "scale(1)" : "scale(0.9)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>People &#10007;</span>
          </div>
          <p style={{ margin: 0, marginTop: 40, fontSize: "clamp(1rem,1.6vw,1.25rem)", lineHeight: 1.55, color: "oklch(0.55 0.015 60)", fontWeight: 300, opacity: woNobody ? 1 : 0, transform: woNobody ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.9s ease, transform 0.9s ease" }}>
            Nobody solved it for people.{" "}
            <span style={{ fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", color: "oklch(0.82 0.14 55)", fontWeight: 400 }}>Until now.</span>
          </p>
        </div>
      </Slide>

      {/* ═══ 11 — $160B (17.5s) ═══ */}
      <Slide op={o11}>
        <div style={{ position: "relative", maxWidth: 900, padding: "0 48px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "clamp(1rem,1.6vw,1.2rem)", color: "oklch(0.55 0.015 60)", fontWeight: 300, opacity: chaseIn ? 1 : 0, transform: chaseIn ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>Nobody wants to be the person chasing money.</p>
          <div style={{ marginTop: 40, opacity: playing && t >= c11s ? 1 : 0, transform: playing && t >= c11s ? "scale(1)" : "scale(0.9)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: "clamp(3.5rem,9vw,6.5rem)", fontWeight: 600, color: "oklch(0.65 0.22 25)", letterSpacing: "-0.04em", lineHeight: 1 }}>${c11v}B</span>
            <div style={{ marginTop: 8, fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "oklch(0.45 0.1 25)" }}>stuck every year</div>
          </div>
          <p style={{ margin: 0, marginTop: 36, fontSize: "clamp(1rem,1.5vw,1.15rem)", lineHeight: 1.6, color: "oklch(0.5 0.015 60)", fontWeight: 300, maxWidth: 550, opacity: awkwardIn ? 1 : 0, transform: awkwardIn ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.9s ease, transform 0.9s ease" }}>
            That awkward text: <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: "0.9em", color: "oklch(0.55 0.08 55)", fontStyle: "italic" }}>&quot;hey, you owe me&quot;</span>
            <br />destroys more deals than fraud ever will.
          </p>
        </div>
      </Slide>

      {/* ═══ 12 — The conversation sucks (17.5s) ═══ */}
      <Slide op={o12}>
        {/* Brasão/coração — aparece quando ela fala "Selantar" */}
        <div style={{
          position: "absolute",
          width: 220, height: 220,
          opacity: selantarAge * 0.3,
          transform: `scale(${0.6 + selantarAge * 0.5})`,
          transition: "none",
          pointerEvents: "none",
          filter: `blur(${6 - selantarAge * 4}px)`,
        }}>
          <svg viewBox="0 0 100 100" fill="none" style={{ width: "100%", height: "100%" }}>
            <defs>
              <radialGradient id="s12HeartGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="oklch(0.85 0.22 55)" stopOpacity="0.7" />
                <stop offset="70%" stopColor="oklch(0.72 0.17 55)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="oklch(0.72 0.17 55)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d="M50 88 C25 65 8 50 8 35 C8 22 18 12 30 12 C38 12 45 17 50 24 C55 17 62 12 70 12 C82 12 92 22 92 35 C92 50 75 65 50 88Z" fill="url(#s12HeartGlow)" />
          </svg>
        </div>
        {/* Glow radial atrás */}
        <div style={{
          position: "absolute",
          width: 400, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(0.72 0.17 55 / 0.1) 0%, transparent 60%)",
          opacity: selantarMoment ? 1 : 0,
          transform: `scale(${selantarMoment ? 1 : 0.3})`,
          transition: "opacity 1.5s ease, transform 2s cubic-bezier(0.16,1,0.3,1)",
          pointerEvents: "none",
        }} />

        <div style={{ padding: "0 48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 700, position: "relative", zIndex: 1 }}>
          <p style={{ margin: 0, fontSize: "clamp(1.2rem,2.2vw,1.7rem)", lineHeight: 1.5, fontWeight: 300, color: "oklch(0.7 0.015 60)", opacity: convIn ? 1 : 0, transform: convIn ? "translateY(0)" : "translateY(18px)", transition: "opacity 1s ease, transform 1s ease" }}>
            And that little moment — that{" "}
            <span style={{ fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", color: "oklch(0.85 0.14 55)", fontWeight: 400 }}>awkward human moment</span>
          </p>
          <p style={{ margin: 0, marginTop: 28, fontSize: "clamp(1.1rem,1.8vw,1.4rem)", lineHeight: 1.5, fontWeight: 300, color: "oklch(0.55 0.015 60)", opacity: destroysIn ? 1 : 0, transform: destroysIn ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.9s ease, transform 0.9s ease" }}>
            billions of dollars just get stuck every year.
          </p>
          <div style={{ marginTop: 40, width: 80, height: 1, background: "linear-gradient(to right, transparent, oklch(0.72 0.17 55/0.25), transparent)", opacity: destroysIn ? 1 : 0, transition: "opacity 1s ease 0.3s" }} />
          <p style={{ margin: 0, marginTop: 28, fontSize: "clamp(0.95rem,1.4vw,1.1rem)", fontWeight: 400, color: "oklch(0.5 0.06 55)", opacity: notDishonestIn ? 1 : 0, transform: notDishonestIn ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
            Not because anyone&apos;s dishonest — because the{" "}
            <span style={{ fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", color: "oklch(0.75 0.14 55)" }}>conversation sucks.</span>
          </p>
          {/* "Selantar" text reveal */}
          <p style={{ margin: 0, marginTop: 48, fontSize: "clamp(1.3rem,2.4vw,1.9rem)", fontWeight: 400, opacity: selantarMoment ? 1 : 0, transform: selantarMoment ? "translateY(0) scale(1)" : "translateY(16px) scale(0.95)", transition: "opacity 1s ease, transform 1.2s cubic-bezier(0.16,1,0.3,1)" }}>
            <span style={{ fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", color: "oklch(0.9 0.16 55)", textShadow: "0 0 40px oklch(0.72 0.17 55/0.3)" }}>Selantar</span>
            <span style={{ color: "oklch(0.55 0.02 60)", fontWeight: 300 }}>{" — one simple idea."}</span>
          </p>
        </div>
      </Slide>

      {/* ═══ 13 — "What if?" + CLOSE ═══ */}
      <Slide op={o13}>
        {/* Ambient glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 50% at 50% 45%, oklch(0.55 0.18 45/0.14) 0%, transparent 70%)", pointerEvents: "none", opacity: sg }} />

        {/* "What if" text — top */}
        <div style={{ position: "absolute", top: "7vh", left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 48px" }}>
          <p style={{ margin: 0, maxWidth: 700, textAlign: "center", fontSize: "clamp(1.2rem,2vw,1.6rem)", lineHeight: 1.55, color: "oklch(0.65 0.02 60)", fontWeight: 300, opacity: whatIfIn ? 1 : 0, transform: whatIfIn ? "translateY(0)" : "translateY(14px)", transition: "opacity 1s ease, transform 1s ease" }}>
            What if that conversation<br />
            <span style={{ fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", color: "oklch(0.88 0.16 55)", fontWeight: 400, fontSize: "clamp(1.4rem,2.4vw,1.9rem)" }}>just didn&apos;t have to happen?</span>
          </p>
          <p style={{ margin: 0, marginTop: 24, fontSize: "clamp(0.9rem,1.3vw,1.05rem)", color: "oklch(0.5 0.015 60)", fontWeight: 300, textAlign: "center", maxWidth: 550, opacity: messyIn ? 1 : 0, transform: messyIn ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.9s ease, transform 0.9s ease" }}>
            People are messy and complicated and emotional.<br />
            <span style={{ fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", color: "oklch(0.75 0.12 55)", fontWeight: 400 }}>That&apos;s the whole point.</span>
          </p>
        </div>

        {/* Shader — center */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: 1040, height: 1040, marginTop: -520, marginLeft: -520,
          transformOrigin: "center center", transform: `scale(${shVS})`,
          maskImage: "radial-gradient(circle at 50% 50%, black 35%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 35%, transparent 72%)",
          opacity: shOp, animation: sp >= 1 ? "breathe 5s ease-in-out infinite" : "none",
        }}>
          {logoImage && o13 > 0 && (
            <Heatmap width={1040} height={1040} image={logoImage} colors={HEAT_COLORS}
              colorBack="#070300" contour={0.42} angle={0} noise={0.015}
              innerGlow={shIG} outerGlow={shOG} speed={shSpeed} scale={shScale} />
          )}
        </div>

        {/* Tagline — bottom */}
        <div style={{ position: "absolute", bottom: "10vh", left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: tagIn ? 1 : 0, transform: tagIn ? "translateY(0)" : "translateY(10px)", transition: "opacity 1.1s ease, transform 1.1s ease" }}>
          <span style={{ fontFamily: "var(--font-display),Georgia,serif", fontStyle: "italic", fontSize: "clamp(1.4rem,2.8vw,2.2rem)", fontWeight: 400, color: "oklch(0.92 0.04 60)", letterSpacing: "-0.01em", textAlign: "center" }}>
            Selantar — where commitments are sealed.
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "oklch(0.55 0.12 55)" }}>selantar.xyz</span>
        </div>
      </Slide>

      {/* ═══ SLIDE NUMBER ═══ */}
      {playing && currentSlide >= 0 && (
        <div style={{ position: "fixed", top: 24, right: 32, zIndex: 20, display: "flex", alignItems: "center", gap: 10, opacity: 0.5 }}>
          <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", color: "oklch(0.5 0.06 55)" }}>
            {String(currentSlide + 1).padStart(2, "0")}/{String(SLIDE_COUNT).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* ═══ BOTTOM HUD ═══ */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "20px 48px", display: "flex", alignItems: "center", gap: 16, zIndex: 20, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}>
        <button onClick={playing ? restart : play} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 6, border: "1px solid oklch(0.72 0.17 55/35%)", background: "oklch(0.1 0.005 50)", color: "oklch(0.8 0.01 80)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
          {!playing ? <><PlayIcon /> Play</> : done ? <><ReplayIcon /> Replay</> : <><ReplayIcon /> Restart</>}
        </button>
        {playing && !done && (
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={prev} style={{ display: "flex", alignItems: "center", padding: "5px 8px", borderRadius: 4, border: "1px solid oklch(0.3 0.01 55/40%)", background: "transparent", color: "oklch(0.45 0.02 80)", cursor: "pointer", opacity: 0.45, transition: "opacity 0.2s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.45"; }}>
              <PrevIcon />
            </button>
            <button onClick={next} style={{ display: "flex", alignItems: "center", padding: "5px 8px", borderRadius: 4, border: "1px solid oklch(0.3 0.01 55/40%)", background: "transparent", color: "oklch(0.45 0.02 80)", cursor: "pointer", opacity: 0.45, transition: "opacity 0.2s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.45"; }}>
              <NextIcon />
            </button>
          </div>
        )}
        <div style={{ flex: 1, height: 2, background: "oklch(0.15 0.005 80)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${clamp01((t < 0 ? 0 : t) / TOTAL) * 100}%`, background: "linear-gradient(to right, oklch(0.55 0.15 45), oklch(0.82 0.22 55))", borderRadius: 2, boxShadow: "0 0 8px oklch(0.72 0.17 55/40%)" }} />
        </div>
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          {Array.from({ length: SLIDE_COUNT }, (_, i) => (
            <span key={i} style={{ width: 10, height: 2, borderRadius: 1, background: currentSlide === i ? "oklch(0.82 0.18 55)" : "oklch(0.2 0.01 55)", transition: "background 0.4s ease" }} />
          ))}
        </div>
        <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: 10, color: "oklch(0.35 0.005 80)", letterSpacing: "0.06em", minWidth: 48, textAlign: "right" }}>
          {t < 0 ? "0.0s" : `${(Math.min(t, TOTAL) / 1000).toFixed(1)}s`}
        </span>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(0.46); }
          50% { transform: scale(0.475); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes heartPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

function PrevIcon() { return <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="3" height="16" /><path d="M18 4L8 12l10 8V4z" /></svg>; }
function NextIcon() { return <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l10 8-10 8V4z" /><rect x="17" y="4" width="3" height="16" /></svg>; }
function PlayIcon() { return <svg width="8" height="10" viewBox="0 0 10 12" fill="currentColor"><path d="M0 0l10 6-10 6z" /></svg>; }
function ReplayIcon() { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 .49-3.74" /></svg>; }
