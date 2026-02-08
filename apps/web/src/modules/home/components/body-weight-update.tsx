import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { updateBodyWeight } from "@/modules/home/services/dashboard.service";

export function BodyWeightUpdate() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [weight, setWeight] = useState("");

  const mutation = useMutation({
    mutationFn: (value: number) => updateBodyWeight(value),
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["relative-strength"] });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(weight);
    if (isNaN(value) || value <= 0) return;
    mutation.mutate(value);
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="mt-2 flex items-center gap-1.5 text-xs text-amber-400"
      >
        <AlertTriangle className="size-3" />
        Peso desatualizado — toque para atualizar
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
        placeholder="Peso (kg)"
        className="w-24 rounded bg-surface-light px-2 py-1 text-xs text-text"
        autoFocus
      />
      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded bg-primary px-2 py-1 text-xs font-medium text-text-on-primary disabled:opacity-50"
      >
        {mutation.isPending ? "..." : "Salvar"}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="text-xs text-text-muted"
      >
        Cancelar
      </button>
    </form>
  );
}
