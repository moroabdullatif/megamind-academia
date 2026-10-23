import { Link } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PremiumGate() {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
      <p className="flex items-center gap-2 text-sm text-muted-foreground"><LockKeyhole className="size-4 shrink-0 text-accent" />AI puzzles and smart hints · Premium</p>
      <Button variant="outline" size="sm" asChild><Link to="/premium">View membership</Link></Button>
    </div>
  );
}