import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "../utils/validation";
import { InputField } from "../components/InputField";
import { getApiErrorMessage, registerRequest } from "../services/auth.api";
import type { User } from "../types/auth";

type RegisterPageProps = {
  user: User | null;
  onAuthSuccess: (token: string, user: User) => void;
};

export default function RegisterPage({ user, onAuthSuccess }: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"DONOR" | "CHARITY">("DONOR");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (user.role === "CHARITY" && !user.hasCharityProfile) {
        navigate("/charity-profile/setup");
        return;
      }
      navigate("/dashboard");
    }
  }, [navigate, user]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const eError = validateEmail(email);
    const pError = validatePassword(password);

    setEmailError(eError);
    setPasswordError(pError);

    if (eError || pError) {
      return;
    }

    if (!name.trim()) {
      setSubmitError("Name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await registerRequest({
        name,
        email,
        password,
        role,
      });
      onAuthSuccess(response.token, response.user);
      if (response.user.role === "CHARITY" && !response.user.hasCharityProfile) {
        navigate("/charity-profile/setup");
        return;
      }

      navigate("/dashboard");
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Join the community and make an impact
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <InputField
            id="name"
            type="text"
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />

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

          <InputField
            id="password"
            type="password"
            label="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            placeholder="••••••••"
          />

          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-slate-700">
              Register as
            </label>
            <div className="relative">
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "DONOR" | "CHARITY")}
                className="block w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="DONOR">Donor (I want to donate)</option>
                <option value="CHARITY">Charity (I represent an org)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </button>
          </div>
          {submitError && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-600 text-center">{submitError}</p>
            </div>
          )}
        </form>

        <p className="mt-10 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 transition-colors hover:text-emerald-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
