import { apiGet } from "./client";
import type { Followup, FollowupListResponse, FollowupListParams } from "./types";

type FollowupResponse = Omit<Partial<Followup>, "type" | "assigned_to_name"> & {
  followup_type?: Followup["type"];
  assigned_to_name?: string | null;
};

export const followupsApi = {
  async list(params?: FollowupListParams): Promise<FollowupListResponse> {
    const response = await apiGet<
      { count?: number; next?: string | null; previous?: string | null; results?: FollowupResponse[] } | FollowupResponse[]
    >(
      "/api/v1/followups/",
      params as Record<string, string | number | boolean | undefined | null>
    );
    return toPaginatedResponse(response);
  },
};

function toPaginatedResponse(
  response: { count?: number; next?: string | null; previous?: string | null; results?: FollowupResponse[] } | FollowupResponse[]
): FollowupListResponse {
  if (Array.isArray(response)) {
    return { count: response.length, next: null, previous: null, results: response.map(normalizeFollowup) };
  }

  return {
    count: response.count ?? 0,
    next: response.next ?? null,
    previous: response.previous ?? null,
    results: Array.isArray(response.results) ? response.results.map(normalizeFollowup) : [],
  };
}

function normalizeFollowup(item: FollowupResponse): Followup {
  return {
    id: item.id ?? "",
    display_id: item.display_id ?? "",
    lead: item.lead ?? "",
    lead_display_id: item.lead_display_id,
    lead_name: item.lead_name ?? "",
    due_at: item.due_at ?? "",
    type: item.followup_type ?? "Call",
    status: item.status ?? "Pending",
    note: item.note ?? "",
    assigned_to: item.assigned_to ?? null,
    assigned_to_name: item.assigned_to_name ?? null,
    created_at: item.created_at ?? "",
    updated_at: item.updated_at ?? "",
  };
}
