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
      className="group hover:bg-[#FAFAFE] transition-colors duration-150"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 업무명 + 액션 버튼 */}
      <td className="p-[12px_16px] border-b border-[#F4F4F5] text-[14px] min-w-[300px]">
        <div className="flex items-center" style={{ paddingLeft: task.depth * 24 }}>
          {/* 이름 셀 */}
          <TaskNameCell
            name={task.name}
            depth={0}
            hasChildren={task.hasChildren}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
            onNameChange={(name) => onUpdate(task.id, { name })}
          />

          {/* 액션 버튼 (업무명 뒤, hover 시 표시) */}
          <div className={`flex items-center gap-1 ml-2 flex-shrink-0 ${showActions ? "opacity-100" : "opacity-0"} transition-opacity duration-150`}>
            <button
              type="button"
              title="하위 업무 추가"
              onClick={() => onAddChild(task.id, "")}
              className="size-6 rounded flex items-center justify-center text-[#A1A1AA] hover:bg-[#F4F4F5] hover:text-[#18181B] transition-all duration-150"
            >
              <CornerDownRight className="size-[14px]" />
            </button>
            <button
              type="button"
              title="같은 레벨 추가"
              onClick={() => onAddSibling(task.id, "")}
              className="size-6 rounded flex items-center justify-center text-[#A1A1AA] hover:bg-[#F4F4F5] hover:text-[#18181B] transition-all duration-150"
            >
              <Plus className="size-[14px]" />
            </button>
            <button
              type="button"
              title="삭제"
              onClick={() => onDelete(task.id)}
              className="size-6 rounded flex items-center justify-center text-[#A1A1AA] hover:bg-red-50 hover:text-red-600 transition-all duration-150"
            >
              <Trash2 className="size-[14px]" />
            </button>
          </div>
        </div>
      </td>

      {/* 상태 */}
      <td className="p-[12px_16px] border-b border-[#F4F4F5] text-[14px] w-[100px]">
        <TaskStatusBadge
          status={task.status}
          onChange={(status) => onUpdate(task.id, { status })}
        />
      </td>

      {/* 담당자 */}
      <td className="p-[12px_16px] border-b border-[#F4F4F5] text-[14px] w-[100px]">
        <TaskAssigneeCell
          assigneeId={task.assigneeId}
          assigneeName={task.assigneeName}
          profiles={profiles}
          onChange={(assigneeId) => onUpdate(task.id, { assigneeId })}
        />
      </td>

      {/* 시작일 */}
      <td className="p-[12px_16px] border-b border-[#F4F4F5] text-[14px] w-[120px]">
        <DateCell
          value={task.startDate}
          onChange={(startDate) => onUpdate(task.id, { startDate })}
        />
      </td>

      {/* 마감일 */}
      <td className="p-[12px_16px] border-b border-[#F4F4F5] text-[14px] w-[120px]">
        <DateCell
          value={task.endDate}
          onChange={(endDate) => onUpdate(task.id, { endDate })}
        />
      </td>

      {/* 진척도 */}
      <td className="p-[12px_16px] border-b border-[#F4F4F5] text-[14px] w-[100px]">
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
      className="w-full bg-transparent py-0.5 px-1 rounded hover:bg-muted/50 cursor-pointer outline-none focus:border-ring border border-transparent focus:border-input"
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
      className="flex items-center gap-2 cursor-pointer py-0.5 px-1 rounded hover:bg-[#F4F4F5] justify-end"
    >
      <div className="w-[60px] h-[3px] rounded-full bg-[#F4F4F5] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${value >= 100 ? "bg-[#10B981]" : "bg-[#4F46E5]"}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[12px] text-[#A1A1AA] w-7 text-right whitespace-nowrap">{value}%</span>
    </div>
  );
}
