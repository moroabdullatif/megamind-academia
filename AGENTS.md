<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Game progress (coins, level, major) is stored in browser localStorage via src/lib/game-store.ts; leaderboard rivals are simulated. Why: no backend yet.
- Draft membership policy is centralized in src/lib/membership.ts; no client-side state grants paid access. Why: checkout is inactive and verified server entitlements must be implemented before selling memberships.
- AI premium gates are presentation and client-request guards only until payment activation; server authorization must be added before live sales. Why: browser gates are not a security boundary.
