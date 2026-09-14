import { apiGet, apiPost } from "./client";
import type { Agent, PaginatedResponse } from "./types";

type AgentResponse = Partial<Agent> & {
  display_name?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
};

export const agentsApi = {
  async list(): Promise<Agent[]> {
    const response = await apiGet<
      AgentResponse[] | PaginatedResponse<AgentResponse>
    >("/api/v1/agents/");
    // Handle both paginated and non-paginated responses
    const agents = Array.isArray(response) ? response : response.results;
    return Array.isArray(agents) ? agents.map(toAgent) : [];
  },

  async activate(id: number | string): Promise<Agent> {
    const response = await apiPost<AgentResponse>(`/api/v1/agents/${id}/activate/`);
    return toAgent(response);
  },

  async deactivate(id: number | string): Promise<Agent> {
    const response = await apiPost<AgentResponse>(`/api/v1/agents/${id}/deactivate/`);
    return toAgent(response);
  },
};

function toAgent(agent: AgentResponse): Agent {
  const fullName = [agent.first_name, agent.last_name]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ");

  return {
    id: agent.id ?? 0,
    username: agent.username ?? "",
    name:
      agent.name?.trim() ||
      agent.display_name?.trim() ||
      fullName ||
      agent.username ||
      "Unassigned agent",
    role: agent.role ?? "CRM",
    active_leads_count: agent.active_leads_count ?? 0,
    pending_followups_count: agent.pending_followups_count ?? 0,
    is_active: agent.is_active ?? true,
  };
}
