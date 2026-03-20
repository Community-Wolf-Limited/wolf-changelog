#!/usr/bin/env node
/**
 * Ensures the five core Wolf products have changelog/_meta.json and at least one .mdx entry.
 * Exit 1 if anything is missing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CHANGELOG = path.join(ROOT, "changelog");

const CORE = [
  "wolf-enterprise-frontend",
  "wolf-community-frontend",
  "wolf-server",
  "wolf-safety-router",
  "wolf-patrol-app",
];

let failed = false;
for (const slug of CORE) {
  const dir = path.join(CHANGELOG, slug);
  const meta = path.join(dir, "_meta.json");
  if (!fs.existsSync(meta)) {
    console.error(`missing: ${path.relative(ROOT, meta)}`);
    failed = true;
    continue;
  }
  const mdx = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") && f !== "index.mdx");
  if (mdx.length === 0) {
    console.error(`no MDX entries in ${slug}/`);
    failed = true;
  } else {
    console.log(`ok  ${slug} (${mdx.length} entries)`);
  }
}

if (failed) {
  process.exit(1);
}
console.log("verify-core-changelogs: all 5 products have _meta.json and MDX.");
