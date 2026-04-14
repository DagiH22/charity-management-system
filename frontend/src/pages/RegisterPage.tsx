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
            Create an Account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Join us to make a difference
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
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
            <label htmlFor="role" className="block text-sm font-semibold text-slate-700">
              Register as
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "DONOR" | "CHARITY")}
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="DONOR">Donor</option>
              <option value="CHARITY">Charity</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
          {submitError && <p className="text-sm text-red-500">{submitError}</p>}
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
