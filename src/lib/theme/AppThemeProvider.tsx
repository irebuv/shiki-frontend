import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Theme as RadixTheme } from "@radix-ui/themes";
import React, { createContext, useContext, useEffect } from "react";

type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark"; // for UI components
  toggleTheme: () => void;
  setTheme: (t: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useLocalStorage<ThemeMode>("theme", "system");

  // ↓ resolved theme (system → computed, others → direct)
  const resolved = theme === "system" ? getSystemTheme() : theme;

  useEffect(() => {
    const root = document.documentElement;

    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Optional: expose to CSS as data attribute (handy for debugging)
    root.dataset.theme = resolved;
  }, [resolved]);

  // Listen for system changes (ONLY when theme === "system")
  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      const newSystemTheme = media.matches ? "dark" : "light";
      const root = document.documentElement;

      if (newSystemTheme === "dark") root.classList.add("dark");
      else root.classList.remove("dark");

      root.dataset.theme = newSystemTheme;
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  const value: ThemeContextValue = {
    theme,
    resolvedTheme: resolved,
    toggleTheme: () => {
      if (theme === "light") setTheme("dark");
      else if (theme === "dark") setTheme("light");
      else setTheme(getSystemTheme()); // if system, switch to opposite
    },
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <RadixTheme appearance={resolved} radius="large">
        {children}
      </RadixTheme>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error("useAppTheme must be used within AppThemeProvider");
  return ctx;
}
