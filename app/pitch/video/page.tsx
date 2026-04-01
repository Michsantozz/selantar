"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
} from "lucide-react";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function HeartMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-2 -1 28 28"
      className={className}
      fill="none"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="currentColor"
      />
      <path
        d="M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PitchVideoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [buffered, setBuffered] = useState(0);

  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  const scheduleHide = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setShowControls(true);
    if (playing) {
      hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  useEffect(() => {
    if (!playing) {
      setShowControls(true);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    } else {
      scheduleHide();
    }
  }, [playing, scheduleHide]);

  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setCurrentTime(v.currentTime);
    setProgress((v.currentTime / v.duration) * 100);
    if (v.buffered.length > 0) {
      setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
    }
  }, []);

  const onLoadedMetadata = useCallback(() => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
      setHasStarted(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const c = playerRef.current;
    if (!c) return;
    if (!document.fullscreenElement) {
      c.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    const v = videoRef.current;
    if (!bar || !v) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "k") { e.preventDefault(); togglePlay(); }
      if (e.key === "m") toggleMute();
      if (e.key === "f") toggleFullscreen();
      if (e.key === "ArrowRight" && videoRef.current) videoRef.current.currentTime += 5;
      if (e.key === "ArrowLeft" && videoRef.current) videoRef.current.currentTime -= 5;
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay, toggleMute, toggleFullscreen]);

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const isEnded = hasStarted && !playing && currentTime > 0 && duration > 0 && currentTime >= duration - 0.5;

  return (
    <div className="h-dvh bg-background relative overflow-hidden">

      {/* ═══ Corner heart glows ═══ */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1.5 }}
      >
        <HeartMark className="size-[120px] md:size-[220px] -translate-x-1/3 -translate-y-1/3 text-accent blur-[60px] md:blur-[80px] opacity-[0.07]" />
      </motion.div>

      <motion.div
        className="fixed bottom-0 right-0 pointer-events-none"
        animate={{ opacity: playing ? [0.05, 0.09, 0.05] : 0.06 }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <HeartMark className="size-[160px] md:size-[320px] translate-x-1/4 translate-y-1/4 text-accent blur-[60px] md:blur-[100px]" />
      </motion.div>

      <motion.div
        className="fixed top-0 right-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.02 }}
        transition={{ delay: 0.8, duration: 2 }}
      >
        <HeartMark className="size-[80px] md:size-[160px] translate-x-1/4 -translate-y-1/4 text-foreground" />
      </motion.div>

      <motion.div
        className="fixed bottom-0 left-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.04 }}
        transition={{ delay: 1.2, duration: 2 }}
      >
        <HeartMark className="size-[100px] md:size-[180px] -translate-x-1/3 translate-y-1/3 text-accent blur-[40px] md:blur-[60px]" />
      </motion.div>

      {/* ═══ Section 1 — Hero with headline + video side by side ═══ */}
      <section className="relative z-10 flex items-center h-full px-4 md:px-6 xl:px-9">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 md:gap-8 xl:flex-row xl:items-center xl:gap-16">

          {/* ── Left column — branding text ── */}
          <motion.div
            className="flex w-full flex-col items-start pt-6 md:pt-0 xl:w-[30%] xl:shrink-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0, 0, 0.2, 1] }}
          >
            {/* Section label */}
            <div className="mb-4 md:mb-6 xl:mb-8 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                The project
              </span>
            </div>

            {/* Headline — branding, not sales */}
            <h1 className="text-3xl md:text-5xl xl:text-7xl font-normal tracking-tight leading-[0.95] text-foreground">
              Contracts
              <br />
              break.
            </h1>

            <motion.div
              className="mt-4 md:mt-6 h-px w-10 md:w-12 bg-accent/40"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0, 0, 0.2, 1] }}
              style={{ transformOrigin: "left" }}
            />

            <motion.h2
              className="mt-4 md:mt-6 text-3xl md:text-5xl xl:text-7xl font-normal tracking-tight leading-[0.95] text-accent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease: [0, 0, 0.2, 1] }}
            >
              We fix
              <br />
              the people.
            </motion.h2>

            {/* Subtle heart mark as signature — hidden on small screens */}
            <motion.div
              className="mt-6 xl:mt-10 hidden md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <HeartMark className="size-5 xl:size-6 text-accent/20" />
            </motion.div>
          </motion.div>

          {/* ── Right column — video player (larger) ── */}
          <motion.div
            ref={playerRef}
            className="relative w-full xl:w-[70%] rounded-xl border border-border overflow-hidden select-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0, 0, 0.2, 1] }}
            onMouseMove={scheduleHide}
            onMouseLeave={() => playing && setShowControls(false)}
          >
            {/* Ambient glow */}
            <div className="absolute -inset-1 rounded-xl bg-accent/[0.03] blur-2xl -z-10 pointer-events-none" />

            <video
              ref={videoRef}
              src="https://fsn1.your-objectstorage.com/testeclaude/SUBMISSIONGENESYS.mp4"
              className="w-full aspect-video bg-black object-contain cursor-pointer"
              playsInline
              preload="metadata"
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={onLoadedMetadata}
              onEnded={() => setPlaying(false)}
              onClick={togglePlay}
            />

            {/* Initial play overlay */}
            <AnimatePresence>
              {!hasStarted && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/20 cursor-pointer"
                  onClick={togglePlay}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.35 } }}
                >
                  <motion.div
                    className="flex size-14 md:size-20 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: [0, 0, 0.2, 1] }}
                    whileHover={{ scale: 1.06, borderColor: "rgba(226,134,58,0.2)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="size-6 md:size-8 text-foreground/70 ml-1" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* End state */}
            <AnimatePresence>
              {isEnded && (
                <motion.div
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0, 0, 0.2, 1] }}
                  onClick={togglePlay}
                >
                  <div className="absolute inset-0 bg-black/60" />

                  <motion.div
                    className="relative z-10"
                    initial={{ scale: 0.75, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.9, ease: [0, 0, 0.2, 1] }}
                  >
                    <HeartMark className="size-14 text-accent" />
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                      <HeartMark className="size-22 text-accent blur-[32px] opacity-40" />
                    </div>
                  </motion.div>

                  <motion.button
                    className="relative z-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-foreground/60 transition-colors hover:border-accent/30 hover:text-foreground"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const v = videoRef.current;
                      if (v) { v.currentTime = 0; v.play(); setPlaying(true); }
                    }}
                  >
                    Replay
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <AnimatePresence>
              {showControls && hasStarted && !isEnded && (
                <motion.div
                  className="absolute inset-x-0 bottom-0 z-30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none" />

                  <div className="relative px-4 pb-4 pt-14">
                    <div
                      ref={progressRef}
                      className="relative mb-3 h-[3px] cursor-pointer rounded-full bg-white/10 group/bar transition-all hover:h-[5px]"
                      onClick={seek}
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-white/10"
                        style={{ width: `${buffered}%` }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-accent"
                        style={{ width: `${progress}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-3 rounded-full bg-accent opacity-0 group-hover/bar:opacity-100 transition-opacity shadow-lg shadow-accent/40"
                        style={{ left: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                        className="text-foreground/70 hover:text-foreground transition-colors"
                        aria-label={playing ? "Pause" : "Play"}
                      >
                        {playing ? <Pause className="size-[18px]" /> : <Play className="size-[18px] ml-0.5" />}
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                        className="text-foreground/70 hover:text-foreground transition-colors"
                        aria-label={muted ? "Unmute" : "Mute"}
                      >
                        {muted ? <VolumeX className="size-[18px]" /> : <Volume2 className="size-[18px]" />}
                      </button>

                      <span className="font-mono text-[11px] text-foreground/40 tabular-nums">
                        {fmt(currentTime)}
                        <span className="text-foreground/20 mx-1">/</span>
                        {fmt(duration)}
                      </span>

                      <div className="flex-1" />

                      <HeartMark className="size-3.5 text-accent/20" />

                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                        className="text-foreground/70 hover:text-foreground transition-colors"
                        aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                      >
                        {fullscreen ? <Minimize className="size-[18px]" /> : <Maximize className="size-[18px]" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
