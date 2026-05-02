import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../utils/validation";
import { InputField } from "../components/InputField";
import { loginRequest } from "../services/auth.api";
import { getApiErrorMessage } from "../services/apiErrors";
import { useAuthStore } from "../store/authStore";
import { getPostAuthRedirectPath } from "../utils/authRouting";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setAuthSession } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const eError = validateEmail(email);
    setEmailError(eError);


    if (eError) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await loginRequest({ email, password });
      setAuthSession(response.token, response.user);
      navigate(getPostAuthRedirectPath(response.user));
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 sm:p-10">
        <div className="mb-10 text-center">
          <Link
            to="/"
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 active:scale-95"
          >
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Please sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <InputField
            id="email"
            type="email"
            label="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            placeholder="you@example.com"
          />

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <a
                href="#"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`block w-full rounded-xl border bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-offset-1 
                  border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20
              `}
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </div>
          {submitError && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-600 text-center">{submitError}</p>
            </div>
          )}
        </form>

        <p className="mt-10 text-center text-sm text-slate-500">
          Not a member?{" "}
          <Link
            to="/register"
            className="font-semibold text-emerald-600 transition-colors hover:text-emerald-500"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
