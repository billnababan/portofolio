import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFeedback } from "../components/ui/Feedback";
import { api, ApiError } from "../lib/api";
import type { Settings } from "../lib/types";

// Local draft of one settings row: dirty tracking, save, and field errors from the server.
export function useSettingForm<K extends keyof Settings>(key: K, saved: Settings[K] | undefined, label: string) {
  const qc = useQueryClient();
  const { toast } = useFeedback();
  const [draft, setDraft] = useState<Settings[K] | undefined>(saved);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraft(saved);
  }, [saved]);

  const dirty = draft !== undefined && JSON.stringify(draft) !== JSON.stringify(saved);

  const mutation = useMutation({
    mutationFn: (value: Settings[K]) => api.put<{ value: Settings[K] }>(`/settings/${key}`, value),
    onSuccess: () => {
      setErrors({});
      toast(`${label} saved — publish to make it live`);
      qc.invalidateQueries({ queryKey: ["settings"] });
      qc.invalidateQueries({ queryKey: ["publish"] });
      qc.invalidateQueries({ queryKey: ["seo"] });
    },
    onError: (e) => {
      setErrors(e instanceof ApiError ? e.fields : {});
      toast(e.message, "error");
    },
  });

  return {
    draft,
    set: (patch: Partial<Settings[K]>) => setDraft((d) => (d === undefined ? d : Array.isArray(d) ? (patch as Settings[K]) : { ...d, ...patch })),
    replace: (value: Settings[K]) => setDraft(value),
    reset: () => {
      setDraft(saved);
      setErrors({});
    },
    save: () => draft !== undefined && mutation.mutate(draft),
    saving: mutation.isPending,
    dirty,
    errors,
  };
}
