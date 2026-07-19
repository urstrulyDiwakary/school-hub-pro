import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Debounced auto-save of any serializable draft to localStorage.
 * Returns `{ draft, save, clear, savedAt }`.
 */
export function useAutoSave<T>(key: string, initial: T, delay = 800) {
  const [draft, setDraft] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const save = useCallback(
    (value: T) => {
      setDraft(value);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          setSavedAt(Date.now());
        } catch {
          /* quota — ignore */
        }
      }, delay);
    },
    [key, delay],
  );

  const clear = useCallback(() => {
    localStorage.removeItem(key);
    setSavedAt(null);
  }, [key]);

  useEffect(() => () => clearTimeout(timer.current), []);
  return { draft, save, clear, savedAt };
}

/**
 * Warn the user before navigating away with unsaved changes.
 * Works for browser navigation (beforeunload). React Router blocking is
 * left to consumers via `useBlocker` if they need it.
 */
export function useDirtyGuard(isDirty: boolean, message = "You have unsaved changes.") {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, message]);
}
