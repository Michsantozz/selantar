import type { Node, Edge } from "@xyflow/react";
import type { MonitoringPlan } from "@/lib/schemas/sentinel-plan";
import {
  ACCENT,
  ROW_MILESTONES,
  ROW_ACTIONS,
  MS_X_START,
  MS_GAP_X,
  SENTINEL_X,
  SENTINEL_Y,
  colorMap,
} from "@/app/contract/sentinel-plan/_components/sentinel-constants";

/**
 * Pure function: converts a MonitoringPlan into ReactFlow nodes and edges.
 * Does NOT include contract or analysis nodes — those are managed by the page.
 */
export function planToReactFlow(plan: MonitoringPlan): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // ── Milestones (horizontal spine) ──

  plan.milestones.forEach((ms, i) => {
    const x = MS_X_START + i * MS_GAP_X;

    nodes.push({
      id: ms.id,
      type: "milestone",
      position: { x, y: ROW_MILESTONES },
      data: {
        label: ms.label,
        value: ms.value,
        index: ms.index,
      },
    });

    // Milestone chain edge
    if (i > 0) {
      const prev = plan.milestones[i - 1];
      edges.push({
        id: `e-${prev.id}-${ms.id}`,
        source: prev.id,
        target: ms.id,
        type: "smoothstep",
        style: { stroke: ACCENT, strokeWidth: 2 },
      });
    }
  });

  // ── Dates (above milestones) ──

  plan.dates.forEach((d) => {
    const ms = plan.milestones.find((m) => m.id === d.milestoneId);
    if (!ms) return;
    const msIndex = plan.milestones.indexOf(ms);
    const x = MS_X_START + msIndex * MS_GAP_X + 74;

    const dateId = `date-${d.milestoneId}`;

    nodes.push({
      id: dateId,
      type: "date",
      position: { x, y: ROW_MILESTONES - 80 },
      data: {
        day: d.day,
        month: d.month,
        isLate: d.isLate,
      },
    });

    edges.push({
      id: `e-${dateId}-${ms.id}`,
      source: dateId,
      target: ms.id,
      targetHandle: "from-date",
      type: "smoothstep",
      style: {
        stroke: `oklch(0.7 0.18 50 / 0.2)`,
        strokeWidth: 1,
        strokeDasharray: "2 4",
      },
    });
  });

  // ── Actions (below milestones) ──

  // Group actions by milestone
  const actionsByMilestone = new Map<string, typeof plan.actions>();

  for (const action of plan.actions) {
    // Match action.milestone to a milestone id or label
    let msId: string | null = null;

    if (action.milestone) {
      const match = plan.milestones.find(
        (m) => m.id === action.milestone || m.label === action.milestone
      );
      if (match) msId = match.id;
    }

    // Fallback: assign to the first milestone
    if (!msId && plan.milestones.length > 0) {
      msId = plan.milestones[0].id;
    }

    if (msId) {
      const existing = actionsByMilestone.get(msId) ?? [];
      existing.push(action);
      actionsByMilestone.set(msId, existing);
    }
  }

  actionsByMilestone.forEach((actions, msId) => {
    const msIndex = plan.milestones.findIndex((m) => m.id === msId);
    if (msIndex === -1) return;

    const baseX = MS_X_START + msIndex * MS_GAP_X - 20;

    actions.forEach((action, j) => {
      const actionColor = colorMap[action.icon] ?? ACCENT;

      nodes.push({
        id: action.id,
        type: "action",
        position: { x: baseX, y: ROW_ACTIONS + j * 280 },
        data: {
          label: action.label,
          description: action.description,
          icon: action.icon,
          frequency: action.frequency,
          target: action.target,
          status: "suggested" as const,
          milestone: action.milestone,
        },
      });

      edges.push({
        id: `e-${msId}-${action.id}`,
        source: msId,
        sourceHandle: "actions",
        target: action.id,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: actionColor,
          strokeWidth: 1.5,
          strokeDasharray: "5 3",
        },
      });
    });
  });

  // ── Sentinel node (summary) ──

  nodes.push({
    id: "sentinel-say",
    type: "sentinel",
    position: { x: SENTINEL_X, y: SENTINEL_Y },
    data: {
      text: plan.summary,
    },
  });

  return { nodes, edges };
}
