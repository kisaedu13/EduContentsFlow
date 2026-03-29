"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { addPart, removePart } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  PROGRESS_STATUS_LABELS,
  PROGRESS_STATUS_COLORS,
  DISCIPLINE_LABELS,
} from "@/lib/constants";
import type { ProgressStatus, Discipline } from "@/generated/prisma/client";

interface PartData {
  id: string;
  name: string;
  sortOrder: number;
  hasPt: boolean;
  hasVideo: boolean;
  designDuration: number | null;
  finalDuration: number | null;
  progress: {
    trackName: string;
    phaseName: string | null;
    status: ProgressStatus;
  }[];
  assignments: {
    name: string;
    discipline: Discipline;
  }[];
}

interface PartListProps {
  projectId: string;
  parts: PartData[];
  isAdmin: boolean;
}

export function PartList({ projectId, parts, isAdmin }: PartListProps) {
  const router = useRouter();
  const [newPartName, setNewPartName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddPart(e: React.FormEvent) {
    e.preventDefault();
    if (!newPartName.trim()) return;
    setAdding(true);
    setError(null);

    const result = await addPart(projectId, {
      name: newPartName.trim(),
      sortOrder: parts.length,
    });

    if ("error" in result) {
      setError(result.error);
    } else {
      setNewPartName("");
      router.refresh();
    }
    setAdding(false);
  }

  async function handleRemovePart(partId: string) {
    const result = await removePart(projectId, partId);
    if ("error" in result) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">파트 목록 ({parts.length}개)</h3>
      </div>

      {parts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          아직 파트가 없습니다. {isAdmin && "아래에서 파트를 추가하세요."}
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">#</th>
                <th className="px-4 py-2 text-left font-medium">파트명</th>
                <th className="px-4 py-2 text-left font-medium">진행 상태</th>
                <th className="px-4 py-2 text-left font-medium">담당자</th>
                {isAdmin && <th className="px-4 py-2 w-10" />}
              </tr>
            </thead>
            <tbody>
              {parts.map((part, idx) => (
                <tr key={part.id} className="border-b last:border-0">
                  <td className="px-4 py-2 text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-2 font-medium">{part.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {part.progress.map((p) => (
                        <span
                          key={p.trackName}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                            PROGRESS_STATUS_COLORS[p.status],
                          )}
                        >
                          {p.trackName}
                          {p.phaseName && `: ${p.phaseName}`}
                          {!p.phaseName && `: ${PROGRESS_STATUS_LABELS[p.status]}`}
                        </span>
                      ))}
                      {part.progress.length === 0 && (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {part.assignments.map((a, i) => (
                        <span
                          key={i}
                          className="rounded bg-muted px-1.5 py-0.5 text-xs"
                        >
                          {a.name} ({DISCIPLINE_LABELS[a.discipline]})
                        </span>
                      ))}
                      {part.assignments.length === 0 && (
                        <span className="text-xs text-muted-foreground">미배정</span>
                      )}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => handleRemovePart(part.id)}
                      >
                        <Trash2 className="size-3.5 text-muted-foreground" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && (
        <form onSubmit={handleAddPart} className="flex gap-2">
          <Input
            value={newPartName}
            onChange={(e) => setNewPartName(e.target.value)}
            placeholder="새 파트 이름 (예: 1차시 산업안전개론)"
            className="max-w-sm"
          />
          <Button type="submit" variant="outline" size="sm" disabled={adding}>
            <Plus className="size-4" />
            {adding ? "추가 중..." : "파트 추가"}
          </Button>
        </form>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
