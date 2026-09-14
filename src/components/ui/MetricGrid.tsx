import type { ReactNode } from "react";

interface MetricGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

const COL_CLASSES = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export default function MetricGrid({ children, columns = 4 }: MetricGridProps) {
  return (
    <div className={`grid grid-cols-1 ${COL_CLASSES[columns]} gap-4`}>{children}</div>
  );
}
