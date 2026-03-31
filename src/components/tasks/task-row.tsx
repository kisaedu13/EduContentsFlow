"use client";

import { useState } from "react";
import { Trash2, Plus, CornerDownRight } from "lucide-react";
import { TaskNameCell } from "./task-name-cell";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskAssigneeCell } from "./task-assignee-cell";
import type { TaskStatusKey } from "@/lib/constants";

interface Profile {
  id: string;
  name: string;
}

export interface TaskData {
  id: string;
  name: string;
  status: TaskStatusKey;
  assigneeId: string | null;
  assigneeName: string | null;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  depth: number;
  hasChildren: boolean;
}

interface TaskRowProps {
  task: TaskData;
  profiles: Profile[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (taskId: string, data: Record<string, unknown>) => void;
  onDelete: (taskId: string) => void;
  onAddChild: (parentId: string, name: string) => void;
  onAddSibling: (taskId: string, name: string) => void;
}

export function TaskRow({
  task,
  profiles,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  onAddChild,
  onAddSibling,
}: TaskRowProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <tr
      className="border-b border-border/50 hover:bg-muted/30 group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 업무명 + 왼쪽 액션 버튼 */}
      <td className="py-1 px-2 min-w-[300px]">
        <div className="flex items-center gap-0.5" style={{ paddingLeft: task.depth * 24 }}>
          {/* 액션 버튼 (왼쪽) */}
          <div className={`flex items-center gap-0 flex-shrink-0 ${showActions ? "opacity-100" : "opacity-0"} transition-opacity`}>
            <button
              type="button"
              title="하위 업무 추가"
              onClick={() => onAddChild(task.id, "")}
              className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <CornerDownRight className="size-3.5" />
            </button>
            <button
              type="button"
              title="같은 레벨 추가"
              onClick={() => onAddSibling(task.id, "")}
              className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <Plus className="size-3.5" />
            </button>
            <button
              type="button"
              title="삭제"
              onClick={() => onDelete(task.id)}
              className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>

          {/* 이름 셀 */}
          <TaskNameCell
            name={task.name}
            depth={0}
            hasChildren={task.hasChildren}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
            onNameChange={(name) => onUpdate(task.id, { name })}
          />
        </div>
      </td>

      {/* 상태 */}
      <td className="py-1 px-2 w-[80px]">
        <TaskStatusBadge
          status={task.status}
          onChange={(status) => onUpdate(task.id, { status })}
        />
      </td>

      {/* 담당자 */}
      <td className="py-1 px-2 w-[100px]">
        <TaskAssigneeCell
          assigneeId={task.assigneeId}
          assigneeName={task.assigneeName}
          profiles={profiles}
          onChange={(assigneeId) => onUpdate(task.id, { assigneeId })}
        />
      </td>

      {/* 시작일 */}
      <td className="py-1 px-2 w-[120px]">
        <DateCell
          value={task.startDate}
          onChange={(startDate) => onUpdate(task.id, { startDate })}
        />
      </td>

      {/* 마감일 */}
      <td className="py-1 px-2 w-[120px]">
        <DateCell
          value={task.endDate}
          onChange={(endDate) => onUpdate(task.id, { endDate })}
        />
      </td>

      {/* 진척도 */}
      <td className="py-1 px-2 w-[100px]">
        <ProgressCell
          value={task.progress}
          onChange={(progress) => onUpdate(task.id, { progress })}
        />
      </td>
    </tr>
  );
}

function DateCell({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <input
      type="date"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full bg-transparent text-sm py-0.5 px-1 rounded hover:bg-muted/50 cursor-pointer outline-none focus:border-ring border border-transparent focus:border-input"
    />
  );
}

function ProgressCell({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(String(value));

  function handleSubmit() {
    setEditing(false);
    const num = Math.min(100, Math.max(0, parseInt(temp) || 0));
    if (num !== value) onChange(num);
    setTemp(String(num));
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        min={0}
        max={100}
        value={temp}
        onChange={(e) => setTemp(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") {
            setTemp(String(value));
            setEditing(false);
          }
        }}
        className="w-full rounded border border-input bg-transparent px-1 py-0.5 text-sm outline-none focus:border-ring"
      />
    );
  }

  return (
    <div
      onClick={() => {
        setTemp(String(value));
        setEditing(true);
      }}
      className="flex items-center gap-1.5 cursor-pointer py-0.5 px-1 rounded hover:bg-muted/50"
    >
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{value}%</span>
    </div>
  );
}
