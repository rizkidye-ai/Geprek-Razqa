"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Wallet, X } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { payOrderAction } from "@/app/(app)/pesanan/actions";

export function PayOrderButton({ orderId, total }: { orderId: string; total: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"TUNAI" | "QRIS" | "TRANSFER">("TUNAI");
  const [cashReceived, setCashReceived] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const cashReceivedNum = parseInt(cashReceived || "0", 10);
  const change = cashReceivedNum - total;

  const handlePay = () => {
    setError("");
    if (method === "TUNAI" && (Number.isNaN(cashReceivedNum) || cashReceivedNum < total)) {
      setError("Uang tunai kurang dari total.");
      return;
    }
    startTransition(async () => {
      try {
        await payOrderAction({
          orderId,
          method,
          cashReceived: method === "TUNAI" ? cashReceivedNum : undefined,
        });
        setOpen(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memproses pembayaran.");
      }
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
      >
        <Wallet size={12} /> Bayar
      </button>
    );
  }

  return (
    <div className="mt-2 w-full rounded-lg border border-blue-100 bg-blue-50 p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-700">Total: {formatRupiah(total)}</p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X size={14} />
        </button>
      </div>
      <div className="mb-2 grid grid-cols-3 gap-1.5">
        {(["TUNAI", "QRIS", "TRANSFER"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`rounded-lg py-1 text-xs font-medium ${
              method === m ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      {method === "TUNAI" && (
        <div className="mb-2 space-y-1">
          <input
            value={cashReceived}
            onChange={(e) => setCashReceived(e.target.value)}
            type="number"
            min="0"
            placeholder="Uang diterima"
            className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs"
          />
          {cashReceived && (
            <p className={`text-xs ${change < 0 ? "text-red-500" : "text-gray-500"}`}>
              Kembalian: {formatRupiah(Math.max(change, 0))}
            </p>
          )}
        </div>
      )}
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <button
        onClick={handlePay}
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {isPending ? "Memproses..." : "Konfirmasi Bayar"}
      </button>
    </div>
  );
}
