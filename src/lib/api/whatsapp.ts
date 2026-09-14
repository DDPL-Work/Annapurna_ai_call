import { apiGet, apiPost } from "./client";
import type { WhatsAppListResponse, WhatsAppListParams, WhatsAppMessage } from "./types";

export const whatsappApi = {
  list(params?: WhatsAppListParams): Promise<WhatsAppListResponse> {
    return apiGet<WhatsAppListResponse>(
      "/api/v1/whatsapp/",
      params as Record<string, string | number | boolean | undefined | null>
    );
  },

  resend(displayId: string): Promise<WhatsAppMessage> {
    return apiPost<WhatsAppMessage>(`/api/v1/whatsapp/${displayId}/resend/`);
  },
};
