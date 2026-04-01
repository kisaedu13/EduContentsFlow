"use client";

import { useState, useOptimistic, useTransition } from "react";
import { format } from "date-fns";
import { Trash2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  currentUserName: string;
  isAdmin: boolean;
}

type OptimisticAction =
  | { type: "add"; announcement: AnnouncementData }
  | { type: "delete"; id: string };

export function AnnouncementBoard({
  projectId,
  announcements,
  currentUserId,
  currentUserName,
  isAdmin,
}: AnnouncementBoardProps) {
  const [, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [optimisticAnnouncements, dispatchOptimistic] = useOptimistic(
    announcements,
    (state: AnnouncementData[], action: OptimisticAction) => {
      if (action.type === "add") return [action.announcement, ...state];
      if (action.type === "delete") return state.filter((a) => a.id !== action.id);
      return state;
    },
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    setSubmitting(true);
    setTitle("");
    setContent("");

    startTransition(async () => {
      dispatchOptimistic({
        type: "add",
        announcement: {
          id: `temp-${Date.now()}`,
          title: trimmedTitle,
          content: trimmedContent,
          authorName: currentUserName,
          authorId: currentUserId,
          createdAt: new Date().toISOString(),
        },
      });
      await createAnnouncement({ projectId, title: trimmedTitle, content: trimmedContent });
      setSubmitting(false);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      dispatchOptimistic({ type: "delete", id });
      await deleteAnnouncement(id);
    });
  }

  return (
    <div className="space-y-4">
      {/* 공지 작성 폼 */}
      <form onSubmit={handleSubmit} className="rounded-[10px] bg-card shadow-[var(--shadow-card)] p-4 space-y-3">
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
      {optimisticAnnouncements.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-3 flex size-14 items-center justify-center rounded-xl bg-muted">
            <Megaphone className="size-7 text-muted-foreground" />
          </div>
          <p className="font-medium">공지사항이 없습니다</p>
          <p className="mt-1 text-muted-foreground">
            위의 폼에서 첫 번째 공지를 등록하세요.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {optimisticAnnouncements.map((a) => (
            <div key={a.id} className={`flex gap-3 ${a.id.startsWith("temp-") ? "opacity-70" : ""}`}>
              <Avatar className="size-7 shrink-0 mt-0.5">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {a.authorName.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 rounded-[10px] bg-card shadow-[var(--shadow-card)] p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-[15px]">{a.title}</h4>
                    <p className="text-[13px] text-muted-foreground">
                      {a.authorName} &middot; {format(new Date(a.createdAt), "yyyy.MM.dd HH:mm")}
                    </p>
                  </div>
                  {(isAdmin || currentUserId === a.authorId) && !a.id.startsWith("temp-") && (
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <p className="text-[15px] whitespace-pre-wrap">{a.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
