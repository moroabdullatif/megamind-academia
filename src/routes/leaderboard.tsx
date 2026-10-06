import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { MAJORS, RIVALS } from "@/lib/game-data";
import { currentWeekId, usePlayer } from "@/lib/game-store";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Weekly Leaderboard — MegaMind" },
      { name: "description", content: "Top coin earners this week. Who will be the #1 Grand MegaMind?" },
      { property: "og:title", content: "Weekly Leaderboard — MegaMind" },
      { property: "og:description", content: "See this week's top MegaMind coin earners." },
    ],
  }),
  component: Leaderboard,
});

function hash(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

function Leaderboard() {
  const { player } = usePlayer();
  const week = currentWeekId();
  const rivals = RIVALS.map((n) => ({
    name: n, major: MAJORS[hash(n) % MAJORS.length]!.id, coins: 50 * (1 + (hash(n + week) % 12)), you: false,
  }));
  const rows = [...rivals, ...(player?.major ? [{ name: `${player.name} (you)`, major: player.major, coins: player.weeklyCoins, you: true }] : [])]
    .sort((a, b) => b.coins - a.coins);

  return (
    <GameShell>
      <p className="text-sm uppercase tracking-widest text-primary">Week {week.split("-W")[1]}</p>
      <h1 className="font-display mb-6 text-4xl font-extrabold">Weekly Leaderboard</h1>
      {rows[0] && (
        <div className="champion mb-6">
          <span className="text-5xl">👑</span>
          <div>
            <span className="badge-grand">#1 Grand MegaMind</span>
            <p className="font-display mt-1 text-3xl font-extrabold">{rows[0].name}</p>
            <p className="text-sm opacity-80">{rows[0].major} · 🪙 {rows[0].coins}</p>
          </div>
        </div>
      )}
      <ol className="panel divide-y divide-border p-0">
        {rows.map((r, i) => (
          <li key={r.name} className={`flex items-center gap-4 px-5 py-3 ${r.you ? "row-you" : ""}`}>
            <span className="font-display w-8 text-xl font-bold text-muted-foreground">{i + 1}</span>
            <div className="flex-1">
              <p className="font-semibold">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.major}</p>
            </div>
            <span className="chip chip-coin">🪙 {r.coins}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-center text-xs text-muted-foreground">Resets every week. Win games to climb — +50 coins per win.</p>
    </GameShell>
  );
}
