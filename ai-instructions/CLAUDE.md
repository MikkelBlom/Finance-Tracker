# Finance Tracker



<!-- launchpad:begin -->
## Launchpad

This project is tracked in **Launchpad**, a local service on http://localhost:7420 that owns
Mikkel's notes, ideas, and tasks for every project. **It is Launchpad project #4 ("Finance Tracker").**
Launchpad's database is the source of truth — not the markdown in this repo.

```bash
launchpad pull --json      # read this project's tasks/ideas/notes (nothing written to disk)
launchpad guide            # the full command set, with the push-plan schema
```

Every `launchpad` command run inside this folder targets project #4 automatically.
Write back with `launchpad task add "…"`, `launchpad idea add "…"`, `launchpad note add "…"`,
`launchpad set description "…"`, `launchpad tag add <name>`, or a batch `launchpad push plan.json`.

**Dev server port.** This project runs on **http://localhost:8081**. Use that port when you start or configure its dev server — don't invent a new one. Never assume 3000, 3001 or 5000 are free — they are already taken on this machine.

`ai-instructions/LAUNCHPAD.md` is a **read-only mirror** — editing it changes nothing.
Agents archive rather than delete; nothing you do here is unrecoverable.
<!-- launchpad:end -->
