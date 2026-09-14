import { apiGet } from "./client";
import type { DashboardMetrics } from "./types";

export const dashboardApi = {
  getMetrics(): Promise<DashboardMetrics> {
    return apiGet<DashboardMetrics>("/api/v1/dashboard/metrics/");
  },
};
