import type { Call } from "../api/types";

export interface CallVolumePoint {
  date: string;
  dateKey: string;
  answered: number;
  qualified: number;
}

function getLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function transformCallsToChartData(calls: Call[]): CallVolumePoint[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const dateMap = new Map<string, { answered: number; qualified: number }>();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = getLocalDateKey(d);
    dateMap.set(key, { answered: 0, qualified: 0 });
  }

  for (const call of calls) {
    if (!call.started_at) continue;
    
    const startedAt = new Date(call.started_at);
    if (isNaN(startedAt.getTime())) continue;
    
    const key = getLocalDateKey(startedAt);
    if (!dateMap.has(key)) continue;
    
    const isAnsweredInbound = call.direction === "Inbound" && call.status === "Completed";
    const isQualified = false;
    
    if (isAnsweredInbound) {
      const entry = dateMap.get(key)!;
      entry.answered += 1;
    }
    if (isQualified) {
      const entry = dateMap.get(key)!;
      entry.qualified += 1;
    }
  }

  const result: CallVolumePoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = getLocalDateKey(d);
    const data = dateMap.get(key) ?? { answered: 0, qualified: 0 };
    result.push({
      date: formatDayLabel(d),
      dateKey: key,
      answered: data.answered,
      qualified: data.qualified,
    });
  }

  return result;
}

export function isCallAnswered(call: Call): boolean {
  return call.direction === "Inbound" && call.status === "Completed";
}

export function isCallQualified(call: Call): boolean {
  return false;
}