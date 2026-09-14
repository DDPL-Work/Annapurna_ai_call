import { apiGet } from "./client";
import type {
  Call,
  CallListResponse,
  CallListParams,
  CallTranscript,
  CallSummary,
} from "./types";

export const callsApi = {
  async list(params?: CallListParams): Promise<CallListResponse> {
    const response = await apiGet<CallListResponse | Call[]>(
      "/api/v1/calls/",
      params as Record<string, string | number | boolean | undefined | null>
    );
    return toPaginatedResponse(response);
  },

  get(displayId: string): Promise<Call> {
    return apiGet<Call>(`/api/v1/calls/${displayId}/`);
  },

  async getTranscript(displayId: string): Promise<CallTranscript> {
    const response = await apiGet<Partial<CallTranscript>>(
      `/api/v1/calls/${displayId}/transcript/`
    );
    return {
      call: response.call ?? displayId,
      turns: Array.isArray(response.turns) ? response.turns : [],
      full_text: typeof response.full_text === "string" ? response.full_text : "",
    };
  },

  async getSummary(displayId: string): Promise<CallSummary> {
    return apiGet<CallSummary>(
      `/api/v1/calls/${displayId}/summary/`
    );
  },
};

function toPaginatedResponse(response: CallListResponse | Call[]): CallListResponse {
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
