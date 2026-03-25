Git audit export (2026-03-22 through 2026-03-25, commit dates)

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

Regenerate (from repo roots):
  git fetch origin main   # or master for patrol-helper
  git diff <old>^..origin/<branch> > wolf-changelog/internal/git-audits/2026-03-22-to-03-25/<name>-full.diff
