"use client";

import { useState } from "react";
import { LogOut, Moon, Sun, KeyRound } from "lucide-react";
import { useTheme } from "next-themes";
import { signOut, changePassword } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";

interface UserNavProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function UserNav({ user }: UserNavProps) {
  const { theme, setTheme } = useTheme();
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }

    setSaving(true);
    const result = await changePassword(newPassword);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => {
      setPwDialogOpen(false);
      setSuccess(false);
    }, 1500);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<SidebarMenuButton className="h-auto py-2" />}>
          <Avatar className="size-6">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-xs leading-tight">
            <span className="font-medium">{user.name}</span>
            <span className="text-muted-foreground">{user.email.split("@")[0]}</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56">
          <DropdownMenuItem onClick={() => setPwDialogOpen(true)}>
            <KeyRound className="mr-2 size-4" />
            비밀번호 변경
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="mr-2 size-4" />
            ) : (
              <Moon className="mr-2 size-4" />
            )}
            {theme === "dark" ? "라이트 모드" : "다크 모드"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut()}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 size-4" />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={pwDialogOpen} onOpenChange={(open) => {
        setPwDialogOpen(open);
        if (!open) {
          setNewPassword("");
          setConfirmPassword("");
          setError(null);
          setSuccess(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
          </DialogHeader>
          {success ? (
            <p className="py-4 text-center text-sm text-emerald-600 dark:text-emerald-400">
              비밀번호가 변경되었습니다.
            </p>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">새 비밀번호</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6자 이상"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">비밀번호 확인</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  minLength={6}
                />
              </div>
              {error && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
