import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GameShell } from "@/components/GameShell";
import { MAJORS, type Major } from "@/lib/game-data";
import { usePlayer } from "@/lib/game-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MegaMind — Campus Academic Word Games" },
      { name: "description", content: "Pick your major, solve word searches and definition challenges, earn coins and climb the weekly leaderboard." },
      { property: "og:title", content: "MegaMind — Campus Academic Word Games" },
      { property: "og:description", content: "Word search and term definition games for every major. Earn coins, level up, become the Grand MegaMind." },
    ],
  }),
  component: Home,
});

function Home() {
  const { player, update } = usePlayer();
  const [name, setName] = useState("");
  const [major, setMajor] = useState<Major | null>(null);
  const [editing, setEditing] = useState(false);

  if (!player) return <GameShell><div /></GameShell>;
  const onboarded = player.major && player.name && !editing;

  return (
    <GameShell>
      {onboarded ? (
        <section className="space-y-8">
          <div className="hero-card">
            <p className="text-sm uppercase tracking-widest text-primary">Welcome back, {player.name}</p>
            <h1 className="font-display mt-2 text-4xl font-extrabold sm:text-6xl">Level {player.level}</h1>
            <p className="mt-2 text-muted-foreground">{player.major} track · {player.weeklyCoins} coins earned this week</p>
            <button className="mt-4 text-sm underline text-muted-foreground" onClick={() => { setName(player.name); setMajor(player.major); setEditing(true); }}>Change major</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/word-search" className="mode-card">
              <span className="text-4xl">🔤</span>
              <h2 className="font-display text-2xl font-bold">Word Search</h2>
              <p className="text-muted-foreground">Drag across the grid to find terms from academic hints.</p>
            </Link>
            <Link to="/definitions" className="mode-card">
              <span className="text-4xl">📖</span>
              <h2 className="font-display text-2xl font-bold">Term Definitions</h2>
              <p className="text-muted-foreground">Read the definition, pick or type the right term.</p>
            </Link>
          </div>
          <Link to="/leaderboard" className="panel flex items-center justify-between">
            <span className="font-semibold">🏆 Weekly Leaderboard</span><span className="text-primary">View →</span>
          </Link>
        </section>
      ) : (
        <section className="mx-auto max-w-2xl space-y-6">
          <div className="text-center">
            <h1 className="font-display text-5xl font-extrabold sm:text-6xl">Mega<span className="text-primary">Mind</span></h1>
            <p className="mt-3 text-muted-foreground">The campus word game. Choose your major to begin.</p>
          </div>
          <input className="input-field" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} />
          <div className="grid gap-3 sm:grid-cols-2">
            {MAJORS.map((m) => (
              <button key={m.id} onClick={() => setMajor(m.id)} className={`major-card ${major === m.id ? "major-card-active" : ""}`}>
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-left"><span className="block font-bold">{m.id}</span><span className="text-sm text-muted-foreground">{m.tag}</span></span>
              </button>
            ))}
          </div>
          <button
            disabled={!name.trim() || !major}
            className="btn-primary w-full"
            onClick={() => { update((p) => ({ ...p, name: name.trim(), major })); setEditing(false); }}
          >Start playing</button>
        </section>
      )}
    </GameShell>
  );
}
