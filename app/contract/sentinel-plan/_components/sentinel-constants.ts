import {
  GitBranchIcon,
  MessageCircleIcon,
  GlobeIcon,
  ServerIcon,
  WalletIcon,
  CalendarIcon,
  EyeIcon,
  SparklesIcon,
  CheckIcon,
  XIcon,
  ArrowRightIcon,
  ClockIcon,
  CircleDotIcon,
  CheckCircleIcon,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export type ContractNodeData = {
  title: string;
  parties: { client: string; dev: string };
  value: string;
  milestones: number;
  duration: string;
};

export type AnalysisNodeData = {
  label: string;
  findings: string[];
  status: "pending" | "running" | "done";
};

export type ActionStatus =
  | "pending"
  | "suggested"
  | "approved"
  | "rejected"
  | "sent"
  | "waiting"
  | "accepted"
  | "declined";

export type ActionNodeData = {
  label: string;
  description: string;
  icon: keyof typeof actionIcons;
  frequency?: string;
  target?: string;
  status: ActionStatus;
  milestone?: string;
  sentTo?: string;
  timestamp?: string;
  onApprove?: () => void;
  onReject?: () => void;
};

export type MilestoneNodeData = {
  label: string;
  value: string;
  index: number;
};

export type DateNodeData = {
  day: string;
  month: string;
  year?: string;
  isLate?: boolean;
};

export type SentinelSayData = {
  text: string;
};

// ── Colors ───────────────────────────────────────────────────────────────────

export const ACCENT = "oklch(0.7 0.18 50)";
export const GREEN = "#22c55e";
export const RED = "#ef4444";
export const YELLOW = "#eab308";
export const MUTED = "#3f3f46";
export const BLUE = "#3b82f6";
export const VIOLET = "#8b5cf6";

// ── Icon Map ─────────────────────────────────────────────────────────────────

export const actionIcons = {
  github: GitBranchIcon,
  whatsapp: MessageCircleIcon,
  deploy: GlobeIcon,
  api: ServerIcon,
  escrow: WalletIcon,
  calendar: CalendarIcon,
  monitor: EyeIcon,
};

// ── Status Config ────────────────────────────────────────────────────────────

export const statusConfig: Record<
  ActionStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: typeof CheckIcon;
    animate?: boolean;
  }
> = {
  pending: {
    label: "",
    color: MUTED,
    bg: "transparent",
    border: `${MUTED}40`,
    icon: CircleDotIcon,
  },
  suggested: {
    label: "Suggestion",
    color: ACCENT,
    bg: `oklch(0.7 0.18 50 / 0.04)`,
    border: `oklch(0.7 0.18 50 / 0.4)`,
    icon: SparklesIcon,
    animate: true,
  },
  approved: {
    label: "Approved",
    color: GREEN,
    bg: `${GREEN}04`,
    border: `${GREEN}40`,
    icon: CheckIcon,
  },
  rejected: {
    label: "Rejected",
    color: RED,
    bg: `${RED}04`,
    border: `${RED}30`,
    icon: XIcon,
  },
  sent: {
    label: "Sent",
    color: BLUE,
    bg: `${BLUE}04`,
    border: `${BLUE}40`,
    icon: ArrowRightIcon,
  },
  waiting: {
    label: "Waiting",
    color: YELLOW,
    bg: `${YELLOW}04`,
    border: `${YELLOW}40`,
    icon: ClockIcon,
    animate: true,
  },
  accepted: {
    label: "Accepted",
    color: GREEN,
    bg: `${GREEN}06`,
    border: `${GREEN}50`,
    icon: CheckCircleIcon,
  },
  declined: {
    label: "Declined",
    color: RED,
    bg: `${RED}04`,
    border: `${RED}30`,
    icon: XIcon,
  },
};

// ── Color Map (action icon → color) ─────────────────────────────────────────

export const colorMap: Record<string, string> = {
  github: VIOLET,
  whatsapp: "#25D366",
  deploy: BLUE,
  api: YELLOW,
  escrow: GREEN,
  calendar: ACCENT,
  monitor: ACCENT,
};

// ── Layout Constants ─────────────────────────────────────────────────────────

export const ROW_TOP = 0;
export const ROW_MILESTONES = 80;
export const ROW_ACTIONS = 210;
export const MS_X_START = 0;
export const MS_GAP_X = 340;
export const CONTRACT_X = -420;
export const ANALYSIS_X = -420;
export const ANALYSIS_Y = 220;
export const SENTINEL_X = -420;
export const SENTINEL_Y = 800;
