import { useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { login, clearAuthError } from "../../store/authSlice";
import type { AppDispatch } from "../../store/store";
import {
  selectAuthLoading,
  selectAuthError,
  selectAuthFieldErrors,
} from "../../store/authSlice";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const fieldErrors = useSelector(selectAuthFieldErrors);

  // Default prefilled credentials matching prototype screenshot walkthrough
  const [identifier, setIdentifier] = useState("sandeep@annpurnaproperties.in");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState("Sales executive");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());

    const credentials = { email: identifier, password };

    const result = await dispatch(login(credentials));
    if (login.fulfilled.match(result)) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* ─── Left Hero Panel (Deep Forest Green Brand) ─── */}
      <div className="w-full md:w-1/2 bg-[#0B3B2E] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden min-h-[500px] md:min-h-screen">
        {/* Background Decorative Waves SVG */}
        <svg
          className="absolute right-0 top-0 h-full w-full opacity-30 pointer-events-none stroke-gold-400/40"
          fill="none"
          viewBox="0 0 400 800"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M200 0C280 150 120 300 250 500C380 700 150 800 150 800"
            strokeWidth="1.5"
          />
          <path
            d="M300 0C350 200 200 400 350 600C450 750 300 800 300 800"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle cx="250" cy="500" r="4" className="fill-gold-400" />
          <circle cx="210" cy="350" r="3" className="fill-emerald-400" />
        </svg>

        <div className="relative z-10">
          {/* Brand Logo Header */}
          <div className="flex items-center gap-1.5 text-xl font-extrabold tracking-wide uppercase">
            <span className="text-white">ANNPURNA</span>
            <span className="text-gold-400">PROPERTIES</span>
          </div>

          {/* Main Hero Copy */}
          <div className="mt-16 sm:mt-24 max-w-lg">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
              No enquiry goes to voicemail.
            </h1>
            <p className="text-sm sm:text-base text-brand-100/90 leading-relaxed mt-6 font-normal">
              Riya answers every call, finds out what the buyer wants and where, and the enquiry is in your pipeline before the caller has hung up.
            </p>
          </div>
        </div>

        {/* Bottom Key Performance Metrics */}
        <div className="relative z-10 pt-10 mt-12 border-t border-brand-700/60 grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-gold-400 tabular-nums">100%</p>
            <p className="text-xs text-brand-200 mt-1 font-medium">Calls answered</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-gold-400 tabular-nums">18s</p>
            <p className="text-xs text-brand-200 mt-1 font-medium">Call to CRM entry</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-gold-400 tabular-nums">₹14</p>
            <p className="text-xs text-brand-200 mt-1 font-medium">Cost per call</p>
          </div>
        </div>
      </div>

      {/* ─── Right Form Panel ─── */}
      <div className="w-full md:w-1/2 bg-white p-8 sm:p-12 lg:p-20 flex flex-col justify-center min-h-screen">
        <div className="max-w-md w-full mx-auto space-y-7">
          {/* Form Header */}
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">Sign in</h2>
            <p className="text-sm text-muted mt-1.5 font-medium">
              Annapurna Properties · Dehradun
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-brick-50 border border-brick-200 px-4 py-3">
              <p className="text-xs font-medium text-brick-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5" htmlFor="identifier">
                Work email
              </label>
              <input
                id="identifier"
                className="w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all"
                type="text"
                autoComplete="username"
                placeholder="sandeep@annpurnaproperties.in"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
              />
              {fieldErrors?.email && (
                <p className="text-xs text-brick-500 mt-1">
                  {fieldErrors.email[0]}
                </p>
              )}
              {fieldErrors?.username && (
                <p className="text-xs text-brick-500 mt-1">
                  {fieldErrors.username[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  className="w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink pr-10 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
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
              <label className="block text-xs font-medium text-muted mb-1.5" htmlFor="role">
                Sign in as
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all cursor-pointer"
              >
                <option value="Sales executive">Sales executive</option>
                <option value="Managing director / Owner">Managing director / Owner</option>
                <option value="Sales manager / Lead agent">Sales manager / Lead agent</option>
                <option value="Front-desk operator">Front-desk operator</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full justify-center rounded-md bg-[#083126] text-white py-3 text-sm font-semibold hover:bg-[#0B3B2E] active:bg-[#05221B] transition-colors shadow-sm disabled:opacity-50 mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            <div className="flex items-center justify-between text-xs text-muted pt-1">
              <Link
                to="/forgot-password"
                className="hover:text-brand-600 hover:underline"
              >
                Forgot password
              </Link>
              <button
                type="button"
                onClick={() => alert("OTP login option enabled for configured mobile accounts.")}
                className="hover:text-brand-600 hover:underline cursor-pointer bg-transparent border-0 p-0 text-xs text-muted"
              >
                Use OTP instead
              </button>
            </div>
          </form>

          {/* Prototype Callout Banner */}
          <div className="rounded-md bg-[#F4F6F4] border border-[#E2E7E3] p-4 text-xs text-muted leading-relaxed mt-6">
            Prototype build. Any password works — the credentials above are filled in so you can walk someone through it without typing.
          </div>
        </div>
      </div>
    </div>
  );
}


