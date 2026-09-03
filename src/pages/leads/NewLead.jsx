import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addLead } from "../../store/leadsSlice";
import { showToast } from "../../store/uiSlice";
import { REQUIREMENT_TYPES, PROPERTY_TYPES } from "../../data/dummyData";

const EMPTY = {
  name: "",
  mobile: "",
  requirementType: "Buy",
  propertyType: "Apartment",
  budgetMin: "",
  budgetMax: "",
  location: "",
  timeline: "",
  interestLevel: "Medium",
};

export default function NewLead() {
  const [form, setForm] = useState(EMPTY);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      addLead({
        ...form,
        budgetMin: Number(form.budgetMin) || null,
        budgetMax: Number(form.budgetMax) || null,
      })
    );
    dispatch(showToast({ tone: "success", message: `Lead for ${form.name} created` }));
    navigate("/leads");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl card p-6 space-y-5">
      <div>
        <h2 className="font-display text-lg text-ink">Add a lead manually</h2>
        <p className="text-sm text-muted mt-1">
          Use this when a requirement comes in outside the AI calling flow — a walk-in, referral, or
          a call the assistant couldn't complete.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Customer name</label>
          <input required className="input" value={form.name} onChange={update("name")} placeholder="Full name" />
        </div>
        <div>
          <label className="label">Mobile number</label>
          <input required className="input" value={form.mobile} onChange={update("mobile")} placeholder="+91 98xxx xxxxx" />
        </div>
        <div>
          <label className="label">Requirement</label>
          <select className="input" value={form.requirementType} onChange={update("requirementType")}>
            {REQUIREMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Property type</label>
          <select className="input" value={form.propertyType} onChange={update("propertyType")}>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Budget min (₹)</label>
          <input type="number" className="input" value={form.budgetMin} onChange={update("budgetMin")} placeholder="e.g. 5000000" />
        </div>
        <div>
          <label className="label">Budget max (₹)</label>
          <input type="number" className="input" value={form.budgetMax} onChange={update("budgetMax")} placeholder="e.g. 7000000" />
        </div>
        <div>
          <label className="label">Preferred location</label>
          <input required className="input" value={form.location} onChange={update("location")} placeholder="Area, city" />
        </div>
        <div>
          <label className="label">Timeline</label>
          <input className="input" value={form.timeline} onChange={update("timeline")} placeholder="e.g. 1-3 months" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn-primary">
          Create lead
        </button>
        <button type="button" onClick={() => navigate("/leads")} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
