"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle size={22} />
        </div>
        <h1 className="mb-1 text-base font-semibold text-gray-900">Terjadi Kesalahan</h1>
        <p className="mb-4 text-sm text-gray-500">
          {error.message || "Ada yang tidak beres. Silakan coba lagi."}
        </p>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => unstable_retry()}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-900/10 hover:shadow-lg hover:shadow-orange-900/20"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
