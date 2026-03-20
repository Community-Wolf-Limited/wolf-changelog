#!/usr/bin/env node
/**
 * Reads git log from wolf-community-frontend origin/main and writes
 * changelog/wolf-community-frontend/YYYY-MM-DD.mdx per author date.
 *
 * Usage:
 *   WOLF_COMMUNITY_FRONTEND_ROOT=../wolf-community-frontend node scripts/generate-wolf-community-frontend-daily-from-git.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPO = path.resolve(
  process.env.WOLF_COMMUNITY_FRONTEND_ROOT ??
    path.join(ROOT, "..", "wolf-community-frontend")
);
const OUT_DIR = path.join(ROOT, "changelog", "wolf-community-frontend");

const SINCE = process.env.CHANGELOG_SINCE ?? "2026-01-20";
const UNTIL = process.env.CHANGELOG_UNTIL ?? "2026-03-21";

const TITLE_PREFIX = "Community App";

function stripOrg(branch) {
  return branch
    .replace(/^Community-Wolf-Limited\//, "")
    .replace(/^MichaelHoughtonDeBox\//, "")
    .replace(/^rhinoella\//, "")
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
      "git log failed — set WOLF_COMMUNITY_FRONTEND_ROOT or clone wolf-community-frontend next to wolf-changelog."
    );
    throw e;
  }
}

function dayKey(iso) {
  return iso.slice(0, 10);
}

function shouldSkipSubject(s) {
  const low = s.toLowerCase();
  if (/^merge branch /i.test(s)) return true;
  if (/^chore(\(|:)/i.test(s)) return true;
  if (/^fix\(build\)/i.test(s) || /^fix\(types\)/i.test(s)) return true;
  if (/^style\(/i.test(s)) return true;
  if (/^docs:/i.test(s) && /readme|boilerplate/i.test(low)) return true;
  if (/mongodb|mongoose|tsconfig|types\.d\.ts/i.test(low)) return true;
  return false;
}

function humanizeSubject(s) {
  let t = s.trim();
  const merge = t.match(/^Merge pull request #\d+\s+from\s+(.+)$/i);
  if (merge) {
    const branch = stripOrg(merge[1]);
    if (/^staging$/i.test(branch)) return null;
    return `Shipped **${branch}** to main.`;
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
    improvements.unshift(
      `**${mergeCount}** merge${mergeCount === 1 ? "" : "s"} to main.`
    );
  }

  const title = `${TITLE_PREFIX} — ${day}`;
  const desc = `Updates merged to main on ${day}.`;

  const tags =
    whatsNew.length > 0
      ? `["Feature", "Enhancement", "Free"]`
      : `["Enhancement", "Free"]`;

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
    parts.push("## Improvements", "", `- Updates merged to main this day.`, "");
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
