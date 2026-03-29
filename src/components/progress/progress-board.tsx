"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Check, AlertCircle } from "lucide-react";
import { updateProgress, advancePhase } from "@/actions/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PROGRESS_STATUS_LABELS,
  PROGRESS_STATUS_COLORS,
} from "@/lib/constants";
import type { ProgressStatus } from "@/generated/prisma/client";

interface Phase {
  id: string;
  name: string;
  sortOrder: number;
}

interface Track {
  id: string;
  name: string;
  phases: Phase[];
}

interface Progress {
  id: string;
  trackId: string;
  trackName: string;
  currentPhaseId: string | null;
  currentPhaseName: string | null;
  status: ProgressStatus;
  note: string | null;
}

interface Part {
  id: string;
  name: string;
  progress: Progress[];
}

interface ProgressBoardProps {
  projectId: string;
  tracks: Track[];
  parts: Part[];
}

const STATUS_CYCLE: ProgressStatus[] = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "BLOCKED"];

export function ProgressBoard({ projectId, tracks, parts }: ProgressBoardProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleAdvance(progressId: string) {
    setUpdating(progressId);
    await advancePhase(projectId, progressId);
    router.refresh();
    setUpdating(null);
  }

  async function handleStatusCycle(progressId: string, currentStatus: ProgressStatus) {
    setUpdating(progressId);
    const currentIdx = STATUS_CYCLE.indexOf(currentStatus);
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    await updateProgress(projectId, { progressId, status: nextStatus });
    router.refresh();
    setUpdating(null);
  }

  async function handlePhaseSelect(progressId: string, phaseId: string | null) {
    setUpdating(progressId);
    await updateProgress(projectId, {
      progressId,
      currentPhaseId: phaseId,
      status: phaseId ? "IN_PROGRESS" : "NOT_STARTED",
    });
    router.refresh();
    setUpdating(null);
  }

  if (parts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        파트를 추가하면 진행 보드가 표시됩니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="sticky left-0 z-10 bg-muted/50 px-4 py-2.5 text-left font-medium min-w-[140px]">
              파트
            </th>
            {tracks.map((track) => (
              <th
                key={track.id}
                className="px-4 py-2.5 text-left font-medium min-w-[200px]"
              >
                {track.name}
                <div className="mt-0.5 text-[10px] font-normal text-muted-foreground">
                  {track.phases.map((p) => p.name).join(" → ")}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr key={part.id} className="border-b last:border-0">
              <td className="sticky left-0 z-10 bg-background px-4 py-2 font-medium">
                {part.name}
              </td>
              {tracks.map((track) => {
                const progress = part.progress.find(
                  (p) => p.trackId === track.id,
                );
                if (!progress) {
                  return (
                    <td key={track.id} className="px-4 py-2 text-muted-foreground">
                      —
                    </td>
                  );
                }

                const isUpdating = updating === progress.id;
                const phases = track.phases;
                const currentPhaseIdx = phases.findIndex(
                  (p) => p.id === progress.currentPhaseId,
                );
                const isCompleted = progress.status === "COMPLETED";
                const isBlocked = progress.status === "BLOCKED";

                return (
                  <td key={track.id} className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {/* 단계 파이프라인 */}
                      <div className="flex items-center gap-0.5">
                        {phases.map((phase, idx) => {
                          const isCurrent = phase.id === progress.currentPhaseId;
                          const isPast = currentPhaseIdx >= 0 && idx < currentPhaseIdx;
                          const isDone = isCompleted;

                          return (
                            <button
                              key={phase.id}
                              disabled={isUpdating}
                              onClick={() =>
                                handlePhaseSelect(
                                  progress.id,
                                  isCurrent ? null : phase.id,
                                )
                              }
                              className={cn(
                                "relative h-7 min-w-[56px] px-1.5 text-[10px] leading-tight transition-colors rounded",
                                "border hover:border-primary/50",
                                isDone && "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300",
                                isCurrent && !isDone && !isBlocked && "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-300",
                                isCurrent && isBlocked && "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300",
                                isPast && !isDone && "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400",
                                !isCurrent && !isPast && !isDone && "bg-muted/30 border-border text-muted-foreground",
                                isUpdating && "opacity-50",
                              )}
                              title={`${phase.name}${isCurrent ? " (현재)" : ""}`}
                            >
                              {phase.name}
                            </button>
                          );
                        })}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex items-center gap-1">
                        {!isCompleted && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            disabled={isUpdating}
                            onClick={() => handleAdvance(progress.id)}
                            title="다음 단계로"
                          >
                            <ChevronRight className="size-3.5" />
                          </Button>
                        )}
                        <button
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusCycle(progress.id, progress.status)
                          }
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full transition-colors",
                            PROGRESS_STATUS_COLORS[progress.status],
                            isUpdating && "opacity-50",
                          )}
                          title={`상태: ${PROGRESS_STATUS_LABELS[progress.status]} (클릭하여 변경)`}
                        >
                          {isCompleted && <Check className="size-3" />}
                          {isBlocked && <AlertCircle className="size-3" />}
                        </button>
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
