import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bot, Phone, Languages, Mic, Brain, ArrowRightLeft, Info, Settings as SettingsIcon, Building2, Users, ShieldCheck, ListChecks, UserCheck } from "lucide-react";
import { fetchAgents, selectAgents } from "../store/dashboardSlice";
import { selectAuthUser } from "../store/authSlice";
import type { AppDispatch } from "../store/store";
import EmptyState from "../components/ui/EmptyState";

interface SettingRowProps {
  label: string;
  value: string;
  description?: string;
}

function SettingRow({ label, value, description }: SettingRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3.5 border-b border-line last:border-0">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      <span className="inline-flex items-center rounded-md bg-paper border border-line/80 px-2.5 py-1 text-xs font-mono font-medium text-ink shadow-2xs sm:text-right shrink-0">
        {value}
      </span>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200/50">
            <Icon size={18} />
          </div>
          <h2 className="font-display text-lg text-ink font-bold">{title}</h2>
        </div>
        <p className="text-xs text-muted mb-5 leading-relaxed">{description}</p>
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectAuthUser);
  const agents = useSelector(selectAgents);

  useEffect(() => {
    dispatch(fetchAgents());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div>
        <h1 className="section-title flex items-center gap-2.5">
          <SettingsIcon className="text-brand-600" size={24} />
          System Settings &amp; Configuration
        </h1>
        <p className="text-sm text-muted mt-1">
          CRM workspace settings, AI calling agent workflow, and human handover parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Workspace ─── */}
        <SettingsSection
          title="Workspace Parameters"
          description="General tenant metadata and language settings for Annpurna Properties."
          icon={Building2}
        >
          <div className="space-y-0">
            <SettingRow label="Organization" value={user?.email || "Annpurna Properties"} />
            <SettingRow
              label="Active User Account"
              value={`${user?.first_name || user?.username || "Admin"} (${user?.role || "Manager"})`}
            />
            <SettingRow
              label="Primary Dialect"
              value="Hindi / Hinglish"
              description="Default conversational voice language for outbound and inbound calls."
            />
          </div>
        </SettingsSection>

        {/* ─── Agents ─── */}
        <SettingsSection
          title="CRM Sales Agents"
          description="Advisors available for automated lead distribution and human callbacks."
          icon={Users}
        >
          <div className="space-y-2.5">
            {agents.length === 0 ? (
              <EmptyState
                title="No agents configured"
                description="Agents will appear here once added to the system."
              />
            ) : (
              agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 rounded-lg border border-line bg-paper/50 px-3.5 py-2.5 transition-colors hover:bg-paper"
                >
                  <div className="h-8 w-8 rounded-full bg-brand-900 text-gold-400 font-display text-xs font-semibold flex items-center justify-center shrink-0 border border-gold-400/30">
                    {agent.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{agent.name}</p>
                    <p className="text-xs text-muted">{agent.role}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                      agent.is_active
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-surface text-muted border-line"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        agent.is_active ? "bg-emerald-500" : "bg-muted"
                      }`}
                    />
                    {agent.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))
            )}
          </div>
        </SettingsSection>

        {/* ─── AI Voice Agent ─── */}
        <SettingsSection
          title="AI Voice Agent Configuration"
          description="Parameters powering Sarvam Telephony & LLM Voice Assistant."
          icon={Bot}
        >
          <div className="space-y-0">
            <SettingRow
              label="AI Speech &amp; Telephony Provider"
              value="Sarvam AI"
              description="Real-time speech synthesis, ASR, and voice streaming engine."
            />
            <SettingRow
              label="Primary Voice Persona"
              value="Hindi Enterprise Female"
              description="Polite, professional real estate advisor voice."
            />
            <SettingRow
              label="LLM Reasoning Engine"
              value="Sarvam 2B Custom Real Estate"
              description="Low-latency model tuned for property budget & location extraction."
            />
            <SettingRow
              label="Max Silence Duration"
              value="2.5s Auto-Prompt"
              description="Triggers AI clarification prompt when user pauses."
            />
          </div>
        </SettingsSection>

        {/* ─── Call Qualification Workflow ─── */}
        <SettingsSection
          title="AI Call Qualification Pipeline"
          description="Structured multi-step workflow enforced during AI customer calls."
          icon={ListChecks}
        >
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm text-ink p-2.5 rounded-lg bg-paper/60 border border-line/60">
              <div className="h-6 w-6 rounded-md bg-brand-900 text-gold-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-semibold text-xs text-ink uppercase tracking-wider">Greeting &amp; Verification</p>
                <p className="text-xs text-muted">AI introduces Annpurna Properties and verifies customer identity.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm text-ink p-2.5 rounded-lg bg-paper/60 border border-line/60">
              <div className="h-6 w-6 rounded-md bg-brand-900 text-gold-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-semibold text-xs text-ink uppercase tracking-wider">Intent &amp; Requirement Capture</p>
                <p className="text-xs text-muted">Detects Buying vs Renting, BHK preference, budget range, and preferred locality.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm text-ink p-2.5 rounded-lg bg-paper/60 border border-line/60">
              <div className="h-6 w-6 rounded-md bg-brand-900 text-gold-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-semibold text-xs text-ink uppercase tracking-wider">Property Matching &amp; Handoff</p>
                <p className="text-xs text-muted">Matches available inventory, triggers WhatsApp brochure, or schedules human agent callback.</p>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* ─── Human Handover & Escalation ─── */}
        <SettingsSection
          title="Human Handover &amp; Escalation"
          description="Rules governing automated routing to human sales advisors."
          icon={UserCheck}
        >
          <div className="space-y-0">
            <SettingRow
              label="Handover Triggers"
              value="High Intent / Site Visit Request"
              description="Automatically flags lead for urgent human follow-up."
            />
            <SettingRow
              label="Fallback Stage"
              value="Needs Human Follow-up"
              description="Pipeline stage assigned when customer requests human agent."
            />
            <SettingRow
              label="Notification Channel"
              value="CRM Alert &amp; In-app Toast"
              description="Pings assigned agent immediately upon call completion."
            />
          </div>
        </SettingsSection>

        {/* ─── Round-Robin Lead Allocation Engine ─── */}
        <SettingsSection
          title="Round-Robin Lead Allocation Engine"
          description="Automated backend distribution algorithm balancing lead volume across team."
          icon={Users}
        >
          <div className="space-y-0">
            <SettingRow
              label="Allocation Strategy"
              value="Sequential Round-Robin"
              description="Equally distributes incoming leads across active CRM agents."
            />
            <SettingRow
              label="Queue Qualification"
              value="Active Agents Only"
              description="Inactive/paused agents are dynamically excluded from distribution."
            />
            <SettingRow
              label="Agent Management API"
              value="POST /api/v1/agents/{id}/activate/"
              description="Endpoints for toggling agent rotation status."
            />
          </div>
        </SettingsSection>

        {/* ─── Backend API Requirements ─── */}
        <div className="card p-6 lg:col-span-2 border-l-4 border-l-brand-600 bg-linear-to-r from-brand-50/30 to-paper">
          <div className="flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5 border border-brand-200/60">
              <Info size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">
                Backend API Architecture for CRM &amp; Agent Allocation
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                The active backend environment includes the following REST endpoints for agents &amp; lead management:
              </p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-md bg-paper p-3 border border-line text-xs font-mono text-ink">
                  <span className="text-brand-600 font-bold">GET</span> /api/v1/agents/
                  <p className="text-muted text-[11px] font-sans mt-1">List active agents &amp; workloads</p>
                </div>
                <div className="rounded-md bg-paper p-3 border border-line text-xs font-mono text-ink">
                  <span className="text-emerald-600 font-bold">POST</span> /api/v1/agents/{`{id}`}/activate/
                  <p className="text-muted text-[11px] font-sans mt-1">Enable agent for Round-Robin</p>
                </div>
                <div className="rounded-md bg-paper p-3 border border-line text-xs font-mono text-ink">
                  <span className="text-brick-600 font-bold">POST</span> /api/v1/agents/{`{id}`}/deactivate/
                  <p className="text-muted text-[11px] font-sans mt-1">Pause agent from rotation</p>
                </div>
                <div className="rounded-md bg-paper p-3 border border-line text-xs font-mono text-ink">
                  <span className="text-amber-600 font-bold">GET</span> /api/v1/dashboard/metrics/
                  <p className="text-muted text-[11px] font-sans mt-1">Real-time metrics &amp; workload</p>
                </div>
              </div>
              <p className="text-xs text-muted mt-3 italic">
                Note: Lead allocation is managed entirely via the backend Round-Robin engine upon lead creation/handoff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

