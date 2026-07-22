"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block align-middle">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition hover:bg-orange-100 hover:text-orange-600"
        aria-label="Penjelasan"
      >
        <Info size={13} />
      </button>
      {open && (
        <div className="absolute left-0 top-7 z-50 w-72 rounded-xl bg-gray-900 p-3 text-xs leading-relaxed text-gray-100 shadow-xl sm:w-80">
          {text}
        </div>
      )}
    </div>
  );
}
