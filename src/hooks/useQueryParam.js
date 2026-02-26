import { useState, useCallback, useEffect } from "react";

export function useQueryParam(key) {
  const getParam = () => new URLSearchParams(window.location.search).get(key);
  const [value, setValue] = useState(getParam);

  const setParam = useCallback(
    (newValue) => {
      const url = new URL(window.location);
      if (newValue) {
        url.searchParams.set(key, newValue);
      } else {
        url.searchParams.delete(key);
      }
      window.history.replaceState({}, "", url);
      setValue(newValue);
    },
    [key]
  );

  useEffect(() => {
    const handler = () => setValue(getParam());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [key]);

  return [value, setParam];
}
