import { useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { resetPassword, clearAuthError } from "../../store/authSlice";
import type { AppDispatch } from "../../store/store";
import {
  selectAuthLoading,
  selectAuthError,
  selectPasswordResetSent,
} from "../../store/authSlice";

export default function ForgotPasswordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const resetSent = useSelector(selectPasswordResetSent);

  const [email, setEmail] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    await dispatch(resetPassword({ email }));
  };

  if (resetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-4">
        <div className="w-full max-w-md text-center">
          <div className="card p-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-moss-100 text-moss-500 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-display text-lg text-ink mb-2">Check your email</h2>
            <p className="text-sm text-muted mb-6">
              We&apos;ve sent a 6-digit OTP to <strong className="text-ink">{email}</strong>.
              Enter it on the next screen to reset your password.
            </p>
            <Link to="/reset-password" className="btn-primary inline-flex justify-center">
              Enter OTP
            </Link>
            <p className="text-sm text-muted mt-4">
              Didn&apos;t receive it?{" "}
              <button
                onClick={() => dispatch(resetPassword({ email }))}
                className="text-brand-500 hover:underline"
                disabled={isLoading}
              >
                Resend OTP
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-brand-500 text-white mb-4">
            <Home size={22} strokeWidth={2.25} />
          </div>
          <h1 className="font-display text-2xl text-ink">Reset password</h1>
          <p className="text-sm text-muted mt-1">
            Enter your email and we&apos;ll send you a reset OTP
          </p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 rounded-sm bg-brick-100 border border-brick-500/20 px-4 py-3">
              <p className="text-sm text-brick-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center"
              disabled={isLoading}
            >
              {isLoading ? "Sending OTP..." : "Send reset OTP"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="text-sm text-muted hover:text-ink inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
