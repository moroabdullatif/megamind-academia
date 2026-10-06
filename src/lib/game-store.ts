import { useEffect, useState, useCallback } from "react";
import type { Major } from "./game-data";

export type Player = {
  name: string;
  major: Major | null;
  coins: number;
  level: number;
  weeklyCoins: number;
  weekId: string;
  streak: number;
  bestStreak: number;
};

const KEY = "megamind-player";
export const WIN_REWARD = 50;
export const HINT_COST = 20;

export function currentWeekId() {
  const d = new Date();
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getUTCDay() + 1) / 7);
  return `${d.getUTCFullYear()}-W${week}`;
}

const fresh = (): Player => ({ name: "", major: null, coins: 100, level: 1, weeklyCoins: 0, weekId: currentWeekId(), streak: 0, bestStreak: 0 });

function load(): Player {
  try {
    const p = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || "{}") } as Player;
    if (p.weekId !== currentWeekId()) { p.weekId = currentWeekId(); p.weeklyCoins = 0; }
    return p;
  } catch { return fresh(); }
}

const listeners = new Set<(p: Player) => void>();

export function usePlayer() {
  const [player, setPlayer] = useState<Player | null>(null);
  useEffect(() => {
    setPlayer(load());
    listeners.add(setPlayer);
    return () => { listeners.delete(setPlayer); };
  }, []);
  const update = useCallback((fn: (p: Player) => Player) => {
    const next = fn(load());
    localStorage.setItem(KEY, JSON.stringify(next));
    listeners.forEach((l) => l(next));
  }, []);
  return { player, update };
}

export const winReward = (p: Player): Player => ({
  ...p, coins: p.coins + WIN_REWARD, weeklyCoins: p.weeklyCoins + WIN_REWARD, level: p.level + 1,
});

// ---- Streaks & boss levels ----
export const BOSS_EVERY = 5;
export const isBoss = (level: number) => level % BOSS_EVERY === 0;
export const streakBonus = (streak: number) => Math.min(streak, 5) * 10;
export const rewardFor = (p: Pick<Player, "level" | "streak">) =>
  (WIN_REWARD + streakBonus(p.streak ?? 0)) * (isBoss(p.level) ? 2 : 1);

export const winRound = (p: Player): Player => {
  const r = rewardFor(p);
  const streak = (p.streak ?? 0) + 1;
  return { ...p, coins: p.coins + r, weeklyCoins: p.weeklyCoins + r, level: p.level + 1, streak, bestStreak: Math.max(p.bestStreak ?? 0, streak) };
};
export const loseRound = (p: Player): Player => ({ ...p, streak: 0 });
