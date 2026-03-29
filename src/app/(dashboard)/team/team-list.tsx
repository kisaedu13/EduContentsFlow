"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Shield, User } from "lucide-react";
import { format } from "date-fns";
import { createUser, updateUserRole } from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  email: string;
  name: string;
  role: string;
  assignmentCount: number;
  createdAt: string;
}

interface TeamListProps {
  members: Member[];
  currentUserId: string;
}

export function TeamList({ members, currentUserId }: TeamListProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const result = await createUser({ email, name, password, role });

    if ("error" in result) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setEmail("");
    setName("");
    setPassword("");
    setRole("MEMBER");
    setDialogOpen(false);
    setSaving(false);
    router.refresh();
  }

  async function handleToggleRole(userId: string, currentRole: string) {
    setToggling(userId);
    const newRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";
    const result = await updateUserRole(userId, newRole as "ADMIN" | "MEMBER");
    if ("error" in result) {
      setError(result.error);
    } else {
      router.refresh();
    }
    setToggling(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">팀원 ({members.length}명)</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="size-4" />
            팀원 추가
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 팀원 추가</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">초기 비밀번호</Label>
                <Input
                  id="password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6자 이상"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>역할</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={role === "MEMBER" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRole("MEMBER")}
                  >
                    <User className="size-4" />
                    팀원
                  </Button>
                  <Button
                    type="button"
                    variant={role === "ADMIN" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRole("ADMIN")}
                  >
                    <Shield className="size-4" />
                    관리자
                  </Button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "추가 중..." : "팀원 추가"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left font-medium">이름</th>
              <th className="px-4 py-2 text-left font-medium">이메일</th>
              <th className="px-4 py-2 text-left font-medium">역할</th>
              <th className="px-4 py-2 text-left font-medium">배정 업무</th>
              <th className="px-4 py-2 text-left font-medium">가입일</th>
              <th className="px-4 py-2 w-20" />
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const isMe = member.id === currentUserId;
              return (
                <tr key={member.id} className="border-b last:border-0">
                  <td className="px-4 py-2.5 font-medium">
                    {member.name}
                    {isMe && (
                      <span className="ml-1.5 text-xs text-muted-foreground">(나)</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {member.email}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        member.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                      )}
                    >
                      {member.role === "ADMIN" ? (
                        <><Shield className="size-3" /> 관리자</>
                      ) : (
                        <><User className="size-3" /> 팀원</>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {member.assignmentCount}개
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {format(new Date(member.createdAt), "yyyy.MM.dd")}
                  </td>
                  <td className="px-4 py-2.5">
                    {!isMe && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        disabled={toggling === member.id}
                        onClick={() => handleToggleRole(member.id, member.role)}
                      >
                        {member.role === "ADMIN" ? "팀원으로" : "관리자로"}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error && !dialogOpen && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
