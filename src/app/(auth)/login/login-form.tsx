"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: `${email}@educontents.kr`,
      password,
    });

    if (error) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Mobile-only brand */}
      <div className="flex flex-col items-center gap-3 lg:hidden">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="size-6" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-bold">EduContentsFlow</h1>
          <p className="text-sm text-muted-foreground">안전보건교육본부</p>
        </div>
      </div>

      {/* Desktop heading */}
      <div className="hidden lg:block space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">로그인</h2>
        <p className="text-sm text-muted-foreground">
          아이디와 비밀번호를 입력하세요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">아이디</Label>
          <Input
            id="email"
            type="text"
            placeholder="아이디를 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10"
            required
          />
          <p className="text-xs text-muted-foreground">@educontents.kr</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10"
            required
          />
        </div>
        {error && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </Button>
      </form>
    </div>
  );
}
