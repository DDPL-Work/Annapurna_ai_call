interface StatusBadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

interface StatusConfig {
  badge: string;
  dot: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  // Lead & Call Outcomes
  New: { badge: "bg-brand-50 text-brand-700 border-brand-200", dot: "bg-brand-500" },
  Contacted: { badge: "bg-gold-100 text-gold-700 border-gold-300", dot: "bg-gold-500" },
  Qualified: { badge: "bg-moss-100 text-moss-600 border-moss-200", dot: "bg-moss-500" },
  "Needs Human Follow-up": { badge: "bg-brass-100 text-brass-700 border-brass-300", dot: "bg-brass-500" },
  "Follow-up Scheduled": { badge: "bg-gold-100 text-gold-700 border-gold-300", dot: "bg-gold-500" },
  Converted: { badge: "bg-brand-600 text-white border-brand-600", dot: "bg-gold-400" },
  Lost: { badge: "bg-surface-muted text-muted border-line", dot: "bg-muted" },
  
  // Call & Task Statuses
  Completed: { badge: "bg-moss-100 text-moss-600 border-moss-200", dot: "bg-moss-500" },
  Failed: { badge: "bg-brick-100 text-brick-700 border-brick-300", dot: "bg-brick-500" },
  Pending: { badge: "bg-gold-100 text-gold-700 border-gold-300", dot: "bg-gold-500" },
  Missed: { badge: "bg-brick-100 text-brick-700 border-brick-300", dot: "bg-brick-500" },
  InProgress: { badge: "bg-gold-100 text-gold-700 border-gold-300", dot: "bg-gold-500 animate-pulse" },
  Overdue: { badge: "bg-brick-100 text-brick-700 border-brick-300", dot: "bg-brick-500" },
  
  // WhatsApp Statuses
  Sent: { badge: "bg-brand-50 text-brand-700 border-brand-200", dot: "bg-brand-500" },
  Delivered: { badge: "bg-moss-100 text-moss-600 border-moss-200", dot: "bg-moss-500" },
  Read: { badge: "bg-brand-600 text-white border-brand-600", dot: "bg-gold-400" },
  "awaiting approval": { badge: "bg-gold-100 text-gold-700 border-gold-300", dot: "bg-gold-500" },
  
  // Types & Generic
  Call: { badge: "bg-brand-50 text-brand-700 border-brand-200", dot: "bg-brand-500" },
  WhatsApp: { badge: "bg-moss-50 text-moss-600 border-moss-200", dot: "bg-moss-500" },
  Email: { badge: "bg-surface-muted text-muted border-line", dot: "bg-muted" },
  Meeting: { badge: "bg-brass-100 text-brass-700 border-brass-300", dot: "bg-brass-500" },
};

const DEFAULT_CONFIG: StatusConfig = {
  badge: "bg-surface-muted text-muted border-line",
  dot: "bg-muted",
};

export default function StatusBadge({ status, className = "", showDot = true }: StatusBadgeProps) {
  const config = STATUS_CONFIGS[status] || DEFAULT_CONFIG;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${config.badge} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${config.dot}`} />}
      {status}
    </span>
  );
}

