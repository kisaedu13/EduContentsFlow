"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, GripVertical } from "lucide-react";
import { createTemplate, updateTemplate } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Phase {
  name: string;
  sortOrder: number;
}

interface Track {
  name: string;
  sortOrder: number;
  phases: Phase[];
}

interface WorkflowEditorProps {
  templateId?: string;
  initialData?: {
    name: string;
    description: string | null;
    tracks: {
      name: string;
      sortOrder: number;
      phases: { name: string; sortOrder: number }[];
    }[];
  };
}

export function WorkflowEditor({ templateId, initialData }: WorkflowEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [tracks, setTracks] = useState<Track[]>(
    initialData?.tracks ?? [
      { name: "", sortOrder: 0, phases: [{ name: "", sortOrder: 0 }] },
    ],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addTrack() {
    setTracks([
      ...tracks,
      {
        name: "",
        sortOrder: tracks.length,
        phases: [{ name: "", sortOrder: 0 }],
      },
    ]);
  }

  function removeTrack(trackIndex: number) {
    if (tracks.length <= 1) return;
    setTracks(tracks.filter((_, i) => i !== trackIndex).map((t, i) => ({ ...t, sortOrder: i })));
  }

  function updateTrackName(trackIndex: number, value: string) {
    setTracks(tracks.map((t, i) => (i === trackIndex ? { ...t, name: value } : t)));
  }

  function addPhase(trackIndex: number) {
    setTracks(
      tracks.map((t, i) =>
        i === trackIndex
          ? { ...t, phases: [...t.phases, { name: "", sortOrder: t.phases.length }] }
          : t,
      ),
    );
  }

  function removePhase(trackIndex: number, phaseIndex: number) {
    setTracks(
      tracks.map((t, ti) =>
        ti === trackIndex
          ? {
              ...t,
              phases:
                t.phases.length <= 1
                  ? t.phases
                  : t.phases.filter((_, pi) => pi !== phaseIndex).map((p, i) => ({ ...p, sortOrder: i })),
            }
          : t,
      ),
    );
  }

  function updatePhaseName(trackIndex: number, phaseIndex: number, value: string) {
    setTracks(
      tracks.map((t, ti) =>
        ti === trackIndex
          ? {
              ...t,
              phases: t.phases.map((p, pi) => (pi === phaseIndex ? { ...p, name: value } : p)),
            }
          : t,
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = { name, description: description || undefined, tracks };

    const result = templateId
      ? await updateTemplate(templateId, payload)
      : await createTemplate(payload);

    if ("error" in result) {
      setError(result.error);
      setSaving(false);
      return;
    }

    router.push("/templates");
    router.refresh();
  }

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

      {/* 트랙 목록 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>트랙 & 단계</Label>
          <Button type="button" variant="outline" size="sm" onClick={addTrack}>
            <Plus className="size-4" />
            트랙 추가
          </Button>
        </div>

        {tracks.map((track, ti) => (
          <Card key={ti}>
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <GripVertical className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm">트랙 {ti + 1}</CardTitle>
                <div className="flex-1">
                  <Input
                    value={track.name}
                    onChange={(e) => updateTrackName(ti, e.target.value)}
                    placeholder="트랙 이름 (예: PT, 영상)"
                    className="h-8"
                    required
                  />
                </div>
                {tracks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => removeTrack(ti)}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-2">
                {track.phases.map((phase, pi) => (
                  <div key={pi} className="flex items-center gap-2 pl-6">
                    <span className="text-xs text-muted-foreground w-4">{pi + 1}.</span>
                    <Input
                      value={phase.name}
                      onChange={(e) => updatePhaseName(ti, pi, e.target.value)}
                      placeholder="단계 이름 (예: 초안 작성)"
                      className="h-8"
                      required
                    />
                    {track.phases.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => removePhase(ti, pi)}
                      >
                        <X className="size-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-6 text-xs"
                  onClick={() => addPhase(ti)}
                >
                  <Plus className="size-3" />
                  단계 추가
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
