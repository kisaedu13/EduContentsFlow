"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProject } from "@/actions/projects";
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

interface ProjectDeleteButtonProps {
  projectId: string;
  projectName: string;
}

export function ProjectDeleteButton({ projectId, projectName }: ProjectDeleteButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteProject(projectId);
    if ("error" in result) {
      setDeleting(false);
      return;
    }
    router.push("/projects");
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={
        <Button variant="destructive" size="sm" disabled={deleting} />
      }>
        <Trash2 className="size-4" />
        {deleting ? "삭제 중..." : "프로젝트 삭제"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            &quot;{projectName}&quot; 프로젝트를 삭제하시겠습니까? 모든 업무와 공지사항이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
