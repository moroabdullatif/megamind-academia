import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Crown, LockKeyhole, Sparkles, ArrowLeft } from "lucide-react";
import { GameShell } from "@/components/GameShell";
import { Button } from "@/components/ui/button";
import { PREMIUM_PLAN } from "@/lib/membership";

export const Route = createFileRoute("/premium")({
  head: () => ({ meta: [
    { title: "Premium Membership — MegaMind" },
    { name: "description", content: "Explore MegaMind Premium's planned AI puzzles and smart hints. Preview pricing; memberships are not yet available." },
    { property: "og:title", content: "Premium Membership — MegaMind" },
    { property: "og:description", content: "More academic challenges with planned AI puzzles, smart hints and provider choice." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Premium,
});

function Premium() {
  const [annual, setAnnual] = useState(false);
  return (
    <GameShell>
      <Button asChild variant="link" className="mb-5 px-0"><Link to="/"><ArrowLeft />Back to game</Link></Button>
      <section className="border-b border-border pb-8">
        <div className="mb-4 flex items-center gap-3 text-accent"><Crown className="size-9" /><span className="text-sm font-semibold uppercase">Membership · Coming soon</span></div>
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl">MegaMind Premium</h1>
        <p className="mt-3 max-w-xl text-lg text-muted-foreground">Fresh academic challenges. A little help when you need it. The same love of learning.</p>
      </section>
      <div className="my-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Current plan: <span className="font-semibold text-foreground">Free</span></p>
        <div role="group" aria-label="Billing interval" className="flex gap-1 rounded-md border border-border p-1">
          <Button size="sm" variant={annual ? "ghost" : "secondary"} aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</Button>
          <Button size="sm" variant={annual ? "secondary" : "ghost"} aria-pressed={annual} onClick={() => setAnnual(true)}>Yearly</Button>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <section className="flex flex-col rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-bold">Campus Free</h2>
          <p className="my-5"><span className="font-display text-4xl font-bold">$0</span><span className="ml-2 text-muted-foreground">forever</span></p>
          <ul className="mb-7 space-y-3 text-sm">
            {["Classic word search puzzles", "Pick or type term definitions", "All five academic majors", "Timers, streaks and boss levels", "Coins, letter hints and weekly rankings"].map(b => <li key={b} className="flex items-start gap-2"><Check className="size-4 shrink-0 text-primary" />{b}</li>)}
          </ul>
          <Button asChild variant="outline" className="mt-auto"><Link to="/">Keep playing free</Link></Button>
        </section>
        <section className="flex flex-col rounded-lg border border-primary/50 bg-card p-6">
          <div className="flex items-center justify-between gap-2"><h2 className="font-display text-2xl font-bold">Premium</h2><Sparkles className="size-5 text-accent" /></div>
          <p className="mb-1 mt-5"><span className="font-display text-4xl font-bold">${(annual ? PREMIUM_PLAN.yearlyUsd : PREMIUM_PLAN.monthlyUsd).toFixed(2)}</span><span className="ml-2 text-muted-foreground">/{annual ? "year" : "month"}</span></p>
          <p className="mb-5 text-xs text-accent">Placeholder price · USD · Not a live offer</p>
          <ul className="mb-7 space-y-3 text-sm">
            {["Everything in Campus Free", "AI-generated word search grids", "AI-generated definition question sets", "Smart hints for 10 coins each", "Gemini, Gemma or automatic provider selection"].map(b => <li key={b} className="flex items-start gap-2"><Check className="size-4 shrink-0 text-primary" />{b}</li>)}
          </ul>
          <Button disabled={!PREMIUM_PLAN.checkoutEnabled} className="mt-auto w-full" aria-describedby="checkout-status"><LockKeyhole />Membership unavailable</Button>
        </section>
      </div>
      <p id="checkout-status" className="mt-5 text-sm text-muted-foreground">Purchases are disabled while payments are being set up. No payment details are collected and no charges can be made.</p>
      <section className="mt-8 border-t border-border pt-6">
        <h2 className="font-display text-xl font-bold">Same competition. More variety.</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Premium adds AI variety, not extra win rewards. Coins, streak bonuses and boss rewards stay the same for everyone. Prices and planned benefits may change before launch.</p>
      </section>
    </GameShell>
  );
}