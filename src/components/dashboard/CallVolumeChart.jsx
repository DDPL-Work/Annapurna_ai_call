export default function CallVolumeChart({ data }) {
  const max = Math.max(...data.map((d) => d.calls));

  return (
    <div>
      <div className="flex items-end gap-4 h-36">
        {data.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
            <div className="w-full flex items-end justify-center gap-1 h-full">
              <div
                className="w-2.5 rounded-t-sm bg-brand-100"
                style={{ height: `${(d.calls / max) * 100}%` }}
                title={`${d.calls} calls`}
              />
              <div
                className="w-2.5 rounded-t-sm bg-brand-500"
                style={{ height: `${(d.qualified / max) * 100}%` }}
                title={`${d.qualified} qualified`}
              />
            </div>
            <span className="text-[11px] text-muted pt-1">{d.day}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-brand-100 inline-block" /> Total calls
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-brand-500 inline-block" /> Qualified
        </span>
      </div>
    </div>
  );
}
