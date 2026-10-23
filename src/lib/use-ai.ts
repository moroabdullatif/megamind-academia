import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Term } from "./game-data";
import { generateTerms, smartHint } from "./gemini.functions";
import { canUsePremium, PREMIUM_LOCK_MESSAGE } from "./membership";

export const AI_HINT_COST = 10;

export type AiProvider = "auto" | "gemini" | "openrouter";
const KEY = "megamind-ai-provider";
const listeners = new Set<(p: AiProvider) => void>();

function readProvider(): AiProvider {
  if (typeof window === "undefined") return "auto";
  const v = window.localStorage.getItem(KEY);
  return v === "gemini" || v === "openrouter" ? v : "auto";
}

export function useAiProvider() {
  const [provider, setP] = useState<AiProvider>("auto");
  useEffect(() => {
    setP(readProvider());
    listeners.add(setP);
    return () => { listeners.delete(setP); };
  }, []);
  const setProvider = (p: AiProvider) => {
    if (!canUsePremium("provider-choice")) return;
    window.localStorage.setItem(KEY, p);
    listeners.forEach((l) => l(p));
  };
  return { provider, setProvider };
}

export function useAiTerms() {
  const gen = useServerFn(generateTerms);
  const [terms, setTerms] = useState<Term[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = async (major: string, level: number, count: number) => {
    if (!canUsePremium("ai-terms")) { setError(PREMIUM_LOCK_MESSAGE); return; }
    setLoading(true); setError(null);
    try { setTerms(await gen({ data: { major, level, count, provider: readProvider() } })); }
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
    if (!canUsePremium("smart-hints")) { setError(PREMIUM_LOCK_MESSAGE); return false; }
    setLoading(t.term); setError(null);
    try {
      const r = await fn({ data: { term: t.term, definition: t.definition, major, provider: readProvider() } });
      setHints((h) => ({ ...h, [t.term]: r.hint }));
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : "AI request failed."); return false; }
    finally { setLoading(null); }
  };
  return { hints, loading, error, ask, reset: () => setHints({}) };
}
