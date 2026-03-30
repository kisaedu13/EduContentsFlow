"use client";

import { useState } from "react";
import { Plus, X, ChevronRight, ChevronDown, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { replaceProjectTasks } from "@/actions/tasks";

interface TaskItem {
  name: string;
  children: TaskItem[];
}

interface ProjectTaskEditorProps {
  projectId: string;
  initialTasks: TaskItem[];
}

export function ProjectTaskEditor({ projectId, initialTasks }: ProjectTaskEditorProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(
    initialTasks.length > 0 ? initialTasks : [{ name: "", children: [] }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type FlatItem = { path: number[]; item: TaskItem; depth: number; hasChildren: boolean };

  function flattenTasks(items: TaskItem[], parentPath: number[] = []): FlatItem[] {
    const result: FlatItem[] = [];
    items.forEach((item, idx) => {
      const path = [...parentPath, idx];
      result.push({ path, item, depth: parentPath.length, hasChildren: item.children.length > 0 });
      result.push(...flattenTasks(item.children, path));
    });
    return result;
  }

  function updateTasks(path: number[], updater: (items: TaskItem[]) => TaskItem[]): void {
    function recurse(items: TaskItem[], remainingPath: number[]): TaskItem[] {
      if (remainingPath.length === 0) return updater(items);
      const [head, ...rest] = remainingPath;
      return items.map((item, i) =>
        i === head ? { ...item, children: recurse(item.children, rest) } : item,
      );
    }
    setTasks(recurse(tasks, path));
  }

  function updateName(path: number[], value: string) {
    const parentPath = path.slice(0, -1);
    const idx = path[path.length - 1];
    updateTasks(parentPath, (items) =>
      items.map((item, i) => (i === idx ? { ...item, name: value } : item)),
    );
  }

  function addSibling(path: number[]) {
    const parentPath = path.slice(0, -1);
    const idx = path[path.length - 1];
    updateTasks(parentPath, (items) => {
      const copy = [...items];
      copy.splice(idx + 1, 0, { name: "", children: [] });
      return copy;
    });
  }

  function addChild(path: number[]) {
    const parentPath = path.slice(0, -1);
    const idx = path[path.length - 1];
    updateTasks(parentPath, (items) =>
      items.map((item, i) =>
        i === idx ? { ...item, children: [...item.children, { name: "", children: [] }] } : item,
      ),
    );
  }

  function removeItem(path: number[]) {
    const parentPath = path.slice(0, -1);
    const idx = path[path.length - 1];
    updateTasks(parentPath, (items) => {
      if (items.length <= 1 && parentPath.length === 0) return items;
      return items.filter((_, i) => i !== idx);
    });
  }

  function addRootTask() {
    setTasks([...tasks, { name: "", children: [] }]);
  }

  async function handleSave() {
    setError(null);
    setSaving(true);

    const result = await replaceProjectTasks(projectId, tasks);

    if ("error" in result) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSaving(false);
  }

  const flatList = flattenTasks(tasks);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          업무 구조를 편집하면 기존 업무의 상태/담당자 등은 초기화됩니다.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addRootTask}>
          <Plus className="size-4" />
          업무 추가
        </Button>
      </div>

      <div className="rounded-lg border">
        <div className="border-b bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
          업무명
        </div>
        <div className="divide-y">
          {flatList.map(({ path, item, depth, hasChildren }) => {
            const key = path.join("-");
            return (
              <div
                key={key}
                className="flex items-center gap-1 px-2 py-1.5 hover:bg-muted/30 group"
              >
                <div className="flex items-center gap-1 flex-1 min-w-0" style={{ paddingLeft: depth * 24 }}>
                  {hasChildren ? (
                    <ChevronDown className="size-4 text-muted-foreground flex-shrink-0" />
                  ) : depth > 0 ? (
                    <span className="w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground flex-shrink-0 opacity-30" />
                  )}
                  <Input
                    value={item.name}
                    onChange={(e) => updateName(path, e.target.value)}
                    placeholder={depth === 0 ? "업무 이름" : "하위 업무 이름"}
                    className="h-7 text-sm"
                  />
                </div>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    type="button"
                    title="하위 업무 추가"
                    onClick={() => addChild(path)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <CornerDownRight className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    title="같은 레벨 추가"
                    onClick={() => addSibling(path)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    title="삭제"
                    onClick={() => removeItem(path)}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "저장 중..." : "업무 구조 저장"}
      </Button>
    </div>
  );
}
