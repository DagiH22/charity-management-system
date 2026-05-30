import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InputField } from "../components/InputField";
import {
  forgotPasswordRequest,
  resetForgottenPasswordRequest,
  verifyResetOtpRequest,
} from "../services/auth.api";
import { getApiErrorMessage } from "../services/apiErrors";
import { validateEmail, validatePassword } from "../utils/validation";

type ResetStep = 1 | 2 | 3;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<ResetStep>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const clearAlerts = () => {
    setSubmitError(null);
    setSuccessMessage(null);
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    clearAlerts();

    const currentEmailError = validateEmail(email);
    setEmailError(currentEmailError);

    if (currentEmailError) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await forgotPasswordRequest({ email });
      setSuccessMessage(response.message);
      setStep(2);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    clearAlerts();

    const normalizedOtp = otp.trim();

    if (!/^\d{6}$/.test(normalizedOtp)) {
      setOtpError("Enter a valid 6-digit code");
      return;
    }

    setOtpError(null);

    try {
      setIsSubmitting(true);
      const response = await verifyResetOtpRequest({
        email,
        otp: normalizedOtp,
      });
      setResetToken(response.data.resetToken);
      setStep(3);
      setSuccessMessage("Code verified. You can now set a new password.");
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    clearAlerts();
    try {
      setIsResending(true);
      const response = await forgotPasswordRequest({ email });
      setSuccessMessage(response.message);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    clearAlerts();

    const currentPasswordError = validatePassword(newPassword);
    const currentConfirmError =
      confirmPassword !== newPassword ? "Passwords do not match" : null;

    setPasswordError(currentPasswordError);
    setConfirmPasswordError(currentConfirmError);

    if (currentPasswordError || currentConfirmError) {
      return;
    }

    if (!resetToken) {
      setSubmitError("Reset session expired. Please verify your code again.");
      setStep(2);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await resetForgottenPasswordRequest({
        resetToken,
        newPassword,
      });
      setSuccessMessage(response.message);
      setResetToken(null);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitle =
    step === 1
      ? "Forgot password"
      : step === 2
        ? "Enter reset code"
        : "Create new password";

  const stepDescription =
    step === 1
      ? "Enter your email and we'll send a verification code."
      : step === 2
        ? `We sent a 6-digit code to ${email}.`
        : "Set a strong new password for your account.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 sm:p-10">
        <div className="mb-10 text-center">
          <Link
            to="/"
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 active:scale-95"
          >
            <svg
              className="h-7 w-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2h-1V9a5 5 0 00-10 0v2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {stepTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{stepDescription}</p>
        </div>

        {successMessage && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-sm font-medium text-emerald-700 text-center">
              {successMessage}
            </p>
          </div>
        )}

        {submitError && (
          <div className="mb-5 rounded-lg bg-red-50 p-3">
            <p className="text-sm font-medium text-red-600 text-center">
              {submitError}
            </p>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <InputField
              id="email"
              type="email"
              label="Email Address"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError(null);
              }}
              error={emailError}
              placeholder="you@example.com"
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
              >
                {isSubmitting ? "Sending code..." : "Send Code"}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <InputField
              id="otp"
              type="text"
              label="Verification Code"
              required
              maxLength={6}
              value={otp}
              onChange={(event) => {
                setOtp(
                  event.target.value.replace(/\D/g, "").slice(0, 6),
                );
                setOtpError(null);
              }}
              error={otpError}
              placeholder="123456"
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
              >
                {isSubmitting ? "Verifying..." : "Verify Code"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                disabled={isResending}
                onClick={() => {
                  void handleResendCode();
                }}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500 disabled:pointer-events-none disabled:opacity-70"
              >
                {isResending ? "Resending code..." : "Resend code"}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <InputField
              id="newPassword"
              type="password"
              label="New Password"
              required
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setPasswordError(null);
              }}
              error={passwordError}
              placeholder="••••••••"
            />

            <InputField
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              required
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setConfirmPasswordError(null);
              }}
              error={confirmPasswordError}
              placeholder="••••••••"
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
              >
                {isSubmitting ? "Resetting password..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}

        <p className="mt-10 text-center text-sm text-slate-500">
          Remembered your password?{" "}
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

