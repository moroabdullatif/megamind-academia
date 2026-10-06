import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Term } from "./game-data";
import { generateTerms, smartHint } from "./gemini.functions";

export const AI_HINT_COST = 10;

export function useAiTerms() {
  const gen = useServerFn(generateTerms);
  const [terms, setTerms] = useState<Term[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = async (major: string, level: number, count: number) => {
    setLoading(true); setError(null);
    try { setTerms(await gen({ data: { major, level, count } })); }
    catch (e) { setError(e instanceof Error ? e.message : "AI request failed."); }
    finally { setLoading(false); }
  };
  return { terms, loading, error, load, clear: () => setTerms(null) };
}

export function useSmartHint() {
  const fn = useServerFn(smartHint);
  const [hints, setHints] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ask = async (t: Term, major: string): Promise<boolean> => {
    setLoading(t.term); setError(null);
    try {
      const r = await fn({ data: { term: t.term, definition: t.definition, major } });
      setHints((h) => ({ ...h, [t.term]: r.hint }));
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : "AI request failed."); return false; }
    finally { setLoading(null); }
  };
  return { hints, loading, error, ask, reset: () => setHints({}) };
}
