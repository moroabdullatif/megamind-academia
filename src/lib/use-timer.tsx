import { useEffect, useRef, useState } from "react";

/** Countdown based on wall-clock time so it never drifts. `resetKey` restarts it. */
export function useCountdown(seconds: number, running: boolean, resetKey: unknown, onExpire: () => void) {
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(0);
  const pausedLeft = useRef(seconds);
  const cb = useRef(onExpire);
  cb.current = onExpire;

  useEffect(() => { pausedLeft.current = seconds; setLeft(seconds); }, [seconds, resetKey]);

  useEffect(() => {
    if (!running) return;
    endRef.current = Date.now() + pausedLeft.current * 1000;
    const id = setInterval(() => {
      const l = Math.max(0, (endRef.current - Date.now()) / 1000);
      pausedLeft.current = l;
      setLeft(l);
      if (l <= 0) { clearInterval(id); cb.current(); }
    }, 250);
    return () => clearInterval(id);
  }, [running, seconds, resetKey]);

  return left;
}

export function TimerBar({ left, total }: { left: number; total: number }) {
  const pct = total > 0 ? (left / total) * 100 : 0;
  const low = left <= Math.min(5, total * 0.25);
  return (
    <div className="flex items-center gap-3">
      <div className={`timer-bar flex-1 ${low ? "timer-low" : ""}`}><div style={{ width: `${pct}%` }} /></div>
      <span className={`w-12 text-right font-mono text-sm tabular-nums ${low ? "text-destructive" : "text-muted-foreground"}`}>⏱ {Math.ceil(left)}s</span>
    </div>
  );
}
