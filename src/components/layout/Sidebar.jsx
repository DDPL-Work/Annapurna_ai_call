import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  PhoneCall,
  CalendarClock,
  MessageCircle,
  Settings as SettingsIcon,
  Home,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectPendingFollowups } from "../../store/followupsSlice";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/calls", label: "Calls", icon: PhoneCall },
  { to: "/followups", label: "Follow-ups", icon: CalendarClock, badgeKey: "followups" },
  { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const pending = useSelector(selectPendingFollowups);

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-brand-700 text-brand-50 min-h-screen">
      <div className="flex items-center gap-2.5 px-6 pt-7 pb-8">
        <div className="h-8 w-8 rounded-sm bg-brass-500 flex items-center justify-center">
          <Home size={17} strokeWidth={2.25} className="text-brand-700" />
        </div>
        <div>
          <p className="font-display text-lg leading-none tracking-tight text-white">Basera</p>
          <p className="text-[11px] text-brand-100/70 mt-0.5">AI Calling CRM</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, badgeKey }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white font-medium"
                  : "text-brand-100/75 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <span className="flex items-center gap-3">
              <Icon size={17} strokeWidth={2} />
              {label}
            </span>
            {badgeKey === "followups" && pending.length > 0 && (
              <span className="text-[11px] leading-none bg-brass-500 text-brand-700 font-semibold rounded-full px-1.5 py-1">
                {pending.length}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-white/10">
        <p className="text-[11px] text-brand-100/60 leading-relaxed">
          Proof-of-concept build running on dummy data, wired to swap in the live API.
        </p>
      </div>
    </aside>
  );
}
