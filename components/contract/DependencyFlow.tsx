'use client'

import { useCallback } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  NodeProps,
  Handle,
  Position,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { cn } from '@/lib/utils'

type MilestoneStatus = 'done' | 'active' | 'locked'

interface MilestoneNodeData {
  label: string
  status: MilestoneStatus
  [key: string]: unknown
}

function MilestoneNode({ data }: NodeProps) {
  const d = data as MilestoneNodeData
  const statusStyle = {
    done: 'border-emerald/60 bg-emerald/8 text-emerald',
    active: 'border-accent/60 bg-accent/8 text-accent animate-pulse-border',
    locked: 'border-border bg-card text-muted-foreground opacity-40',
  }[d.status]

  return (
    <div
      className={cn(
        'w-[64px] h-[44px] rounded-lg border flex flex-col items-center justify-center gap-0.5',
        statusStyle
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0 !size-0" />
      <p className="text-[9px] font-medium uppercase tracking-wider leading-none">{d.label.split(' ')[0]}</p>
      <p className="text-[8px] text-current/60 leading-none truncate px-1 max-w-full">
        {d.label.split(' ').slice(1).join(' ')}
      </p>
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !size-0" />
    </div>
  )
}

const nodeTypes = { milestone: MilestoneNode }

interface DependencyFlowProps {
  milestones: Array<{ id: string; label: string; status: MilestoneStatus }>
}

export function DependencyFlow({ milestones }: DependencyFlowProps) {
  const nodes: Node[] = milestones.map((m, i) => ({
    id: m.id,
    type: 'milestone',
    position: { x: i * 90, y: 0 },
    data: { label: m.label, status: m.status },
    draggable: false,
  }))

  const edges: Edge[] = milestones.slice(1).map((m, i) => ({
    id: `e${i}`,
    source: milestones[i].id,
    target: m.id,
    type: 'smoothstep',
    animated: milestones[i].status === 'done' && m.status === 'active',
    style: {
      stroke: milestones[i].status === 'done'
        ? 'oklch(0.72 0.17 162 / 60%)'
        : 'oklch(1 0 0 / 15%)',
      strokeWidth: 1,
    },
  }))

  const [ns] = useNodesState(nodes)
  const [es] = useEdgesState(edges)

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={ns}
        edges={es}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        nodesDraggable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background color="transparent" />
      </ReactFlow>
    </div>
  )
}
