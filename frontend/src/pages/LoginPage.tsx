import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "../utils/validation";
import { InputField } from "../components/InputField";
import { getApiErrorMessage, loginRequest } from "../services/auth.api";
import type { User } from "../types/auth";

type LoginPageProps = {
  user: User | null;
  onAuthSuccess: (token: string, user: User) => void;
};

export default function LoginPage({ user, onAuthSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const eError = validateEmail(email);
    const pError = validatePassword(password);

    setEmailError(eError);
    setPasswordError(pError);

    if (eError || pError) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await loginRequest({ email, password });
      onAuthSuccess(response.token, response.user);
      navigate("/dashboard");
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_10px_40px_rgba(10,40,80,0.08)]">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-[-0.02em] text-[#0b2b53] mb-6 inline-block"
          >
            Charity<span className="text-emerald-500">.</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b2b53]">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Please sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700"
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
              className={`mt-2 block w-full rounded-lg border px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 ${
                passwordError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
              }`}
              placeholder="••••••••"
            />
            {passwordError && (
              <p className="mt-1 text-xs text-red-500">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
          {submitError && <p className="text-sm text-red-500">{submitError}</p>}
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Not a member?{" "}
          <Link
            to="/register"
            className="font-semibold text-emerald-600 hover:text-emerald-500"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
