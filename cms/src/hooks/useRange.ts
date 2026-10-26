import { useSearchParams } from "react-router-dom";
import type { Range } from "../lib/types";

// The date range lives in the URL (?range=30d) so a reload or a shared link keeps it.
export function useRange(): [Range, (r: Range) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get("range");
  const range: Range = raw === "7d" || raw === "90d" ? raw : "30d";
  return [
    range,
    (r) =>
      setParams(
        (p) => {
          p.set("range", r);
          return p;
        },
        { replace: true },
      ),
  ];
}
