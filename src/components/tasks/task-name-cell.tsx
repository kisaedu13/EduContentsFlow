"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface TaskNameCellProps {
  name: string;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onNameChange: (name: string) => void;
}

export function TaskNameCell({
  name,
  depth,
  hasChildren,
  isExpanded,
  onToggleExpand,
  onNameChange,
}: TaskNameCellProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function handleSubmit() {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) {
      onNameChange(trimmed);
    } else {
      setValue(name);
    }
  }

  return (
    <div className="flex items-center gap-1 min-w-0 flex-1">
      {hasChildren ? (
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex-shrink-0 p-0.5 rounded hover:bg-muted"
        >
          {isExpanded ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
        </button>
      ) : (
        <span className="w-5 flex-shrink-0" />
      )}

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") {
              setValue(name);
              setEditing(false);
            }
          }}
          className="flex-1 min-w-0 rounded border border-input bg-transparent px-1.5 py-0.5 text-sm outline-none focus:border-ring"
        />
      ) : (
        <span
          className="flex-1 min-w-0 truncate text-sm cursor-pointer hover:text-foreground/80 py-0.5 px-1.5 rounded hover:bg-muted/50"
          onClick={() => setEditing(true)}
        >
          {name}
        </span>
      )}
    </div>
  );
}
