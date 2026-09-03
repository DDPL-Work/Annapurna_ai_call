import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CURRENT_USER } from "../../data/dummyData";

export default function Topbar({ title, subtitle }) {
  const navigate = useNavigate();
  const initials = CURRENT_USER.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <header className="flex items-center justify-between gap-4 border-b border-line bg-paper/90 backdrop-blur px-6 md:px-8 py-5 sticky top-0 z-10">
      <div>
        <h1 className="font-display text-2xl text-ink leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search leads, calls, numbers"
            className="input pl-9 py-2 w-64 text-sm"
          />
        </div>
        <button onClick={() => navigate("/leads/new")} className="btn-primary">
          <Plus size={15} />
          New lead
        </button>
        <div className="h-9 w-9 rounded-full bg-brand-500 text-white text-xs font-semibold flex items-center justify-center">
          {initials}
        </div>
      </div>
    </header>
  );
}
