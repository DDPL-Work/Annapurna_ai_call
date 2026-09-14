import { useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { createLead, selectLeadsLoading } from "../../store/leadsSlice";
import { showToast } from "../../store/uiSlice";
import type { AppDispatch } from "../../store/store";
import { REQUIREMENT_TYPES, PROPERTY_TYPES, INTEREST_LEVELS } from "../../lib/api/types";
import type { CreateLeadRequest } from "../../lib/api/types";

interface FormErrors {
  name?: string;
  mobile?: string;
  location?: string;
  budget_min?: string;
  budget_max?: string;
  [key: string]: string | undefined;
}

const EMPTY: CreateLeadRequest = {
  name: "",
  mobile: "",
  requirement_type: "Buy",
  property_type: "Apartment",
  budget_min: null,
  budget_max: null,
  location: "",
  timeline: "",
  interest_level: "Medium",
};

export default function NewLead() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isLoading = useSelector(selectLeadsLoading);
  const [form, setForm] = useState<CreateLeadRequest>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [duplicateError, setDuplicateError] = useState<{ message: string; leadId?: string } | null>(null);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.mobile.trim()) {
      errs.mobile = "Mobile number is required";
    } else if (!/^\+?[\d\s-]{10,15}$/.test(form.mobile.replace(/\s/g, ""))) {
      errs.mobile = "Enter a valid mobile number (10-15 digits)";
    }
    if (!form.location.trim()) errs.location = "Location is required";
    if (form.budget_min != null && form.budget_max != null) {
      if (form.budget_min > form.budget_max) {
        errs.budget_max = "Maximum budget must be greater than minimum";
      }
    }
    if (form.budget_min != null && form.budget_min < 0) {
      errs.budget_min = "Budget cannot be negative";
    }
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setDuplicateError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await dispatch(
      createLead({
        ...form,
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        location: form.location.trim(),
        timeline: form.timeline?.trim() || undefined,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
      })
    );

    if (createLead.fulfilled.match(result)) {
      dispatch(showToast({ tone: "success", message: `Enquiry for ${form.name} created successfully` }));
      navigate(`/leads/${result.payload.id}`);
    } else if (createLead.rejected.match(result)) {
      const payload = result.payload;
      if (payload?.status === 409) {
        setDuplicateError({
          message: payload.message || "An enquiry with this mobile number already exists",
          leadId: payload.errors?.lead_id?.[0],
        });
      } else if (payload?.errors) {
        const fieldErrors: FormErrors = {};
        for (const [key, messages] of Object.entries(payload.errors)) {
          if (messages.length > 0) {
            (fieldErrors as Record<string, string>)[key] = messages[0];
          }
        }
        setErrors(fieldErrors);
      } else {
        dispatch(showToast({ tone: "error", message: payload?.message || "Failed to create enquiry" }));
      }
    }
  };

  const update = (key: keyof CreateLeadRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="max-w-3xl space-y-4 animate-in">
      <button
        onClick={() => navigate("/leads")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={14} /> Back to Enquiries
      </button>

      <form onSubmit={handleSubmit} className="card p-7 space-y-6">
        <div className="pb-4 border-b border-line">
          <h2 className="text-xl font-extrabold text-ink tracking-tight">Manual Enquiry Capture</h2>
          <p className="text-xs text-muted mt-1">
            Capture a prospect requirement received via direct walk-in, office phone referral, or offline source.
          </p>
          <div className="text-xs text-brand-700 bg-brand-50 border border-brand-200/80 px-3.5 py-2.5 rounded-md font-medium flex items-center gap-2 mt-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span>Automated Allocation: Newly captured enquiries are automatically assigned to active CRM advisors via the backend Round-Robin engine.</span>
          </div>
        </div>

        {/* ─── Duplicate Alert ─── */}
        {duplicateError && (
          <div className="rounded-md bg-gold-100 border border-gold-300 p-4 flex items-start gap-3 shadow-xs">
            <AlertTriangle size={18} className="text-gold-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-ink font-bold">Duplicate Enquiry Detected</p>
              <p className="text-xs text-ink/80 mt-0.5">{duplicateError.message}</p>
              {duplicateError.leadId && (
                <button
                  type="button"
                  onClick={() => navigate(`/leads/${duplicateError.leadId}`)}
                  className="text-xs text-brand-700 hover:underline mt-2 font-bold block"
                >
                  View Existing Prospect Profile →
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Customer Name *</label>
            <input
              className={`input text-xs ${errors.name ? "input-error" : ""}`}
              value={form.name}
              onChange={update("name")}
              placeholder="e.g. Manoj Thapliyal"
            />
            {errors.name && <p className="text-xs text-brick-600 font-medium mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Mobile Number *</label>
            <input
              className={`input text-xs ${errors.mobile ? "input-error" : ""}`}
              value={form.mobile}
              onChange={update("mobile")}
              placeholder="e.g. +91 94120 88431"
            />
            {errors.mobile && <p className="text-xs text-brick-600 font-medium mt-1">{errors.mobile}</p>}
          </div>
          <div>
            <label className="label">Requirement Type *</label>
            <select className="input text-xs" value={form.requirement_type} onChange={update("requirement_type")}>
              {REQUIREMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Property Type *</label>
            <select className="input text-xs" value={form.property_type} onChange={update("property_type")}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Budget Min (₹)</label>
            <input
              type="number"
              className={`input text-xs ${errors.budget_min ? "input-error" : ""}`}
              value={form.budget_min ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, budget_min: e.target.value ? Number(e.target.value) : null }))}
              placeholder="e.g. 6500000 (65 Lakhs)"
              min="0"
            />
            {errors.budget_min && <p className="text-xs text-brick-600 font-medium mt-1">{errors.budget_min}</p>}
          </div>
          <div>
            <label className="label">Budget Max (₹)</label>
            <input
              type="number"
              className={`input text-xs ${errors.budget_max ? "input-error" : ""}`}
              value={form.budget_max ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, budget_max: e.target.value ? Number(e.target.value) : null }))}
              placeholder="e.g. 7500000 (75 Lakhs)"
              min="0"
            />
            {errors.budget_max && <p className="text-xs text-brick-600 font-medium mt-1">{errors.budget_max}</p>}
          </div>
          <div>
            <label className="label">Preferred Locality / Area *</label>
            <input
              className={`input text-xs ${errors.location ? "input-error" : ""}`}
              value={form.location}
              onChange={update("location")}
              placeholder="e.g. Sahastradhara Road, Dehradun"
            />
            {errors.location && <p className="text-xs text-brick-600 font-medium mt-1">{errors.location}</p>}
          </div>
          <div>
            <label className="label">Possession Timeline</label>
            <input
              className="input text-xs"
              value={form.timeline ?? ""}
              onChange={update("timeline")}
              placeholder="e.g. Within 2 months, Diwali"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Buyer Intent Level</label>
            <select className="input text-xs" value={form.interest_level ?? "Medium"} onChange={update("interest_level")}>
              {INTEREST_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-line justify-end">
          <button
            type="button"
            onClick={() => navigate("/leads")}
            className="btn-secondary text-xs font-semibold px-4"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary text-xs font-semibold px-5" disabled={isLoading}>
            {isLoading ? "Saving..." : "Create Enquiry"}
          </button>
        </div>
      </form>
    </div>
  );
}

