import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Theme as RadixTheme } from "@radix-ui/themes";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";

type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  toggleTheme: (e?: React.MouseEvent) => void;
  setTheme: (t: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/* ===== WAVE TRANSITION ===== */
function withThemeWaveTransitionTwoPhase(fn: () => void, e?: MouseEvent) {
  const root = document.documentElement;

  const reduceMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  if (reduceMotion) {
    fn();
    return;
  }

  const IN_MS = 700;
  const COLOR_MS = 200;
  const OUT_MS = 500;

  if (e) {
    root.style.setProperty("--switch-x", `${e.clientX}px`);
    root.style.setProperty("--switch-y", `${e.clientY}px`);
  } else {
    root.style.setProperty("--switch-x", "50%");
    root.style.setProperty("--switch-y", "50%");
  }

  // стартовый цвет = текущая тема
  const beforeBg = getComputedStyle(root).getPropertyValue("--background").trim();
  root.style.setProperty("--switch-bg", beforeBg);

  // сброс
  root.classList.remove("theme-wave-in", "theme-wave-color", "theme-wave-out");
  root.classList.add("theme-wave-active");

  // важно: запускаем IN в следующем кадре, чтобы transition реально стартовал с 0%
  requestAnimationFrame(() => {
    root.classList.add("theme-wave-in");
  });

  window.setTimeout(() => {
    fn(); // меняем тему под волной

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const afterBg = getComputedStyle(root).getPropertyValue("--background").trim();

        root.classList.add("theme-wave-color");
        root.style.setProperty("--switch-bg", afterBg);

        window.setTimeout(() => {
          root.classList.remove("theme-wave-in", "theme-wave-color");
          root.classList.add("theme-wave-out");

          window.setTimeout(() => {
            root.classList.remove("theme-wave-out", "theme-wave-active");
            root.style.removeProperty("--switch-x");
            root.style.removeProperty("--switch-y");
            root.style.removeProperty("--switch-bg");
          }, OUT_MS);
        }, COLOR_MS);
      });
    });
  }, IN_MS);
}


function applyResolvedTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  if (resolved === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  root.dataset.theme = resolved;
}

export function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useLocalStorage<ThemeMode>("theme", "system");

  const resolved: ResolvedTheme =
    theme === "system" ? getSystemTheme() : theme;

  useEffect(() => {
    applyResolvedTheme(resolved);
  }, [resolved]);

  // system theme change (OS)
  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const listener = () => {
      const next = media.matches ? "dark" : "light";
      withThemeWaveTransitionTwoPhase(() => applyResolvedTheme(next));
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      theme,
      resolvedTheme: resolved,

      toggleTheme: (e) => {
        withThemeWaveTransitionTwoPhase(
          () => {
            if (theme === "light") setTheme("dark");
            else if (theme === "dark") setTheme("light");
            else {
              const sys = getSystemTheme();
              setTheme(sys === "dark" ? "light" : "dark");
            }
          },
          e?.nativeEvent
        );
      },

      setTheme: (t) => {
        withThemeWaveTransitionTwoPhase(() => setTheme(t));
      },
    };
  }, [theme, resolved, setTheme]);

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
  if (!ctx) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }
  return ctx;
}
