import { useState } from "react";
import { Plus, Menu, Search, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuthUser } from "../../store/authSlice";
import ChangePasswordModal from "../../pages/auth/ChangePasswordModal";

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export default function Topbar({ title, subtitle, onMenuToggle }: TopbarProps) {
  const navigate = useNavigate();
  const user = useSelector(selectAuthUser);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const initials = user
    ? (user.first_name?.[0] || user.username?.[0] || "A").toUpperCase()
    : "?";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-surface/95 px-4 py-3.5 backdrop-blur-md sm:px-6 md:px-8">
        {/* Left: Mobile Menu + Page Header */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-sm text-muted hover:text-ink hover:bg-brand-50 transition-colors md:hidden shrink-0"
            title="Toggle menu"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate font-extrabold text-xl leading-tight text-ink tracking-tight sm:text-2xl">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted font-medium mt-0.5 hidden sm:block truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Search + Live Chip + Action + User */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Global Search */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:block relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              className="w-full rounded-full border border-line bg-paper px-3.5 py-1.5 pl-9 text-xs text-ink placeholder:text-muted/70 focus:border-brand-500 focus:bg-surface focus:outline-none transition-all"
              placeholder="Search enquiries, numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Live Call Chip Status */}
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-ink">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
            </span>
            <span className="text-[11px] text-muted">AI Line: <strong className="text-ink font-semibold">Active</strong></span>
          </div>

          {/* Create Lead Button */}
          <button
            onClick={() => navigate("/leads/new")}
            className="btn-primary text-xs sm:text-sm font-semibold py-1.5 px-3.5 shadow-sm"
            aria-label="Create new enquiry"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span className="hidden sm:inline">New Enquiry</span>
          </button>

          {/* Profile User Avatar */}
          <button
            onClick={() => setShowChangePassword(true)}
            className="h-9 w-9 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center hover:bg-brand-700 active:scale-95 transition-all shadow-sm cursor-pointer border border-brand-700"
            title="Account & Password Settings"
            aria-label="Account Settings"
          >
            {initials}
          </button>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </>
  );
}

