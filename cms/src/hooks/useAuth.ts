import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api";
import type { Me } from "../lib/types";

// The logged-in user, or null. Any 401 elsewhere clears it (see lib/api.ts).
export function useAuth() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await api.get<Me>("/auth/me");
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    const onOut = () => {
      qc.setQueryData(["me"], null);
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "me" });
    };
    window.addEventListener("cms:logged-out", onOut);
    return () => window.removeEventListener("cms:logged-out", onOut);
  }, [qc]);

  return query;
}
