"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteTemplate } from "@/actions/templates";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const router = useRouter();
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
      router.refresh();
    }
  }

  return (
    <Card className="group relative">
      <Link href={`/templates/${template.id}`} className="absolute inset-0 z-0" />
      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{template.name}</CardTitle>
            {template.description && (
              <CardDescription className="mt-1">
                {template.description}
              </CardDescription>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 opacity-0 group-hover:opacity-100"
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
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-xs text-muted-foreground">
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
          <p className="mt-2 text-xs text-muted-foreground">
            {template._count.projects}개 프로젝트에서 사용 중
          </p>
        )}
      </CardContent>
    </Card>
  );
}
