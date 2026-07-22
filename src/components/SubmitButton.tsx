"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-900/10 transition hover:shadow-lg hover:shadow-orange-900/20 disabled:opacity-60"
      }
    >
      {pending ? "Menyimpan..." : children}
    </button>
  );
}
