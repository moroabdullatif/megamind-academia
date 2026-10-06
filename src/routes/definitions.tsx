import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameShell, NeedMajor } from "@/components/GameShell";
import { shuffle, TERMS } from "@/lib/game-data";
import { HINT_COST, usePlayer, winReward, WIN_REWARD } from "@/lib/game-store";

export const Route = createFileRoute("/definitions")({
  head: () => ({
    meta: [
      { title: "Term Definitions — MegaMind" },
      { name: "description", content: "Read the definition and pick or type the correct academic term." },
      { property: "og:title", content: "Term Definitions — MegaMind" },
      { property: "og:description", content: "Test your academic vocabulary and earn coins." },
    ],
  }),
  component: Definitions,
});

const ROUND = 5, PASS = 4;

function Definitions() {
  const { player, update } = usePlayer();
  const [seed, setSeed] = useState(0);
  const [mode, setMode] = useState<"pick" | "type">("pick");
  const major = player?.major;

  const qs = useMemo(() => {
    if (!major) return [];
    const all = TERMS[major];
    return shuffle(all).slice(0, ROUND).map((t) => ({
      ...t, options: shuffle([t.term, ...shuffle(all.filter((x) => x.term !== t.term)).slice(0, 3).map((x) => x.term)]),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [major, seed]);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [hints, setHints] = useState(0);
  const [done, setDone] = useState(false);

  if (!player) return <GameShell><div /></GameShell>;
  if (!major) return <GameShell><NeedMajor /></GameShell>;

  const q = qs[idx];
  const reset = () => { setSeed((s) => s + 1); setIdx(0); setScore(0); setAnswer(null); setTyped(""); setHints(0); setDone(false); };

  const submit = (val: string) => {
    if (answer) return;
    const ok = val.trim().toUpperCase() === q.term;
    setAnswer(val.trim().toUpperCase() || "—");
    const ns = score + (ok ? 1 : 0);
    setScore(ns);
  };
  const next = () => {
    if (idx + 1 >= ROUND) {
      setDone(true);
      if (score >= PASS) update(winReward);
      return;
    }
    setIdx(idx + 1); setAnswer(null); setTyped(""); setHints(0);
  };
  const buyHint = () => {
    if (player.coins < HINT_COST || hints >= q.term.length - 1) return;
    update((p) => ({ ...p, coins: p.coins - HINT_COST }));
    setHints(hints + 1);
  };

  const pattern = q ? q.term.split("").map((ch, i) => (i < hints ? ch : "_")).join(" ") : "";

  return (
    <GameShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-widest text-primary">{major} · Level {player.level}</p>
          <h1 className="font-display text-4xl font-extrabold">Term Definitions</h1>
        </div>
        <div className="toggle">
          <button className={mode === "pick" ? "toggle-on" : ""} onClick={() => setMode("pick")}>Pick</button>
          <button className={mode === "type" ? "toggle-on" : ""} onClick={() => setMode("type")}>Type</button>
        </div>
      </div>

      {done ? (
        <div className="panel mx-auto max-w-lg space-y-4 text-center">
          <p className="font-display text-5xl font-extrabold">{score}/{ROUND}</p>
          {score >= PASS
            ? <p className="text-primary font-semibold">🎉 You win! +{WIN_REWARD} coins · Level up!</p>
            : <p className="text-muted-foreground">Get {PASS}/{ROUND} to win coins. Try again!</p>}
          <button className="btn-primary" onClick={reset}>{score >= PASS ? "Next level →" : "Retry"}</button>
        </div>
      ) : (
        <div className="panel mx-auto max-w-2xl space-y-6">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {idx + 1}/{ROUND}</span><span>Score {score}</span>
          </div>
          <div className="progress"><div style={{ width: `${(idx / ROUND) * 100}%` }} /></div>
          <p className="font-display text-2xl font-semibold leading-snug">“{q.definition}”</p>

          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-lg tracking-widest">{pattern}</p>
            <button className="btn-hint" disabled={!!answer || player.coins < HINT_COST} onClick={buyHint}>Letter hint 🪙{HINT_COST}</button>
          </div>

          {mode === "pick" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {q.options.map((o) => {
                const state = answer ? (o === q.term ? "opt-right" : o === answer ? "opt-wrong" : "") : "";
                return <button key={o} className={`opt ${state}`} onClick={() => submit(o)} disabled={!!answer}>{o}</button>;
              })}
            </div>
          ) : (
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); submit(typed); }}>
              <input className="input-field uppercase" autoFocus value={typed} disabled={!!answer} onChange={(e) => setTyped(e.target.value)} placeholder="Type the term" />
              <button className="btn-primary" disabled={!!answer}>Submit</button>
            </form>
          )}

          {answer && (
            <div className="flex items-center justify-between gap-3">
              <p className={answer === q.term ? "text-primary font-semibold" : "text-destructive font-semibold"}>
                {answer === q.term ? "Correct!" : `Answer: ${q.term}`}
              </p>
              <button className="btn-primary" onClick={next}>{idx + 1 >= ROUND ? "Finish" : "Next →"}</button>
            </div>
          )}
        </div>
      )}
    </GameShell>
  );
}
