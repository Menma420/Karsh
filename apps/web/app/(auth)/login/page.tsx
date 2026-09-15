"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { Lock, Mail, UserPlus, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    apiFetch("/auth/me")
      .then((res) => {
        if (res.user) router.push("/");
      })
      .catch(() => {
        // Not logged in
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 border border-slate-700 text-sky-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
            Personal Capability OS
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Private Evidence &amp; Assessment System
          </p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 p-3 rounded-md text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@capability.os"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? "Processing..." : isRegister ? "Create Single-User Account" : "Log In"}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-xs text-slate-400 hover:text-sky-400 underline underline-offset-4"
          >
            {isRegister
              ? "Already configured? Switch to Login"
              : "First time setup? Register single user account"}
          </button>
        </div>
      </div>
    </div>
  );
}
