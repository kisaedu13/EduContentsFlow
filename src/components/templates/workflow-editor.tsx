"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ChevronRight, ChevronDown, CornerDownRight } from "lucide-react";
import { createTemplate, updateTemplate } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TaskItem {
  name: string;
  children: TaskItem[];
}

interface WorkflowEditorProps {
  templateId?: string;
  initialData?: {
    name: string;
    description: string | null;
    tasks: TaskItem[];
  };
}

export function WorkflowEditor({ templateId, initialData }: WorkflowEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [tasks, setTasks] = useState<TaskItem[]>(
    initialData?.tasks ?? [{ name: "", children: [] }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 재귀적으로 플랫 리스트 만들기 (렌더링용)
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

  function getItem(path: number[]): TaskItem {
    let current: TaskItem[] = tasks;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]].children;
    }
    return current[path[path.length - 1]];
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
      if (items.length <= 1 && parentPath.length === 0) return items; // 최소 1개 유지
      return items.filter((_, i) => i !== idx);
    });
  }

  function addRootTask() {
    setTasks([...tasks, { name: "", children: [] }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = { name, description: description || undefined, tasks };

    const result = templateId
      ? await updateTemplate(templateId, payload)
      : await createTemplate(payload);

    if ("error" in result) {
      setError(result.error);
      setSaving(false);
      return;
    }

    router.push("/templates");
  }

  const flatList = flattenTasks(tasks);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기본 정보 */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">템플릿 이름</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 안전보건교육 콘텐츠"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">설명 (선택)</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이 템플릿에 대한 간단한 설명"
            rows={2}
          />
        </div>
      </div>

      {/* 업무 구조 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>업무 구조</Label>
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
                      required
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
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "저장 중..." : templateId ? "수정" : "생성"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  );
}
