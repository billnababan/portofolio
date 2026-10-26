import { useEffect } from "react";
import { useBlocker } from "react-router-dom";
import { useFeedback } from "../components/ui/Feedback";

// Warns before leaving a form with unsaved changes (closing the tab, or moving inside the CMS).
export function useUnsaved(dirty: boolean) {
  const { confirm } = useFeedback();

  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    confirm({ title: "Leave without saving?", body: "Your changes on this page have not been saved yet.", action: "Leave", danger: true }).then((ok) =>
      ok ? blocker.proceed() : blocker.reset(),
    );
  }, [blocker, confirm]);
}
