"use client";

import { useActionState } from "react";
import { Lock, User } from "lucide-react";
import { loginAction, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm({
  storeName,
  logoUrl,
}: {
  storeName: string;
  logoUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl shadow-orange-900/10 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-3xl shadow-lg shadow-orange-900/20">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <span>🍗</span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{storeName}</h1>
          <p className="text-sm text-gray-500">Sistem Manajemen Warung Makan</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="username"
                type="text"
                required
                autoFocus
                placeholder="admin / kasir / dapur"
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
          </div>

          {state.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:shadow-orange-900/30 disabled:opacity-60"
          >
            {pending ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {process.env.NODE_ENV !== "production" && (
          <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs text-gray-500">
            <p className="font-semibold mb-1">Akun demo (hanya tampil di mode development):</p>
            <p>admin / geprek123 (Pemilik)</p>
            <p>kasir / geprek123 (Kasir)</p>
            <p>dapur / geprek123 (Dapur)</p>
          </div>
        )}
      </div>
    </div>
  );
}
