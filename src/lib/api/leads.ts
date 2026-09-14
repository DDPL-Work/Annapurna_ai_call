import { apiGet, apiPost, apiPatch } from "./client";
import type {
  Lead,
  LeadListResponse,
  LeadListParams,
  CreateLeadRequest,
  UpdateLeadRequest,
} from "./types";

export const leadsApi = {
  async list(params?: LeadListParams): Promise<LeadListResponse> {
    const response = await apiGet<LeadListResponse | Lead[]>(
      "/api/v1/leads/",
      params as Record<string, string | number | boolean | undefined | null>
    );
    return toPaginatedResponse(response);
  },

  get(displayId: string): Promise<Lead> {
    return apiGet<Lead>(`/api/v1/leads/${displayId}/`);
  },

  create(data: CreateLeadRequest): Promise<Lead> {
    return apiPost<Lead>("/api/v1/leads/", data);
  },

  update(displayId: string, data: UpdateLeadRequest): Promise<Lead> {
    return apiPatch<Lead>(`/api/v1/leads/${displayId}/`, data);
  },
};

function toPaginatedResponse(response: LeadListResponse | Lead[]): LeadListResponse {
  if (Array.isArray(response)) {
    return { count: response.length, next: null, previous: null, results: response };
  }

  return {
    count: response.count ?? 0,
    next: response.next ?? null,
    previous: response.previous ?? null,
    results: Array.isArray(response.results) ? response.results : [],
  };
}
