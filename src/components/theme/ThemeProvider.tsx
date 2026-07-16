import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "edutrack.theme";

interface ThemeContextValue {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readInitial(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  return stored ?? "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitial);
  const [resolved, setResolved] = useState<"light" | "dark">(() =>
    readInitial() === "system" ? systemTheme() : (readInitial() as "light" | "dark"),
  );

  useEffect(() => {
    const active = theme === "system" ? systemTheme() : theme;
    setResolved(active);
    const root = document.documentElement;
    root.classList.toggle("dark", active === "dark");
    root.style.colorScheme = active;
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      const active = systemTheme();
      setResolved(active);
      document.documentElement.classList.toggle("dark", active === "dark");
    };
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = (t: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
