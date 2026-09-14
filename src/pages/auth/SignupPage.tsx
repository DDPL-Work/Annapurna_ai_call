import { useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Home } from "lucide-react";
import { signup, clearAuthError } from "../../store/authSlice";
import type { AppDispatch } from "../../store/store";
import {
  selectAuthLoading,
  selectAuthError,
  selectAuthFieldErrors,
} from "../../store/authSlice";

export default function SignupPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const fieldErrors = useSelector(selectAuthFieldErrors);

  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());

    const result = await dispatch(signup(form));
    if (signup.fulfilled.match(result)) {
      navigate("/dashboard", { replace: true });
    }
  };

  const passwordsMatch = form.password === form.password_confirm || form.password_confirm === "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-brand-500 text-white mb-4">
            <Home size={22} strokeWidth={2.25} />
          </div>
          <h1 className="font-display text-2xl text-ink">Annapurna Pro</h1>
          <p className="text-sm text-muted mt-1">AI Calling & Real-Estate CRM</p>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg text-ink mb-1">Create account</h2>
          <p className="text-sm text-muted mb-5">
            Fill in the details to get started
          </p>

          {error && (
            <div className="mb-4 rounded-sm bg-brick-100 border border-brick-500/20 px-4 py-3">
              <p className="text-sm text-brick-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="first_name">
                  First name
                </label>
                <input
                  id="first_name"
                  className="input"
                  value={form.first_name}
                  onChange={update("first_name")}
                  placeholder="First name"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="label" htmlFor="last_name">
                  Last name
                </label>
                <input
                  id="last_name"
                  className="input"
                  value={form.last_name}
                  onChange={update("last_name")}
                  placeholder="Last name"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                className="input"
                value={form.username}
                onChange={update("username")}
                placeholder="Choose a username"
                required
                disabled={isLoading}
              />
              {fieldErrors?.username && (
                <p className="text-xs text-brick-500 mt-1">
                  {fieldErrors.username[0]}
                </p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="input"
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
              {fieldErrors?.email && (
                <p className="text-xs text-brick-500 mt-1">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  className="input pr-10"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={update("password")}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors?.password && (
                <p className="text-xs text-brick-500 mt-1">
                  {fieldErrors.password[0]}
                </p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="password_confirm">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="password_confirm"
                  className="input pr-10"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={form.password_confirm}
                  onChange={update("password_confirm")}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {!passwordsMatch && form.password_confirm && (
                <p className="text-xs text-brick-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center"
              disabled={isLoading || !passwordsMatch}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-sm text-muted text-center mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-500 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
