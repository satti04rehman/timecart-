"use client";

import * as React from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(initialValue);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      // ignore parse errors
    }
  }, [key]);

  const setStoredValue = React.useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (prev: T) => T)(prev)
            : updater;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // storage may be unavailable
        }
        return next;
      });
    },
    [key]
  );

  return [value, setStoredValue] as const;
}