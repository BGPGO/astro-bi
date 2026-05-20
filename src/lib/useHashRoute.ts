import { useEffect, useState } from "react";

/** Hash routing simples sem dep. Retorna a rota atual (sem o '#'). */
export function useHashRoute(defaultRoute = ""): [string, (next: string) => void] {
  const get = () => (typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "");
  const [route, setRoute] = useState<string>(get() || defaultRoute);

  useEffect(() => {
    const onChange = () => setRoute(get() || defaultRoute);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, [defaultRoute]);

  const nav = (next: string) => {
    if (next === "") {
      history.pushState(null, "", window.location.pathname + window.location.search);
      setRoute("");
    } else {
      window.location.hash = next;
    }
  };

  return [route, nav];
}
