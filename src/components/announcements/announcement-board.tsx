"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Trash2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncement, deleteAnnouncement } from "@/actions/announcements";

interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  createdAt: string;
}

interface AnnouncementBoardProps {
  projectId: string;
  announcements: AnnouncementData[];
  currentUserId: string;
  isAdmin: boolean;
}

export function AnnouncementBoard({
  projectId,
  announcements,
  currentUserId,
  isAdmin,
}: AnnouncementBoardProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    await createAnnouncement({ projectId, title: title.trim(), content: content.trim() });
    setTitle("");
    setContent("");
    setSubmitting(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteAnnouncement(id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* 공지 작성 폼 */}
      <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-3">
        <Input
          placeholder="공지 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          required
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "등록 중..." : "공지 등록"}
          </Button>
        </div>
      </form>

      {/* 공지 목록 */}
      {announcements.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm">
          <Megaphone className="size-8 mx-auto mb-2 opacity-40" />
          아직 공지사항이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-lg border p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-sm">{a.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {a.authorName} &middot; {format(new Date(a.createdAt), "yyyy.MM.dd HH:mm")}
                  </p>
                </div>
                {(isAdmin || currentUserId === a.authorId) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{a.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
