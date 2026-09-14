import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  tone?: "default" | "positive" | "negative" | "warning";
  icon?: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  onClick?: () => void;
  action?: ReactNode;
  trend?: string;
}

const TONE_CLASSES: Record<string, { value: string; subtitle: string; iconBg: string; iconColor: string }> = {
  default: {
    value: "text-ink",
    subtitle: "text-muted",
    iconBg: "bg-brand-50 text-brand-700 border-brand-100",
    iconColor: "text-brand-600",
  },
  positive: {
    value: "text-ink",
    subtitle: "text-moss-600 font-medium",
    iconBg: "bg-moss-50 text-moss-600 border-moss-100",
    iconColor: "text-moss-600",
  },
  negative: {
    value: "text-ink",
    subtitle: "text-brick-600 font-medium",
    iconBg: "bg-brick-50 text-brick-600 border-brick-100",
    iconColor: "text-brick-600",
  },
  warning: {
    value: "text-ink",
    subtitle: "text-brass-600 font-medium",
    iconBg: "bg-gold-100 text-gold-700 border-gold-300",
    iconColor: "text-gold-700",
  },
};

export default function MetricCard({
  label,
  value,
  subtitle,
  tone = "default",
  icon: Icon,
  onClick,
  action,
  trend,
}: MetricCardProps) {
  const toneClasses = TONE_CLASSES[tone] || TONE_CLASSES.default;

  return (
    <div
      className={`card p-5 ${
        onClick
          ? "cursor-pointer hover:border-brand-300 hover:shadow-card-hover active:scale-[0.99] transition-all"
          : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          {Icon && (
            <div className={`h-8 w-8 rounded-sm border flex items-center justify-center ${toneClasses.iconBg}`}>
              <Icon size={16} className={toneClasses.iconColor} strokeWidth={2} />
            </div>
          )}
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-2 mt-3">
        <p className="text-3xl font-extrabold tracking-tight text-ink tabular-nums">{value}</p>
        {trend && (
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700">
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className={`text-xs mt-1.5 ${toneClasses.subtitle}`}>{subtitle}</p>}
    </div>
  );
}

