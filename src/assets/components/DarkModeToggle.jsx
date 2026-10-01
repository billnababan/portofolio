import { useEffect, useState } from "react";
import { Moon, Sun } from "./Icons";

// The theme class is set before first paint by the inline script in index.html.
// This button only reads that state after mount and toggles it.
export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("dark-mode", String(next));
    } catch {
      // storage unavailable (private mode): theme still applies for this visit
    }
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark ?? undefined}
      aria-label="Dark mode"
      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-sunken"
    >
      <Moon className="dark:hidden" />
      <Sun className="hidden dark:block" />
    </button>
  );
}
