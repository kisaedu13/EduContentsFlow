"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePartDates } from "@/actions/schedule";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateEditPopoverProps {
  projectId: string;
  partId: string;
  partName: string;
  startDate: string | null;
  endDate: string | null;
  children: React.ReactNode;
}

export function DateEditPopover({
  projectId,
  partId,
  partName,
  startDate,
  endDate,
  children,
}: DateEditPopoverProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(startDate ?? "");
  const [end, setEnd] = useState(endDate ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updatePartDates(projectId, partId, {
      startDate: start || null,
      endDate: end || null,
    });
    router.refresh();
    setSaving(false);
    setOpen(false);
  }

  async function handleClear() {
    setSaving(true);
    await updatePartDates(projectId, partId, {
      startDate: null,
      endDate: null,
    });
    setStart("");
    setEnd("");
    router.refresh();
    setSaving(false);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<span className="cursor-pointer" />}>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-3">
          <p className="text-sm font-medium">{partName}</p>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">시작일</Label>
              <Input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">마감일</Label>
              <Input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? "저장 중..." : "저장"}
            </Button>
            {(startDate || endDate) && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                disabled={saving}
              >
                초기화
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
