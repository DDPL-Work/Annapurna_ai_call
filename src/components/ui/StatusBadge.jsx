const STATUS_STYLES = {
  New: "bg-brand-50 text-brand-600 border-brand-100",
  Contacted: "bg-brass-100 text-brass-600 border-brass-300",
  Qualified: "bg-moss-100 text-moss-500 border-moss-100",
  "Needs Human Follow-up": "bg-brick-100 text-brick-600 border-brick-100",
  "Follow-up Scheduled": "bg-brass-100 text-brass-600 border-brass-300",
  Converted: "bg-brand-500 text-white border-brand-500",
  Lost: "bg-ink/5 text-muted border-line",
  Completed: "bg-moss-100 text-moss-500 border-moss-100",
  Failed: "bg-brick-100 text-brick-600 border-brick-100",
  Pending: "bg-brass-100 text-brass-600 border-brass-300",
  Missed: "bg-brick-100 text-brick-600 border-brick-100",
  Sent: "bg-brand-50 text-brand-600 border-brand-100",
  Delivered: "bg-moss-100 text-moss-500 border-moss-100",
  Read: "bg-brand-500 text-white border-brand-500",
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-ink/5 text-muted border-line";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${style}`}
    >
      {status}
    </span>
  );
}
