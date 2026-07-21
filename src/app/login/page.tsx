"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-orange-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-2xl">
            🍗
          </div>
          <h1 className="text-xl font-bold text-gray-900">Geprek Rzqa</h1>
          <p className="text-sm text-gray-500">Sistem Manajemen Warung Makan</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              autoFocus
              placeholder="admin / kasir / dapur"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition"
          >
            {pending ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {process.env.NODE_ENV !== "production" && (
          <div className="mt-6 rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-500">
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
