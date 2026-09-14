interface ChartData {
  day: string;
  calls: number;
  qualified: number;
}

interface CallVolumeChartProps {
  data: ChartData[];
}

export default function CallVolumeChart({ data }: CallVolumeChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted text-center py-8">No call data available</p>;
  }

  const maxVal = Math.max(5, ...data.map((d) => Math.max(d.calls, d.qualified)));

  return (
    <div className="space-y-4">
      {/* ─── Legend ─── */}
      <div className="flex items-center gap-6 text-xs text-muted font-medium">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-xs bg-brand-100 border border-brand-300 inline-block" />
          AI Answered Calls
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-xs bg-brand-600 inline-block" />
          Qualified Outcomes
        </span>
      </div>

      {/* ─── Responsive Bar Graphic ─── */}
      <div className="relative w-full overflow-hidden pt-2">
        <svg
          viewBox="0 0 560 190"
          className="w-full h-48 overflow-visible"
          role="img"
          aria-label="Bar chart showing inbound calls answered by AI versus qualified outcomes over seven days"
        >
          {/* Horizontal Grid Lines */}
          <line x1="0" y1="20" x2="560" y2="20" stroke="#E9EEEA" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="75" x2="560" y2="75" stroke="#E9EEEA" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="130" x2="560" y2="130" stroke="#E9EEEA" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="150" x2="560" y2="150" stroke="#DCE2DD" strokeWidth="1.5" />

          {data.map((d, i) => {
            const groupWidth = 78;
            const x = 14 + i * groupWidth;
            const maxBarHeight = 120;
            const callsHeight = Math.max(d.calls > 0 ? 6 : 0, (d.calls / maxVal) * maxBarHeight);
            const qualifiedHeight = Math.max(d.qualified > 0 ? 6 : 0, (d.qualified / maxVal) * maxBarHeight);

            const callsY = 150 - callsHeight;
            const qualifiedY = 150 - qualifiedHeight;

            return (
              <g key={d.day} className="group cursor-pointer">
                {/* AI Answered Bar */}
                <rect
                  x={x}
                  y={callsY}
                  width={24}
                  height={callsHeight}
                  rx={3}
                  fill="#D7E4DC"
                  className="transition-all group-hover:fill-brand-200"
                />
                {/* Qualified Bar */}
                <rect
                  x={x + 28}
                  y={qualifiedY}
                  width={24}
                  height={qualifiedHeight}
                  rx={3}
                  fill="#0B3B2E"
                  className="transition-all group-hover:fill-brand-500"
                />

                {/* Bar Value Labels */}
                {d.calls > 0 && (
                  <text
                    x={x + 12}
                    y={callsY - 5}
                    fontSize="10"
                    fontWeight="600"
                    fill="#66756E"
                    textAnchor="middle"
                  >
                    {d.calls}
                  </text>
                )}
                {d.qualified > 0 && (
                  <text
                    x={x + 40}
                    y={qualifiedY - 5}
                    fontSize="10"
                    fontWeight="600"
                    fill="#0B3B2E"
                    textAnchor="middle"
                  >
                    {d.qualified}
                  </text>
                )}

                {/* Day Axis Label */}
                <text
                  x={x + 26}
                  y={172}
                  fontSize="11"
                  fontWeight="600"
                  fill="#14201B"
                  textAnchor="middle"
                >
                  {d.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

