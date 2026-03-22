"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { GripVerticalIcon, PlusIcon, TrashIcon, SparklesIcon, PencilIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Milestone = {
  id: string;
  name: string;
  value: number;
  deadline: string;
  deliverables: string;
};

const initialMilestones: Milestone[] = [
  { id: "m1", name: "Design System",        value: 800,  deadline: "2026-04-01", deliverables: "Figma file, component library, style guide" },
  { id: "m2", name: "Frontend Development", value: 1200, deadline: "2026-04-15", deliverables: "React app, responsive layout, API integration" },
  { id: "m3", name: "Backend & API",        value: 800,  deadline: "2026-04-28", deliverables: "REST API, database schema, auth system" },
  { id: "m4", name: "Deploy & Launch",      value: 1000, deadline: "2026-05-10", deliverables: "CI/CD pipeline, production deploy, monitoring" },
];

const PALETTE = [
  { text: "text-accent",                dot: "bg-accent",                strip: "bg-accent" },
  { text: "text-emerald",               dot: "bg-emerald",               strip: "bg-emerald" },
  { text: "text-[oklch(0.65_0.14_70)]", dot: "bg-[oklch(0.65_0.14_70)]", strip: "bg-[oklch(0.65_0.14_70)]" },
  { text: "text-[oklch(0.55_0.10_90)]", dot: "bg-[oklch(0.55_0.10_90)]", strip: "bg-[oklch(0.55_0.10_90)]" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(iso: string) {
  if (!iso) return { day: "—", mon: "" };
  const parts = iso.split("-");
  return { day: parts[2], mon: MONTHS[parseInt(parts[1]) - 1] ?? "" };
}

// ── Inline edit ──────────────────────────────────────────────────────────────

function InlineEdit({ value, onSave, className }: {
  value: string; onSave: (v: string) => void; className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.select(); }, [editing]);

  const commit = () => { setEditing(false); if (draft !== value) onSave(draft); };

  if (!editing) return (
    <span
      onClick={() => { setEditing(true); setDraft(value); }}
      className={cn("group/e inline-flex cursor-text items-center gap-1", className)}
    >
      {value}
      <PencilIcon className="size-2 opacity-0 group-hover/e:opacity-25 transition-opacity" />
    </span>
  );

  return (
    <input ref={ref} value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") { setEditing(false); setDraft(value); }
      }}
      className={cn("border-b border-accent bg-transparent outline-none pb-px w-full", className)}
    />
  );
}

// ── Allocation bar ────────────────────────────────────────────────────────────

function AllocationBar({ milestones }: { milestones: Milestone[] }) {
  const total = milestones.reduce((s, m) => s + m.value, 0);
  if (!total) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-px flex-1 overflow-hidden">
        {milestones.map((m, i) => (
          <div key={m.id}
            className={cn("h-full transition-all", PALETTE[i % PALETTE.length].strip)}
            style={{ width: `${(m.value / total) * 100}%` }}
          />
        ))}
      </div>
      <span className="font-mono text-xs font-semibold text-foreground shrink-0">${total}</span>
    </div>
  );
}

// ── Sortable row ──────────────────────────────────────────────────────────────

function MilestoneRow({ milestone, colorIndex, onUpdate, onRemove, isDragOverlay }: {
  milestone: Milestone;
  colorIndex: number;
  onUpdate: (id: string, field: keyof Milestone, value: string | number) => void;
  onRemove: (id: string) => void;
  isDragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: milestone.id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const p = PALETTE[colorIndex % PALETTE.length];
  const { day, mon } = fmtDate(milestone.deadline);

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        "group",
        isDragging && "pointer-events-none opacity-20",
        isDragOverlay && "bg-card shadow-2xl shadow-black/40"
      )}
    >
      {/* Drag */}
      <TableCell className="w-8 px-2">
        <button type="button" {...attributes} {...listeners}
          className="flex cursor-grab active:cursor-grabbing text-muted-foreground/20 hover:text-muted-foreground/60 transition-colors">
          <GripVerticalIcon className="size-3.5" />
        </button>
      </TableCell>

      {/* Milestone */}
      <TableCell className="py-3">
        <div className="flex items-start gap-2.5">
          <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", p.dot)} />
          <div className="flex flex-col gap-0.5 min-w-0">
            <InlineEdit
              value={milestone.name}
              onSave={v => onUpdate(milestone.id, "name", v)}
              className="text-sm font-semibold text-foreground"
            />
            <InlineEdit
              value={milestone.deliverables}
              onSave={v => onUpdate(milestone.id, "deliverables", v)}
              className="text-xs text-muted-foreground/80"
            />
          </div>
        </div>
      </TableCell>

      {/* Due */}
      <TableCell className="w-[110px] text-center py-3">
        <div className="flex flex-col items-center">
          <span className={cn("font-mono text-2xl font-black leading-none tabular-nums", p.text)}>
            {day}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mt-0.5">
            {mon}
          </span>
        </div>
      </TableCell>

      {/* Value */}
      <TableCell className="w-[110px] text-center py-3">
        <div className="flex flex-col items-center">
          <InlineEdit
            value={`$${milestone.value}`}
            onSave={v => {
              const n = parseInt(v.replace(/[^0-9]/g, ""));
              if (!isNaN(n)) onUpdate(milestone.id, "value", n);
            }}
            className={cn("font-mono text-lg font-bold", p.text)}
          />
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground/30 mt-0.5">
            escrow
          </span>
        </div>
      </TableCell>

      {/* Delete */}
      <TableCell className="w-8 px-2">
        <button type="button" onClick={() => onRemove(milestone.id)}
          className="text-muted-foreground/0 group-hover:text-muted-foreground/25 hover:!text-destructive transition-colors">
          <TrashIcon className="size-3.5" />
        </button>
      </TableCell>
    </TableRow>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export function MilestoneBuilder() {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [activeId, setActiveId]     = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const activeMilestone = useMemo(
    () => milestones.find(m => m.id === activeId) ?? null,
    [milestones, activeId]
  );

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setMilestones(prev => {
      const oi = prev.findIndex(m => m.id === active.id);
      const ni = prev.findIndex(m => m.id === over.id);
      return arrayMove(prev, oi, ni);
    });
  };

  const handleUpdate = (id: string, field: keyof Milestone, value: string | number) =>
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));

  const handleRemove = (id: string) =>
    setMilestones(prev => prev.filter(m => m.id !== id));

  const handleAdd = () =>
    setMilestones(prev => [...prev, {
      id: `m${Date.now()}`, name: "New Milestone", value: 0, deadline: "", deliverables: "To be defined"
    }]);

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/40">
          <SparklesIcon className="size-3 text-accent" />
          AI-parsed · click to edit
        </span>
        <AllocationBar milestones={milestones} />
      </div>

      {/* Table */}
      <div className="rounded-md border border-border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={milestones.map(m => m.id)} strategy={verticalListSortingStrategy}>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-8" />
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium">
                    Milestone
                  </TableHead>
                  <TableHead className="w-[110px] text-center text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium">
                    Due
                  </TableHead>
                  <TableHead className="w-[110px] text-center text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium">
                    Value
                  </TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {milestones.map((m, i) => (
                  <MilestoneRow key={m.id} milestone={m} colorIndex={i}
                    onUpdate={handleUpdate} onRemove={handleRemove} />
                ))}
              </TableBody>
            </Table>
          </SortableContext>

          {typeof window !== "undefined" && createPortal(
            <DragOverlay>
              {activeMilestone && (
                <table className="w-full">
                  <tbody>
                    <MilestoneRow
                      milestone={activeMilestone}
                      colorIndex={milestones.indexOf(activeMilestone)}
                      onUpdate={() => {}} onRemove={() => {}} isDragOverlay
                    />
                  </tbody>
                </table>
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>

      {/* Add */}
      <button type="button" onClick={handleAdd}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground/25 hover:text-accent transition-colors">
        <PlusIcon className="size-3" />
        Add milestone
      </button>
    </div>
  );
}
