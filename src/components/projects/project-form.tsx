"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject, updateProject } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectStatus } from "@/generated/prisma/client";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";

interface Template {
  id: string;
  name: string;
  tracks: {
    name: string;
    phases: { name: string }[];
  }[];
}

interface ProjectFormProps {
  templates: Template[];
  projectId?: string;
  initialData?: {
    name: string;
    description: string | null;
    status: ProjectStatus;
    startDate: string | null;
    endDate: string | null;
  };
}

export function ProjectForm({ templates, projectId, initialData }: ProjectFormProps) {
  const router = useRouter();
  const isEdit = !!projectId;

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [templateId, setTemplateId] = useState("");
  const [status, setStatus] = useState<ProjectStatus>(initialData?.status ?? "PREPARING");
  const [startDate, setStartDate] = useState(initialData?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialData?.endDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = templates.find((t) => t.id === templateId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const result = isEdit
      ? await updateProject(projectId!, {
          name,
          description: description || undefined,
          status,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        })
      : await createProject({
          name,
          description: description || undefined,
          templateId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });

    if ("error" in result) {
      setError(result.error);
      setSaving(false);
      return;
    }

    router.push(isEdit ? `/projects/${projectId}` : `/projects/${result.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">프로젝트 이름</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 2026년 상반기 안전교육"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc">설명 (선택)</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="프로젝트에 대한 간단한 설명"
            rows={2}
          />
        </div>

        {!isEdit && (
          <div className="space-y-2">
            <Label htmlFor="template">워크플로우 템플릿</Label>
            <select
              id="template"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="">템플릿 선택...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {selectedTemplate && (
              <div className="rounded-md border bg-muted/50 p-3 text-xs">
                {selectedTemplate.tracks.map((track) => (
                  <div key={track.name}>
                    <span className="font-medium">{track.name}:</span>{" "}
                    {track.phases.map((p) => p.name).join(" → ")}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isEdit && (
          <div className="space-y-2">
            <Label htmlFor="status">상태</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start">시작일</Label>
            <Input
              id="start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">종료일</Label>
            <Input
              id="end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "저장 중..." : isEdit ? "수정" : "생성"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  );
}
