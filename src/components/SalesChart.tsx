"use client";

import { useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatRupiah } from "@/lib/format";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function noopSubscribe() {
  return () => {};
}

function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function Chart({ data }: { data: { date: string; total: number }[] }) {
  const mounted = useMounted();

  if (!mounted) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-gray-50" />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${Math.round(v / 1000)}rb`}
            width={40}
          />
          <Tooltip
            formatter={(value) => formatRupiah(Number(value))}
            labelClassName="text-xs"
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SalesChart({ data }: { data: { date: string; total: number }[] }) {
  return (
    <ErrorBoundary
      fallback={<div className="flex h-64 w-full items-center justify-center text-sm text-gray-400">Grafik tidak tersedia.</div>}
    >
      <Chart data={data} />
    </ErrorBoundary>
  );
}
