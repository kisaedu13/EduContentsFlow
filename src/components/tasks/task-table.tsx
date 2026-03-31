"use client";

import { useState, useCallback, useTransition } from "react";
import { Plus } from "lucide-react";
import { TaskRow, type TaskData } from "./task-row";
import { AddTaskRow } from "./add-task-row";
import { createTask, updateTask, deleteTask } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { TaskStatusKey } from "@/lib/constants";

interface RawTask {
  id: string;
  parentId: string | null;
  name: string;
  status: string;
  assigneeId: string | null;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  depth: number;
  sortOrder: number;
  assignee: { name: string } | null;
}

interface Profile {
  id: string;
  name: string;
}

interface TaskTableProps {
  projectId: string;
  tasks: RawTask[];
  profiles: Profile[];
}

function buildFlatList(tasks: RawTask[]): RawTask[] {
  const childrenMap = new Map<string | null, RawTask[]>();
  for (const t of tasks) {
    const key = t.parentId;
    if (!childrenMap.has(key)) childrenMap.set(key, []);
    childrenMap.get(key)!.push(t);
  }
  for (const arr of childrenMap.values()) {
    arr.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const result: RawTask[] = [];
  function dfs(parentId: string | null) {
    const children = childrenMap.get(parentId) || [];
    for (const child of children) {
      result.push(child);
      dfs(child.id);
    }
  }
  dfs(null);
  return result;
}

function hasChildTasks(taskId: string, allTasks: RawTask[]): boolean {
  return allTasks.some((t) => t.parentId === taskId);
}

let tempIdCounter = 0;

export function TaskTable({ projectId, tasks: serverTasks, profiles }: TaskTableProps) {
  const [, startTransition] = useTransition();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<RawTask[]>(serverTasks);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(serverTasks.map((t) => t.id)));
  const [addingChildFor, setAddingChildFor] = useState<string | null>(null);

  // 서버 데이터가 변경되면 동기화
  if (serverTasks !== tasks && serverTasks.length !== tasks.length) {
    // 서버에서 새 데이터가 왔을 때만 (길이가 다를 때)
  }

  const flatList = buildFlatList(tasks);

  const visibleTasks = flatList.filter((task) => {
    let current = task.parentId;
    while (current) {
      if (!expandedIds.has(current)) return false;
      const parent = tasks.find((t) => t.id === current);
      current = parent?.parentId ?? null;
    }
    return true;
  });

  const toggleExpand = useCallback((taskId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  function handleUpdate(taskId: string, data: Record<string, unknown>) {
    // 낙관적 업데이트
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updated = { ...t };
        if (data.name !== undefined) updated.name = data.name as string;
        if (data.status !== undefined) updated.status = data.status as string;
        if (data.assigneeId !== undefined) {
          updated.assigneeId = data.assigneeId as string | null;
          const profile = profiles.find((p) => p.id === data.assigneeId);
          updated.assignee = profile ? { name: profile.name } : null;
        }
        if (data.startDate !== undefined) updated.startDate = data.startDate as string | null;
        if (data.endDate !== undefined) updated.endDate = data.endDate as string | null;
        if (data.progress !== undefined) updated.progress = data.progress as number;
        return updated;
      }),
    );
    // 백그라운드 서버 호출
    startTransition(async () => {
      await updateTask(taskId, data);
      if (data.status) showToast("상태가 변경되었습니다");
    });
  }

  function handleDelete(taskId: string) {
    // 낙관적: 해당 태스크 + 모든 하위 삭제
    const toDelete = new Set<string>();
    function collectDescendants(id: string) {
      toDelete.add(id);
      tasks.filter((t) => t.parentId === id).forEach((t) => collectDescendants(t.id));
    }
    collectDescendants(taskId);
    setTasks((prev) => prev.filter((t) => !toDelete.has(t.id)));

    startTransition(async () => {
      await deleteTask(taskId);
      showToast("업무가 삭제되었습니다");
    });
  }

  function handleAddRoot(name: string) {
    const tempId = `temp-${++tempIdCounter}`;
    const maxSort = tasks.filter((t) => t.parentId === null).reduce((max, t) => Math.max(max, t.sortOrder), -1);
    setTasks((prev) => [
      ...prev,
      { id: tempId, parentId: null, name, status: "WAITING", assigneeId: null, startDate: null, endDate: null, progress: 0, depth: 0, sortOrder: maxSort + 1, assignee: null },
    ]);
    startTransition(async () => {
      const result = await createTask({ projectId, name, parentId: null });
      if ("success" in result) {
        setTasks((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: result.data.id } : t)));
      }
    });
  }

  function handleAddChild(parentId: string, name: string) {
    if (!name) {
      setAddingChildFor(parentId);
      setExpandedIds((prev) => new Set(prev).add(parentId));
      return;
    }
    const parent = tasks.find((t) => t.id === parentId);
    const tempId = `temp-${++tempIdCounter}`;
    const siblings = tasks.filter((t) => t.parentId === parentId);
    const maxSort = siblings.reduce((max, t) => Math.max(max, t.sortOrder), -1);
    setTasks((prev) => [
      ...prev,
      { id: tempId, parentId, name, status: "WAITING", assigneeId: null, startDate: null, endDate: null, progress: 0, depth: (parent?.depth ?? 0) + 1, sortOrder: maxSort + 1, assignee: null },
    ]);
    setExpandedIds((prev) => new Set(prev).add(parentId));
    startTransition(async () => {
      const result = await createTask({ projectId, name, parentId });
      if ("success" in result) {
        setTasks((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: result.data.id } : t)));
      }
    });
  }

  function handleAddChildSubmit(parentId: string, name: string) {
    setAddingChildFor(null);
    if (name) handleAddChild(parentId, name);
  }

  function handleAddSibling(taskId: string, name: string) {
    const task = tasks.find((t) => t.id === taskId);
    const parentId = task?.parentId ?? null;
    const newName = name || "새 업무";
    const tempId = `temp-${++tempIdCounter}`;
    const siblings = tasks.filter((t) => t.parentId === parentId);
    const maxSort = siblings.reduce((max, t) => Math.max(max, t.sortOrder), -1);
    setTasks((prev) => [
      ...prev,
      { id: tempId, parentId, name: newName, status: "WAITING", assigneeId: null, startDate: null, endDate: null, progress: 0, depth: task?.depth ?? 0, sortOrder: maxSort + 1, assignee: null },
    ]);
    startTransition(async () => {
      const result = await createTask({ projectId, name: newName, parentId });
      if ("success" in result) {
        setTasks((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: result.data.id } : t)));
      }
    });
  }

  const taskDataList = visibleTasks.map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status as TaskStatusKey,
    assigneeId: t.assigneeId,
    assigneeName: t.assignee?.name ?? null,
    startDate: t.startDate,
    endDate: t.endDate,
    progress: t.progress,
    depth: t.depth,
    hasChildren: hasChildTasks(t.id, tasks),
  }));

  const [addingRoot, setAddingRoot] = useState(false);

  return (
    <div className="space-y-2">
      {/* 상단 업무 추가 */}
      <div className="flex justify-end">
        {addingRoot ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              placeholder="업무 이름 입력..."
              className="h-8 rounded-md border border-input bg-transparent px-2.5 text-sm outline-none focus:border-ring"
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v) handleAddRoot(v);
                setAddingRoot(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (v) handleAddRoot(v);
                  setAddingRoot(false);
                }
                if (e.key === "Escape") setAddingRoot(false);
              }}
            />
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setAddingRoot(true)}>
            <Plus className="size-4" />
            업무 추가
          </Button>
        )}
      </div>

      <div className="border border-[#E4E4E7] rounded-[10px] overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAFAFA] sticky top-0 z-10">
              <th className="text-left p-[10px_16px] text-[13px] font-medium text-[#71717A]">업무명</th>
              <th className="text-left p-[10px_16px] text-[13px] font-medium text-[#71717A] w-[100px]">상태</th>
              <th className="text-left p-[10px_16px] text-[13px] font-medium text-[#71717A] w-[100px]">담당자</th>
              <th className="text-left p-[10px_16px] text-[13px] font-medium text-[#71717A] w-[120px]">시작일</th>
              <th className="text-left p-[10px_16px] text-[13px] font-medium text-[#71717A] w-[120px]">마감일</th>
              <th className="text-left p-[10px_16px] text-[13px] font-medium text-[#71717A] w-[100px]">진척도</th>
            </tr>
          </thead>
          <tbody>
            {taskDataList.map((task) => (
              <TaskRowWithChild
                key={task.id}
                task={task}
                profiles={profiles}
                isExpanded={expandedIds.has(task.id)}
                onToggleExpand={() => toggleExpand(task.id)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
                onAddSibling={handleAddSibling}
                addingChildFor={addingChildFor}
                onAddChildSubmit={handleAddChildSubmit}
              />
            ))}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-xl bg-muted">
              <Plus className="size-7 text-muted-foreground" />
            </div>
            <p className="font-medium">업무가 없습니다</p>
            <p className="mt-1 text-muted-foreground">
              오른쪽 위 &quot;업무 추가&quot; 버튼으로 시작하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskRowWithChild({
  task,
  profiles,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  onAddChild,
  onAddSibling,
  addingChildFor,
  onAddChildSubmit,
}: {
  task: TaskData & { id: string };
  profiles: { id: string; name: string }[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (taskId: string, data: Record<string, unknown>) => void;
  onDelete: (taskId: string) => void;
  onAddChild: (parentId: string, name: string) => void;
  onAddSibling: (taskId: string, name: string) => void;
  addingChildFor: string | null;
  onAddChildSubmit: (parentId: string, name: string) => void;
}) {
  return (
    <>
      <TaskRow
        task={task}
        profiles={profiles}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddChild={onAddChild}
        onAddSibling={onAddSibling}
      />
      {addingChildFor === task.id && (
        <tr className="border-b border-[#F4F4F5]">
          <td colSpan={6} className="p-[8px_16px]">
            <div style={{ paddingLeft: (task.depth + 1) * 24 + 24 }}>
              <input
                autoFocus
                type="text"
                placeholder="하위 업무명 입력 후 Enter..."
                className="w-full max-w-[300px] px-2 py-1 rounded border border-[#E4E4E7] text-[14px] outline-none focus:border-[#4F46E5] focus:ring-[3px] focus:ring-[#4F46E5]/10 transition-all"
                onBlur={(e) => {
                  onAddChildSubmit(task.id, e.target.value.trim());
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onAddChildSubmit(task.id, (e.target as HTMLInputElement).value.trim());
                  }
                  if (e.key === "Escape") {
                    onAddChildSubmit(task.id, "");
                  }
                }}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
