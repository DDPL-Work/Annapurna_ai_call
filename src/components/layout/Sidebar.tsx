import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  PhoneCall,
  CalendarClock,
  MessageCircle,
  Settings as SettingsIcon,
  Building2,
  LogOut,
  UserCog,
  Sparkles,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { selectPendingFollowups } from "../../store/followupsSlice";
import { selectAuthUser, logout } from "../../store/authSlice";
import { selectIsAdmin } from "../../store/authSlice";
import type { AppDispatch } from "../../store/store";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/leads", label: "Enquiries", icon: Users },
  { to: "/calls", label: "Call Log", icon: PhoneCall },
  { to: "/followups", label: "Follow-ups", icon: CalendarClock, badgeKey: "followups" },
  { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { to: "/agents", label: "Agents", icon: UserCog, adminOnly: true },
  { to: "/settings", label: "Settings", icon: SettingsIcon, adminOnly: true },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const pending = useSelector(selectPendingFollowups);
  const user = useSelector(selectAuthUser);
  const isAdmin = useSelector(selectIsAdmin);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login", { replace: true });
  };

  const pendingCount = Array.isArray(pending) ? pending.length : 0;

  return (
    <aside className="flex h-full min-h-screen w-full flex-col bg-brand-700 text-brand-50 shadow-xl md:min-h-full">
      {/* ─── Brand Header ─── */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-7 border-b border-white/10">
        <div className="h-9 w-9 rounded-md bg-gold-500 text-brand-900 flex items-center justify-center font-bold shrink-0 shadow-sm">
          <Building2 size={19} strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-white text-base leading-none">ANNPURNA</span>
            <span className="text-gold-500 font-extrabold text-xs tracking-wide">PROPERTIES</span>
          </div>
          <p className="text-[11px] font-medium text-brand-100/70 mt-1 flex items-center gap-1">
            <Sparkles size={11} className="text-gold-400 shrink-0" />
            AI Calling CRM
          </p>
        </div>
      </div>

      {/* ─── Navigation Items ─── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map(({ to, label, icon: Icon, badgeKey }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative flex items-center justify-between gap-3 rounded-sm px-3.5 py-2.5 text-sm transition-all ${
                isActive
                  ? "bg-brand-800/90 text-white font-semibold shadow-inner"
                  : "text-brand-100/80 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-gold-500" />
                )}
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.25 : 1.75}
                    className={isActive ? "text-gold-400" : "text-brand-100/70 group-hover:text-white transition-colors"}
                  />
                  <span className="truncate">{label}</span>
                </span>
                {badgeKey === "followups" && pendingCount > 0 && (
                  <span className="text-[11px] leading-none bg-gold-500 text-brand-900 font-bold rounded-full px-2 py-1 shadow-sm shrink-0">
                    {pendingCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ─── User Profile & Sign Out ─── */}
      <div className="px-4 py-4 border-t border-white/10 bg-brand-800/40">
        {user && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gold-500 text-brand-900 text-xs font-bold flex items-center justify-center shrink-0">
                {(user.first_name?.[0] || user.username?.[0] || "A").toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-white font-semibold truncate leading-tight">
                  {user.first_name ? `${user.first_name} ${user.last_name || ""}` : user.username}
                </p>
                <p className="text-[11px] text-brand-100/60 truncate mt-0.5">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded text-brand-100/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

