#!/usr/bin/env node
/**
 * Reads git log from wolf-safety-router origin/main and writes
 * changelog/wolf-safety-router/YYYY-MM-DD.mdx (user-facing bullets only; ops/CI noise skipped).
 * First run is a draft — edit MDX to remove any remaining internal detail before publishing.
 *
 * Usage:
 *   WOLF_SAFETY_ROUTER_ROOT=../wolf-safety-router node scripts/generate-wolf-safety-router-daily-from-git.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPO = path.resolve(
  process.env.WOLF_SAFETY_ROUTER_ROOT ??
    path.join(ROOT, "..", "wolf-safety-router")
);
const OUT_DIR = path.join(ROOT, "changelog", "wolf-safety-router");

const SINCE = process.env.CHANGELOG_SINCE ?? "2026-03-01";
const UNTIL = process.env.CHANGELOG_UNTIL ?? "2026-03-21";

const TITLE_PREFIX = "Safety Router";

function stripOrg(branch) {
  return branch
    .replace(/^Community-Wolf-Limited\//, "")
    .replace(/^MichaelHoughtonDeBox\//, "")
    .trim();
}

function gitLog() {
  try {
    return execSync(
      `git -C "${REPO}" log origin/main --since="${SINCE}" --until="${UNTIL}" --format="%aI|%s" --reverse`,
      { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
    );
  } catch (e) {
    console.error(
      "git log failed — set WOLF_SAFETY_ROUTER_ROOT or clone wolf-safety-router next to wolf-changelog."
    );
    throw e;
  }
}

function dayKey(iso) {
  return iso.slice(0, 10);
}

/** Skip infra, CI, auth plumbing, and changelog policy noise — keep routing/scoring product outcomes. */
function shouldSkipSubject(s) {
  const low = s.toLowerCase();
  if (/^merge branch /i.test(s)) return true;
  if (/^merge (feat|fix)\//i.test(s)) return true;
  if (/^deploy:/i.test(s)) return true;
  if (/^routing:/i.test(s)) return true;
  if (/^ci:/i.test(s)) return true;
  if (/^chore(\(|:)/i.test(s)) return true;
  if (/^build:/i.test(s)) return true;
  if (/^docs(\(|:)/i.test(s)) return true;
  if (/^refactor(\(|:)/i.test(s)) return true;
  if (/^perf(\(|:)/i.test(s) && /dijkstra|cubic|tier cost/i.test(low)) return true;
  if (/^add readme|^add readme,/i.test(s)) return true;
  if (
    /hetzner|github rollback|workflow_dispatch|scp |ssh |dockerfile|golang|gmemlimit|oom|skip_v2|skip v2|clerk|jwks|jwt|mongodb|mongo|sonarlint|cors_origins|write_timeout|request_timeout|nginx|persistent disk|render\.yaml|zero-ram|health wait|container logs|github api|node 24|powershell|cmd one-liner/i.test(
      low
    )
  )
    return true;
  if (/^fix:/i.test(s) && /latlng|tofloatval|communityreports build/i.test(low)) return true;
  if (/^osm-by-hex|^ci: opt into node/i.test(s)) return true;
  return false;
}

function humanizeSubject(s) {
  let t = s.trim();
  const merge = t.match(/^Merge pull request #\d+\s+from\s+(.+)$/i);
  if (merge) {
    const branch = stripOrg(merge[1]);
    if (/^staging$/i.test(branch)) return null;
    return `Integrated **${branch}** into main.`;
  }
  if (shouldSkipSubject(t)) return null;
  t = t.replace(/^(feat|fix|perf)(\([^)]*\))?:\s*/i, "");
  t = t.replace(/^feat\([^)]*\):\s*/i, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function bucket(subj) {
  const s = subj.toLowerCase();
  if (/^fix(\(|:)/i.test(s) || /^hotfix/i.test(s)) return "fixes";
  if (/^feat(\(|:)/i.test(s) || /^perf(\(|:)/i.test(s)) return "features";
  return "improvements";
}

function uniq(arr) {
  const seen = new Set();
  return arr.filter((x) => {
    if (!x || seen.has(x)) return false;
    seen.add(x);
    return true;
  });
}

function buildDayDoc(day, lines) {
  const subjects = lines.map((l) => l.split("|").slice(1).join("|").trim());
  const whatsNew = [];
  const improvements = [];
  const fixes = [];

  let mergeCount = 0;
  const mergeBranches = [];
  for (const subj of subjects) {
    if (/^Merge pull request/i.test(subj)) {
      mergeCount++;
      const m = subj.match(/^Merge pull request #\d+\s+from\s+(.+)$/i);
      if (m) {
        const b = stripOrg(m[1]);
        if (!/^staging$/i.test(b)) mergeBranches.push(b);
      }
      continue;
    }
    const h = humanizeSubject(subj);
    if (!h) continue;
    const b = bucket(subj);
    if (b === "fixes") fixes.push(h);
    else if (b === "features") whatsNew.push(h);
    else improvements.push(h);
  }

  const uniqBranches = [...new Set(mergeBranches)];
  if (mergeCount > 0 && uniqBranches.length) {
    const summary =
      uniqBranches.length <= 8
        ? `Release integration: ${uniqBranches.map((x) => `\`${x}\``).join(", ")}.`
        : `Release integration: ${uniqBranches.slice(0, 6).map((x) => `\`${x}\``).join(", ")}, and **${uniqBranches.length - 6}** more branches.`;
    improvements.unshift(summary);
  } else if (mergeCount > 0) {
    improvements.unshift(`**${mergeCount}** merge${mergeCount === 1 ? "" : "s"} to main.`);
  }

  const title = `${TITLE_PREFIX} — ${day}`;
  const desc = `Routing and safety scoring updates merged to main on ${day}.`;

  const tags =
    whatsNew.length > 0
      ? `["Feature", "Enhancement", "Enterprise"]`
      : `["Enhancement", "Enterprise"]`;

  const parts = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(desc)}`,
    `date: "${day}"`,
    `tags: ${tags}`,
    `version: "1.0"`,
    "---",
    "",
  ];

  if (whatsNew.length) {
    parts.push("## What's New", "");
    uniq(whatsNew).slice(0, 15).forEach((x) => parts.push(`- ${x}`));
    parts.push("");
  }
  if (improvements.length) {
    parts.push("## Improvements", "");
    uniq(improvements).slice(0, 18).forEach((x) => parts.push(`- ${x}`));
    parts.push("");
  }
  if (fixes.length) {
    parts.push("## Bug Fixes", "");
    uniq(fixes).slice(0, 15).forEach((x) => parts.push(`- ${x}`));
    parts.push("");
  }

  if (!whatsNew.length && !improvements.length && !fixes.length) {
    return null;
  }

  return parts.join("\n");
}

function main() {
  const raw = gitLog();
  /** @type {Map<string, string[]>} */
  const byDay = new Map();
  for (const line of raw.split("\n")) {
    if (!line.includes("|")) continue;
    const [iso, ...rest] = line.split("|");
    const subj = rest.join("|").trim();
    const day = dayKey(iso);
    if (day < SINCE || day >= UNTIL.slice(0, 10)) continue;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(`${iso}|${subj}`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const days = [...byDay.keys()].sort();
  let wrote = 0;
  for (const day of days) {
    const lines = byDay.get(day);
    const mdx = buildDayDoc(day, lines);
    if (!mdx) {
      console.log("skip (no public bullets)", day);
      continue;
    }
    const out = path.join(OUT_DIR, `${day}.mdx`);
    if (fs.existsSync(out)) {
      console.log("skip (exists)", path.relative(ROOT, out));
      continue;
    }
    fs.writeFileSync(out, mdx, "utf8");
    wrote++;
    console.log("wrote", path.relative(ROOT, out));
  }
  console.log(`done: ${wrote} new files (${days.length} days with commits)`);
}

main();
