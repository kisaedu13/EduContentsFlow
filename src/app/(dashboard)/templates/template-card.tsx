"use client";

import Link from "next/link";
import { Trash2, Layers } from "lucide-react";
import { useState } from "react";
import { deleteTemplate } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string | null;
    templateTasks: { id: string; name: string }[];
    _count: { projects: number; templateTasks: number };
  };
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const result = await deleteTemplate(template.id);
    if ("error" in result) {
      setError(result.error);
      setDeleting(false);
    } else {
      // revalidatePath in server action handles cache update
    }
  }

  return (
    <div className="group relative rounded-[10px] bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-150 cursor-pointer">
      <Link href={`/templates/${template.id}`} className="absolute inset-0 z-10 rounded-[10px]" />
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent">
              <Layers className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">{template.name}</h3>
              {template.description && (
                <p className="text-[13px] text-muted-foreground mt-0.5 line-clamp-1">{template.description}</p>
              )}
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative z-20 size-8 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                />
              }
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>템플릿 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  &quot;{template.name}&quot; 템플릿을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                  {deleting ? "삭제 중..." : "삭제"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="border-t border-border pt-3 flex items-center justify-between">
          <div className="text-[13px] text-muted-foreground">
            {template._count.templateTasks > 0 ? (
              <>
                <span className="font-medium text-foreground">
                  {template.templateTasks.map((t) => t.name).join(", ")}
                </span>
                {template._count.templateTasks > template.templateTasks.length && (
                  <span> 외 {template._count.templateTasks - template.templateTasks.length}개</span>
                )}
              </>
            ) : (
              <span>업무 없음</span>
            )}
          </div>
          {template._count.projects > 0 && (
            <span className="text-[12px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {template._count.projects}개 프로젝트
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
