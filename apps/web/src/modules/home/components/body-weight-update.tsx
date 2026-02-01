import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { updateBodyWeight } from "@/modules/home/services/dashboard.service";

export function BodyWeightUpdate() {
  const [editing, setEditing] = useState(false);
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(weight);
    if (isNaN(value) || value <= 0) return;

    setSaving(true);
    try {
      await updateBodyWeight(value);
      setEditing(false);
      window.location.reload();
    } catch {
      // silently fail, user can retry
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="mt-2 flex items-center gap-1.5 text-xs text-amber-400"
      >
        <AlertTriangle className="size-3" />
        Outdated body weight — tap to update
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
      <input
        type="number"
        step="0.1"
        min="0"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder="Weight (kg)"
        className="w-24 rounded bg-surface-light px-2 py-1 text-xs text-text"
        autoFocus
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-primary px-2 py-1 text-xs font-medium text-text-on-primary disabled:opacity-50"
      >
        {saving ? "..." : "Save"}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="text-xs text-text-muted"
      >
        Cancel
      </button>
    </form>
  );
}
