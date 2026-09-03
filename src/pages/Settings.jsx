import { AGENTS, CURRENT_USER } from "../data/dummyData";

export default function Settings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="card p-5">
        <h2 className="font-display text-lg text-ink mb-1">Workspace</h2>
        <p className="text-sm text-muted mb-4">Basic details about this CRM instance.</p>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-line pb-2">
            <span className="text-muted">Organization</span>
            <span className="text-ink font-medium">{CURRENT_USER.org}</span>
          </div>
          <div className="flex justify-between border-b border-line pb-2">
            <span className="text-muted">Primary language</span>
            <span className="text-ink font-medium">Hindi / Hinglish</span>
          </div>
          <div className="flex justify-between border-b border-line pb-2">
            <span className="text-muted">Telephony provider</span>
            <span className="text-ink font-medium">Exotel (configured)</span>
          </div>
          <div className="flex justify-between border-b border-line pb-2">
            <span className="text-muted">Voice AI provider</span>
            <span className="text-ink font-medium">ElevenLabs (configured)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">WhatsApp Business API</span>
            <span className="text-ink font-medium">Connected</span>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-display text-lg text-ink mb-1">Agents</h2>
        <p className="text-sm text-muted mb-4">People who can be assigned leads and follow-ups.</p>
        <div className="space-y-3">
          {AGENTS.map((agent) => (
            <div key={agent.id} className="flex items-center gap-3 rounded-sm border border-line px-4 py-3">
              <div className="h-9 w-9 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold flex items-center justify-center shrink-0">
                {agent.name.split(" ").map((p) => p[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{agent.name}</p>
                <p className="text-xs text-muted">{agent.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 lg:col-span-2">
        <h2 className="font-display text-lg text-ink mb-1">AI qualification flow</h2>
        <p className="text-sm text-muted mb-4">
          The sequence the AI assistant follows to qualify a caller before handing off to CRM.
        </p>
        <ol className="flex flex-wrap gap-2 text-xs">
          {["Greeting", "Intent (Buy/Sell/Rent)", "Property type", "Budget", "Location", "Timeline", "Confirmation", "Complete"].map(
            (step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-sm border border-line px-2.5 py-1.5 text-ink bg-paper">{step}</span>
                {i < 7 && <span className="text-muted">→</span>}
              </li>
            )
          )}
        </ol>
      </div>
    </div>
  );
}
