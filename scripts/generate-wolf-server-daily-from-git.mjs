#!/usr/bin/env node
/**
 * Reads git log from wolf-server origin/main and writes/updates
 * changelog/wolf-server/YYYY-MM-DD.mdx for each calendar day (author date).
 *
 * Usage:
 *   WOLF_SERVER_ROOT=../wolf-server node scripts/generate-wolf-server-daily-from-git.mjs
 *
 * Defaults: last ~60 days from 2026-01-20 through 2026-03-20 (edit SINCE/UNTIL below).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WOLF_SERVER = path.resolve(
  process.env.WOLF_SERVER_ROOT ?? path.join(ROOT, "..", "wolf-server")
);
const OUT_DIR = path.join(ROOT, "changelog", "wolf-server");

const SINCE = process.env.CHANGELOG_SINCE ?? "2026-01-20";
const UNTIL = process.env.CHANGELOG_UNTIL ?? "2026-03-21";

function gitLog() {
  try {
    return execSync(
      `git -C "${WOLF_SERVER}" log origin/main --since="${SINCE}" --until="${UNTIL}" --format="%aI|%s" --reverse`,
      { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
    );
  } catch (e) {
    console.error("git log failed — set WOLF_SERVER_ROOT or run from monorepo with wolf-server sibling.");
    throw e;
  }
}

function dayKey(iso) {
  return iso.slice(0, 10);
}

function shouldSkipSubject(s) {
  const low = s.toLowerCase();
  if (/^merge branch /i.test(s)) return true;
  if (/chore\(changelog\)/i.test(s)) return true;
  if (/^chore:/i.test(s) && !/chore\(admin\)/i.test(s)) return true;
  if (/^chore\(auth\):/i.test(s)) return true;
  if (/^fix\(build\)/i.test(s) || /^fix\(types\)/i.test(s)) return true;
  if (/^style\(/i.test(s)) return true;
  if (/^refactor\(/i.test(s) && /verbose debug/i.test(s)) return true;
  if (/mongodb|mongoose|tsconfig|types\.d\.ts|declaration for build/i.test(low)) return true;
  if (/resolve typescript build errors/i.test(low)) return true;
  if (/^add turf geospatial dependencies$/i.test(s.trim())) return true;
  return false;
}

function humanizeSubject(s) {
  let t = s.trim();
  const merge = t.match(/^Merge pull request #\d+\s+from\s+(.+)$/i);
  if (merge) {
    const branch = merge[1].replace(/^Community-Wolf-Limited\//, "").replace(/^rhinoella\//, "");
    if (/^staging$/i.test(branch.trim())) return null;
    return `Shipped **${branch.trim()}** to main.`;
  }
  if (shouldSkipSubject(t)) return null;
  t = t.replace(/^(feat|fix|perf|chore|refactor|docs|style|test)(\([^)]*\))?:\s*/i, "");
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
        const b = m[1].replace(/^Community-Wolf-Limited\//, "").replace(/^rhinoella\//, "").trim();
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
    improvements.unshift(
      `**${mergeCount}** merge${mergeCount === 1 ? "" : "s"} to main (including staging integration).`
    );
  }

  const title = `Platform APIs — ${day}`;
  const desc = `Updates merged to main on ${day}.`;

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
    parts.push("## Improvements", "", `- Platform updates merged to main this day.`, "");
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
  for (const day of days) {
    const lines = byDay.get(day);
    const mdx = buildDayDoc(day, lines);
    const out = path.join(OUT_DIR, `${day}.mdx`);
    fs.writeFileSync(out, mdx, "utf8");
    console.log("wrote", path.relative(ROOT, out));
  }
  console.log(`done: ${days.length} days`);
}

main();
