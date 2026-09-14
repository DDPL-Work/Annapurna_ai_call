// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "ADMIN" | "CRM";
  is_active: boolean;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

/**
 * The deployed API has historically returned JWTs both at the top level and
 * nested under `tokens`.  Keep that transport detail at the API boundary; the
 * rest of the application always works with `AuthTokens` above.
 */
export interface AuthTokenResponse {
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
  tokens?: AuthTokenResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  email: string;
  otp: string;
  new_password: string;
  new_password_confirm: string;
}

// ─── Lead Types ───────────────────────────────────────────────────────────────

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Needs Human Follow-up"
  | "Follow-up Scheduled"
  | "Converted"
  | "Lost";

export type RequirementType = "Buy" | "Sell" | "Rent";

export type PropertyType =
  | "Apartment"
  | "Villa"
  | "Plot"
  | "Commercial"
  | "Independent House";

export type InterestLevel = "High" | "Medium" | "Low";

export interface Lead {
  id: string;
  display_id: string;
  name: string;
  mobile: string;
  email?: string;
  source: string;
  status: LeadStatus;
  requirement_type: RequirementType;
  property_type: PropertyType;
  requirement_formatted?: string;
  budget_min: number | null;
  budget_max: number | null;
  budget_formatted?: string;
  location: string;
  timeline?: string;
  interest_level: InterestLevel;
  assigned_to: number | null;
  assigned_to_name?: string;
  assigned_agent_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  next_follow_up_at: string | null;
}

export interface LeadListParams {
  search?: string;
  status?: LeadStatus;
  requirement_type?: RequirementType;
  assigned_to?: number;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface LeadListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Lead[];
}

export interface CreateLeadRequest {
  name: string;
  mobile: string;
  email?: string;
  requirement_type: RequirementType;
  property_type: PropertyType;
  budget_min?: number | null;
  budget_max?: number | null;
  location: string;
  timeline?: string;
  interest_level?: InterestLevel;
  assigned_to?: number | null;
  notes?: string;
}

export interface UpdateLeadRequest {
  status?: LeadStatus;
  assigned_to?: number | null;
  notes?: string;
  interest_level?: InterestLevel;
}

// ─── Call Types ───────────────────────────────────────────────────────────────

export type CallDirection = "Inbound" | "Outbound";

export type CallStatus = "Completed" | "Failed" | "InProgress" | "Missed";

export interface Call {
  id: string;
  display_id: string;
  call?: string;
  provider?: string;
  provider_call_id?: string;
  lead: string | null;
  lead_name?: string;
  direction: CallDirection;
  from_number: string;
  to_number?: string;
  status: CallStatus;
  duration_sec: number;
  duration_formatted?: string;
  started_at: string;
  ended_at?: string;
  recording_url?: string;
  recording_available: boolean;
  recording_status?: string;
  created_at: string;
}

export interface CallListParams {
  search?: string;
  status?: CallStatus;
  lead?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface CallListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Call[];
}

export interface TranscriptTurn {
  speaker: "AI" | "Customer" | "Agent";
  text: string;
  timestamp?: string;
}

export interface CallTranscript {
  call: string;
  turns: TranscriptTurn[];
  full_text: string;
}

export interface CallSummary {
  call?: string;
  requirement?: string;
  budget_text?: string;
  location?: string;
  interest_level?: InterestLevel;
  key_points?: string[];
  suggested_action?: string;
  follow_up_date?: string | null;
  raw_summary?: string;
}

// ─── Agent Types ──────────────────────────────────────────────────────────────

export interface Agent {
  id: number;
  username: string;
  name: string;
  role: string;
  active_leads_count: number;
  pending_followups_count: number;
  is_active: boolean;
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardOverview {
  total_leads: number;
  leads_today: number;
  qualified_leads: number;
  needs_human_followup: number;
  total_calls: number;
  calls_today: number;
  completed_calls: number;
  whatsapp_sent: number;
  whatsapp_failed: number;
  pending_followups: number;
}

export interface DashboardMetrics {
  overview: DashboardOverview;
  leads_by_status: Record<string, number>;
  call_volume_trend?: CallVolumeDay[];
  agent_workload?: AgentWorkloadItem[];
  
  // Computed fields for UI compatibility
  converted_leads: number;
  whatsapp_delivered: number;
  whatsapp_total: number;
  whatsapp_failed: number;
  total_calls_7d: number;
  completed_calls_7d: number;
  failed_calls_7d: number;
  avg_call_duration_sec: number;
  new_leads_today: number;
  conversion_rate: number;
}

export interface CallVolumeDay {
  day: string;
  date: string;
  total_calls: number;
  qualified_calls: number;
}

export interface AgentWorkloadItem {
  agent_id: number;
  agent_name: string;
  active_leads: number;
  pending_followups: number;
  completed_calls_7d: number;
}

// ─── Follow-up Types ──────────────────────────────────────────────────────────

export type FollowupType = "Call" | "WhatsApp" | "Email" | "Meeting";

export type FollowupStatus = "Pending" | "Completed" | "Missed" | "Cancelled";

export interface Followup {
  id: string;
  display_id: string;
  lead: string;
  lead_display_id?: string;
  lead_name: string;
  lead_mobile?: string;
  due_at: string;
  type: FollowupType;
  status: FollowupStatus;
  note: string;
  assigned_to: number | null;
  assigned_to_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FollowupListParams {
  status?: FollowupStatus;
  type?: FollowupType;
  search?: string;
  lead?: string | number;
  assigned_to?: number;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface FollowupListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Followup[];
}

// ─── WhatsApp Types ───────────────────────────────────────────────────────────

export type WhatsAppStatus =
  | "Sent"
  | "Delivered"
  | "Read"
  | "Failed"
  | "Pending";

export interface WhatsAppMessage {
  id: string;
  display_id: string;
  lead: string;
  lead_name: string;
  template: string;
  body: string;
  status: WhatsAppStatus;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  failure_reason?: string;
  created_at: string;
}

export interface WhatsAppListParams {
  status?: WhatsAppStatus;
  lead?: string | number;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface WhatsAppListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WhatsAppMessage[];
}

// ─── API Error Types ──────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Needs Human Follow-up",
  "Follow-up Scheduled",
  "Converted",
  "Lost",
];

export const REQUIREMENT_TYPES: RequirementType[] = ["Buy", "Sell", "Rent"];

export const PROPERTY_TYPES: PropertyType[] = [
  "Apartment",
  "Villa",
  "Plot",
  "Commercial",
  "Independent House",
];

export const INTEREST_LEVELS: InterestLevel[] = ["High", "Medium", "Low"];

export const CALL_STATUSES: CallStatus[] = [
  "Completed",
  "Failed",
  "InProgress",
  "Missed",
];

export const FOLLOWUP_STATUSES: FollowupStatus[] = [
  "Pending",
  "Completed",
  "Missed",
  "Cancelled",
];

export const WHATSAPP_STATUSES: WhatsAppStatus[] = [
  "Sent",
  "Delivered",
  "Read",
  "Failed",
  "Pending",
];
