import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "../utils/validation";
import { InputField } from "../components/InputField";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const eError = validateEmail(email);
    const pError = validatePassword(password);

    setEmailError(eError);
    setPasswordError(pError);

    if (eError || pError) {
      return;
    }

    // Placeholder for actual registration logic
    console.log("Registering with", name, email, password);
    navigate("/login");
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

          <button
            type="submit"
            className="w-full flex justify-center rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
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
