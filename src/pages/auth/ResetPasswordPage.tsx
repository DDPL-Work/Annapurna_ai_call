import { useState, FormEvent, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import {
  resetPasswordConfirm,
  clearAuthError,
  clearPasswordResetState,
} from "../../store/authSlice";
import type { AppDispatch } from "../../store/store";
import {
  selectAuthLoading,
  selectAuthError,
  selectAuthFieldErrors,
  selectPasswordResetConfirmSuccess,
} from "../../store/authSlice";

const OTP_LENGTH = 6;

export default function ResetPasswordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const fieldErrors = useSelector(selectAuthFieldErrors);
  const confirmSuccess = useSelector(selectPasswordResetConfirmSuccess);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const passwordsMatch = password === passwordConfirm || passwordConfirm === "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());

    const otpString = otp.join("");
    if (otpString.length !== OTP_LENGTH) return;

    const result = await dispatch(
      resetPasswordConfirm({
        email,
        otp: otpString,
        new_password: password,
        new_password_confirm: passwordConfirm,
      })
    );

    if (resetPasswordConfirm.fulfilled.match(result)) {
      // Auto-redirect to login after 2 seconds
      setTimeout(() => {
        dispatch(clearPasswordResetState());
        navigate("/login", { replace: true });
      }, 2000);
    }
  };

  if (confirmSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-4">
        <div className="w-full max-w-md text-center">
          <div className="card p-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-moss-100 text-moss-500 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-lg text-ink mb-2">Password reset successfully</h2>
            <p className="text-sm text-muted mb-6">
              Your password has been updated. Redirecting to sign in...
            </p>
            <Link to="/login" className="btn-primary inline-flex justify-center">
              Sign in now
            </Link>
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
            Enter the 6-digit OTP and your new password
          </p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 rounded-sm bg-brick-100 border border-brick-500/20 px-4 py-3">
              <p className="text-sm text-brick-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="reset-email">
                Email address
              </label>
              <input
                id="reset-email"
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="label">OTP (6 digits)</label>
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    className="input w-12 h-12 text-center text-lg font-mono"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    disabled={isLoading}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              {fieldErrors?.otp && (
                <p className="text-xs text-brick-500 mt-1 text-center">
                  {fieldErrors.otp[0]}
                </p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="new-password">
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  className="input pr-10"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors?.new_password && (
                <p className="text-xs text-brick-500 mt-1">
                  {fieldErrors.new_password[0]}
                </p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="confirm-password">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                className="input"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm new password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                disabled={isLoading}
              />
              {!passwordsMatch && passwordConfirm && (
                <p className="text-xs text-brick-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center"
              disabled={isLoading || otp.join("").length !== OTP_LENGTH || !passwordsMatch}
            >
              {isLoading ? "Resetting..." : "Reset password"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-muted hover:text-ink inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back to forgot password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
