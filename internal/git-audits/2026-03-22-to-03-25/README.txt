Git audit export (2026-03-22 through 2026-03-25, commit dates)

Workspace root "normal wolf" contains these git repos (each folder has its own .git):

  wolf-brain
  wolf-changelog
  wolf-community-frontend
  wolf-docs
  wolf-enterprise-frontend
  wolf-patrol-app   (remote: patrol-helper; default branch: master)
  wolf-safety-router
  wolf-server
  wolf-whatsapp-server

These files are raw `git diff` outputs from local clones against `origin` at export time.

wolf-server (branch: main)
  Range: 3a0ad45^..origin/main
  First commit in window (first-parent, since 2026-03-22): 3a0ad45 — fix(poi): CORS Accept for NDJSON stream...
  File: wolf-server-full.diff (~315 KB)

wolf-enterprise-frontend (branch: main)
  Range: ef702d9^..origin/main
  First commit in window (first-parent, since 2026-03-22): ef702d9 — feat(admin): assign organisation roles...
  File: wolf-enterprise-frontend-full.diff (~740 KB)

wolf-patrol-app / patrol-helper (branch: master)
  Range: 78529d0^..origin/master
  First merge in window: 78529d0 — Merge pull request #1 (feature/patrol-field-mobile-ux)
  File: wolf-patrol-app-full.diff (~218 KB)

wolf-community-frontend (branch: main)
  Range: c2e3ef4^..origin/main
  First commit in window (since 2026-03-22): c2e3ef4 — feat(live-map): sync map layers with enterprise...
  All commits in this window landed on 2026-03-23 (no 03-24/03-25 commits on main).
  File: wolf-community-frontend-full.diff (~168 KB)

wolf-safety-router (branch: main)
  Range: 95b7d9d^..origin/main
  First commit in window (since 2026-03-22): 95b7d9d — fix(auth): exempt GET /hexes/all and /hexes/config from auth
  All commits in this window landed on 2026-03-23.
  File: wolf-safety-router-full.diff (~11 KB)

No new commits on origin in this window (local check after fetch):
  wolf-brain, wolf-docs, wolf-whatsapp-server — no diff files.

wolf-changelog MDX for this period:
  changelog/wolf-community-frontend/2026-03-23.mdx (map parity) + 2026-03-24.mdx + 2026-03-25.mdx (no-ship pointers)
  changelog/wolf-safety-router/2026-03-23.mdx
  changelog/wolf-server/2026-03-23.mdx (through 03-25)
  changelog/wolf-enterprise-frontend/2026-03-23.mdx (through 03-25)
  changelog/wolf-patrol-app/2026-03-24.mdx (through 03-25)
  changelog/wolf-whatsapp-server/2026-03-25.mdx (no commits on main in this window — informational)

Regenerate (from repo roots):
  git fetch origin main   # or master for patrol-helper
  git diff <old>^..origin/<branch> > wolf-changelog/internal/git-audits/2026-03-22-to-03-25/<name>-full.diff
