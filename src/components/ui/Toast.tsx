import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { selectToast, clearToast } from "../../store/uiSlice";
import type { AppDispatch } from "../../store/store";

const TONE_CONFIG = {
  success: {
    icon: CheckCircle,
    bg: "bg-moss-100 border-moss-200",
    text: "text-moss-700",
    iconColor: "text-moss-500",
  },
  error: {
    icon: AlertTriangle,
    bg: "bg-brick-100 border-brick-200",
    text: "text-brick-700",
    iconColor: "text-brick-500",
  },
  info: {
    icon: Info,
    bg: "bg-brand-50 border-brand-100",
    text: "text-brand-700",
    iconColor: "text-brand-500",
  },
};

export default function Toast() {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useSelector(selectToast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  if (!toast) return null;

  const config = TONE_CONFIG[toast.tone];
  const Icon = config.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
      <div
        className={`flex items-center gap-3 rounded-sm border px-4 py-3 shadow-lg ${config.bg}`}
      >
        <Icon size={16} className={config.iconColor} />
        <p className={`text-sm font-medium ${config.text}`}>{toast.message}</p>
        <button
          onClick={() => dispatch(clearToast())}
          className={`ml-2 ${config.text} hover:opacity-70 transition-opacity`}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
