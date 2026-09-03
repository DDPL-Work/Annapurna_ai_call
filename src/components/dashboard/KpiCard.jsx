export default function KpiCard({ label, value, delta, deltaTone = "positive", icon: Icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted">{label}</p>
        {Icon && (
          <div className="h-8 w-8 rounded-sm bg-brand-50 flex items-center justify-center">
            <Icon size={16} className="text-brand-500" strokeWidth={2} />
          </div>
        )}
      </div>
      <p className="font-display text-3xl text-ink mt-2">{value}</p>
      {delta && (
        <p className={`text-xs mt-1.5 ${deltaTone === "positive" ? "text-moss-500" : "text-brick-500"}`}>
          {delta}
        </p>
      )}
    </div>
  );
}
