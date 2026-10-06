import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GameShell, NeedMajor } from "@/components/GameShell";
import { buildGrid, shuffle, TERMS, type Placed } from "@/lib/game-data";
import { HINT_COST, usePlayer, winReward, WIN_REWARD } from "@/lib/game-store";
import { AI_HINT_COST, useAiTerms, useSmartHint } from "@/lib/use-ai";

export const Route = createFileRoute("/word-search")({
  head: () => ({
    meta: [
      { title: "Word Search — MegaMind" },
      { name: "description", content: "Drag across the letter grid to find academic terms from hints." },
      { property: "og:title", content: "Word Search — MegaMind" },
      { property: "og:description", content: "Find hidden academic terms and earn coins." },
    ],
  }),
  component: WordSearch,
});

type Cell = [number, number];
const k = (c: Cell) => `${c[0]},${c[1]}`;

function line(a: Cell, b: Cell): Cell[] | null {
  const dr = b[0] - a[0], dc = b[1] - a[1];
  const n = Math.max(Math.abs(dr), Math.abs(dc));
  if (n === 0) return [a];
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
  const sr = Math.sign(dr), sc = Math.sign(dc);
  return Array.from({ length: n + 1 }, (_, i) => [a[0] + sr * i, a[1] + sc * i] as Cell);
}

function WordSearch() {
  const { player, update } = usePlayer();
  const [seed, setSeed] = useState(0);
  const level = player?.level ?? 1;
  const major = player?.major;
  const ai = useAiTerms();
  const smart = useSmartHint();

  const game = useMemo(() => {
    if (!major) return null;
    const size = Math.min(8 + Math.floor(level / 2), 12);
    const count = Math.min(4 + Math.floor(level / 2), 8);
    const source = ai.terms && ai.terms.length >= 3 ? ai.terms : TERMS[major];
    const pool = shuffle(source).filter((t) => t.term.length <= size).slice(0, count);
    return { size, ...buildGrid(pool, size) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [major, level, seed, ai.terms]);

  const [found, setFound] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [start, setStart] = useState<Cell | null>(null);
  const [cur, setCur] = useState<Cell | null>(null);
  const [won, setWon] = useState(false);

  useEffect(() => { setFound([]); setRevealed([]); setWon(false); smart.reset(); }, [game]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!player) return <GameShell><div /></GameShell>;
  if (!major || !game) return <GameShell><NeedMajor /></GameShell>;

  const sel = start && cur ? line(start, cur) ?? [start] : [];
  const selSet = new Set(sel.map(k));
  const foundSet = new Set(game.placed.filter((p) => found.includes(p.term)).flatMap((p) => p.cells.map(k)));
  const hintSet = new Set(game.placed.filter((p) => revealed.includes(p.term) && !found.includes(p.term)).map((p) => k(p.cells[0]!)));

  const finish = () => {
    if (sel.length > 1) {
      const word = sel.map(([r, c]) => game.grid[r]![c]).join("");
      const hit = game.placed.find((p: Placed) => !found.includes(p.term) && (p.term === word || p.term === [...word].reverse().join("")) && p.cells.length === sel.length);
      if (hit) {
        const nf = [...found, hit.term];
        setFound(nf);
        if (nf.length === game.placed.length) { setWon(true); update(winReward); }
      }
    }
    setStart(null); setCur(null);
  };

  const cellFromPoint = (x: number, y: number): Cell | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const d = el?.dataset?.["cell"];
    return d ? (d.split(",").map(Number) as Cell) : null;
  };

  const buyHint = (term: string) => {
    if (player.coins < HINT_COST || revealed.includes(term)) return;
    update((p) => ({ ...p, coins: p.coins - HINT_COST }));
    setRevealed([...revealed, term]);
  };

  return (
    <GameShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-widest text-primary">{major} · Level {level}</p>
          <h1 className="font-display text-4xl font-extrabold">Word Search</h1>
        </div>
        <p className="text-muted-foreground">{found.length}/{game.placed.length} found</p>
      </div>

      {won && (
        <div className="win-banner mb-6">
          <span className="font-display text-2xl font-bold">🎉 Puzzle cleared! +{WIN_REWARD} coins</span>
          <button className="btn-primary" onClick={() => setSeed((s) => s + 1)}>Next level →</button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div
          className="ws-grid select-none touch-none"
          style={{ gridTemplateColumns: `repeat(${game.size}, minmax(0, 1fr))` }}
          onPointerUp={finish}
          onPointerLeave={() => start && finish()}
          onPointerMove={(e) => { if (start) { const c = cellFromPoint(e.clientX, e.clientY); if (c) setCur(c); } }}
        >
          {game.grid.map((row, r) => row.map((ch, c) => {
            const id = `${r},${c}`;
            const cls = selSet.has(id) ? "ws-cell-sel" : foundSet.has(id) ? "ws-cell-found" : hintSet.has(id) ? "ws-cell-hint" : "";
            return (
              <div key={id} data-cell={id} className={`ws-cell ${cls}`}
                onPointerDown={(e) => { (e.target as HTMLElement).releasePointerCapture?.(e.pointerId); setStart([r, c]); setCur([r, c]); }}>
                {ch}
              </div>
            );
          }))}
        </div>

        <aside className="panel space-y-3">
          <h2 className="font-display text-lg font-bold">Hints</h2>
          {game.placed.map((p, i) => {
            const done = found.includes(p.term);
            return (
              <div key={p.term} className={`clue ${done ? "clue-done" : ""} flex-wrap`}>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{i + 1}. {p.hint}</p>
                  <p className="text-xs text-muted-foreground">
                    {done ? p.term : revealed.includes(p.term) ? `Starts with "${p.term[0]}" · ${p.term.length} letters` : `${p.term.length} letters`}
                  </p>
                  {!done && smart.hints[p.term] && <p className="mt-1 text-xs">✨ {smart.hints[p.term]}</p>}
                </div>
                {!done && (
                  <div className="flex gap-1">
                    {!smart.hints[p.term] && (
                      <button className="btn-hint" title="Smart hint" disabled={player.coins < AI_HINT_COST || smart.loading === p.term}
                        onClick={async () => { if (await smart.ask(p, major)) update((x) => ({ ...x, coins: x.coins - AI_HINT_COST })); }}>
                        {smart.loading === p.term ? "…" : `✨${AI_HINT_COST}`}
                      </button>
                    )}
                    {!revealed.includes(p.term) && (
                      <button className="btn-hint" disabled={player.coins < HINT_COST} onClick={() => buyHint(p.term)}>🪙{HINT_COST}</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {smart.error && <p className="text-xs text-destructive">{smart.error}</p>}
          <button className="btn-ghost w-full" onClick={() => setSeed((s) => s + 1)}>New grid</button>
          <button className="btn-ghost w-full" disabled={ai.loading} onClick={() => ai.load(major, level, 8)}>
            {ai.loading ? "Generating…" : "✨ AI-generated grid"}
          </button>
          {ai.terms && <button className="btn-ghost w-full" onClick={ai.clear}>Classic terms</button>}
          {ai.error && <p className="text-xs text-destructive">{ai.error}</p>}
        </aside>
      </div>
    </GameShell>
  );
}
