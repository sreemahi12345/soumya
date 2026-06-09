"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApiBaseUrl } from "../../../lib/api";
import { setAdminSessionToken } from "../../../lib/adminSession";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      username: String(formData.get("username") || ""),
      password: String(formData.get("password") || ""),
    };

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Admin login failed");
      }

      setAdminSessionToken(data.token);
      router.push("/admin/panel");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in-up">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800 mb-6 group transition-all duration-200"
        >
          <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">←</span>
          Back to site
        </Link>

        <section className="rounded-2xl bg-white shadow-xl border border-teal-100 p-8">
          <div className="mb-6">
            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center mb-4 shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-teal-800">Admin Login</h1>
            <p className="text-sm text-zinc-500 mt-1">Access the Sree Mahi admin panel.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium text-zinc-700">Username</label>
              <input
                id="username"
                name="username"
                required
                autoComplete="username"
                className="border border-teal-200 rounded-xl px-4 py-2.5 text-sm bg-teal-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-zinc-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="border border-teal-200 rounded-xl px-4 py-2.5 text-sm bg-teal-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-xl bg-teal-600 text-white py-2.5 font-semibold hover:bg-teal-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-teal-200"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : "Login"}
            </button>

            {errorMessage && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-fade-in">
                {errorMessage}
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
