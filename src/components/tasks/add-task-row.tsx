"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface AddTaskRowProps {
  onAdd: (name: string) => void;
  depth?: number;
  placeholder?: string;
}

export function AddTaskRow({ onAdd, depth = 0, placeholder = "업무 추가..." }: AddTaskRowProps) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");

  function handleSubmit() {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue("");
    }
    setAdding(false);
  }

  if (adding) {
    return (
      <tr className="border-b border-border/50">
        <td colSpan={7} className="py-1 px-2">
          <div style={{ paddingLeft: depth * 24 + 20 }}>
            <input
              autoFocus
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
                if (e.key === "Escape") {
                  setValue("");
                  setAdding(false);
                }
              }}
              placeholder={placeholder}
              className="w-full rounded border border-input bg-transparent px-1.5 py-1 text-sm outline-none focus:border-ring"
            />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30">
      <td colSpan={7} className="py-1 px-2">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
          style={{ paddingLeft: depth * 24 }}
        >
          <Plus className="size-4" />
          {placeholder}
        </button>
      </td>
    </tr>
  );
}
