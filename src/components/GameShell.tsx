import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { usePlayer } from "@/lib/game-store";

export function GameShell({ children }: { children: ReactNode }) {
  const { player } = usePlayer();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-display text-xl font-extrabold tracking-tight">
            Mega<span className="text-primary">Mind</span>
          </Link>
          <nav className="hidden gap-1 text-sm sm:flex">
            <Link to="/word-search" className="nav-link" activeProps={{ className: "nav-link-active" }}>Word Search</Link>
            <Link to="/definitions" className="nav-link" activeProps={{ className: "nav-link-active" }}>Definitions</Link>
            <Link to="/leaderboard" className="nav-link" activeProps={{ className: "nav-link-active" }}>Leaderboard</Link>
          </nav>
          {player?.major && (
            <div className="flex items-center gap-2 text-sm font-semibold">
              {player.streak > 0 && <span className="chip" title="Win streak">🔥 {player.streak}</span>}
              <span className="chip">Lv {player.level}</span>
              <span className="chip chip-coin">🪙 {player.coins}</span>
            </div>
          )}
        </div>
        <nav className="flex justify-center gap-1 pb-2 text-xs sm:hidden">
          <Link to="/word-search" className="nav-link" activeProps={{ className: "nav-link-active" }}>Word Search</Link>
          <Link to="/definitions" className="nav-link" activeProps={{ className: "nav-link-active" }}>Definitions</Link>
          <Link to="/leaderboard" className="nav-link" activeProps={{ className: "nav-link-active" }}>Leaderboard</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

export function NeedMajor() {
  return (
    <div className="panel mx-auto max-w-md text-center">
      <p className="text-muted-foreground">Pick your major first to unlock the games.</p>
      <Link to="/" className="btn-primary mt-4 inline-flex">Choose major</Link>
    </div>
  );
}
