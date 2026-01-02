# Changelog Entry Creation Guide

This document explains how to create a changelog entry from Git commits or PR history for this multi-product changelog system.

## Overview

This changelog uses MDX files organized by product. Each product has its own folder under `changelog/`, and each release gets its own MDX file.

## File Location

Place the MDX file in the appropriate product folder:

```
changelog/
├── wolf/              → Wolf platform changes
├── wa-agents/         → WhatsApp Agents changes
├── patroller/         → Patroller changes
├── rostering/         → Rostering changes
├── group-feeds/       → Group Feeds changes
├── namola/            → Namola changes
├── access-control/    → Access Control changes
├── api/               → API changes
└── safety-model/      → Safety Model changes
```

## File Naming Convention

Name the file using the release date in `YYYY-MM-DD.mdx` format:

- `2025-01-15.mdx`
- `2025-02-01.mdx`

If multiple releases happen on the same day, append a suffix: `2025-01-15-hotfix.mdx`

## MDX File Structure

### Required Frontmatter

Every MDX file MUST start with YAML frontmatter between `---` delimiters:

```yaml
---
title: "Brief, descriptive title of the release"
description: "One sentence summary of what changed"
date: "YYYY-MM-DD"
tags: ["Tag1", "Tag2"]
version: "X.Y"
---
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Short, descriptive title (e.g., "Performance Improvements", "New Dashboard Features") |
| `description` | Yes | One-sentence summary for previews/SEO |
| `date` | Yes | Release date in YYYY-MM-DD format |
| `tags` | No | Array of category tags (see Tag Guidelines below) |
| `version` | No | Version number if applicable (e.g., "1.2", "2.0") |

### Tag Guidelines

Use consistent tags across entries. Common tags include:

- **Feature type**: `Feature`, `Enhancement`, `Bug Fix`, `Security`, `Performance`
- **Area**: `UI`, `API`, `Backend`, `Database`, `Infrastructure`
- **Technology**: `AI`, `ML`, `Integration`
- **Impact**: `Breaking Change`, `Deprecation`

Limit to 2-4 relevant tags per entry.

## Content Structure

After the frontmatter, write the changelog content in Markdown:

### Recommended Structure

```mdx
---
title: "Release Title"
description: "Brief description"
date: "2025-01-15"
tags: ["Feature", "UI"]
version: "2.1"
---

Brief introductory paragraph explaining the main focus of this release.

## What's New

- **Feature name**: Description of the feature and its benefit
- **Another feature**: What it does and why it matters

## Improvements

- **Area improved**: What was improved and the impact
- Performance enhancements to X, resulting in Y% faster load times

## Bug Fixes

- Fixed issue where X would cause Y
- Resolved crash when doing Z

## Breaking Changes

> **Note**: If upgrading from version X.X, you will need to...

- List any breaking changes clearly
- Provide migration steps if needed
```

### Using Accordions for Long Content

For detailed release notes, use accordions to keep the page scannable:

```mdx
<Accordion type="multiple" collapsible>
  <AccordionItem value="features">
    <AccordionTrigger>Features</AccordionTrigger>
    <AccordionContent>
      - Feature 1 details
      - Feature 2 details
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="fixes">
    <AccordionTrigger>Bug Fixes</AccordionTrigger>
    <AccordionContent>
      - Fix 1 details
      - Fix 2 details
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Adding Media

**Images:**
```mdx
![Alt text description](/path/to/image.png)
```

**Videos:**
```mdx
<Video src="/path/to/video.mp4" />
```

**Code blocks:**
````mdx
```typescript
// Example code
const example = "code";
```
````

## Converting Git Commits/PRs to Changelog

### Step 1: Gather the Changes

Run these commands to see what changed:

```bash
# See commits since last release
git log --oneline v1.0.0..HEAD

# See commits between dates
git log --oneline --since="2025-01-01" --until="2025-01-15"

# See files changed
git diff --stat v1.0.0..HEAD
```

### Step 2: Categorize Changes

Group commits into categories:
1. **New Features** - New functionality added
2. **Enhancements** - Improvements to existing features
3. **Bug Fixes** - Issues that were resolved
4. **Performance** - Speed/efficiency improvements
5. **Security** - Security-related changes
6. **Breaking Changes** - Changes requiring user action

### Step 3: Write User-Focused Descriptions

Transform technical commits into user-friendly descriptions:

❌ **Bad (too technical):**
> "refactor: move auth logic to middleware, update JWT validation"

✅ **Good (user-focused):**
> "**Improved authentication**: Login is now faster and more reliable"

❌ **Bad (vague):**
> "fix: bug fixes"

✅ **Good (specific):**
> "Fixed issue where dashboard would show stale data after switching accounts"

### Step 4: Prioritize What to Include

**Always include:**
- New features users can interact with
- Bug fixes that affected users
- Breaking changes or deprecations
- Security updates

**Usually skip:**
- Internal refactoring (unless it improves performance)
- Dependency updates (unless security-related)
- Code style changes
- Test additions (unless they fix flaky behavior users experienced)

## Writing Style Guidelines

1. **Be concise** - Users scan changelogs, don't write essays
2. **Lead with the benefit** - "Faster load times" not "Optimized database queries"
3. **Use active voice** - "Added dark mode" not "Dark mode was added"
4. **Be specific** - "Fixed crash on iOS 17" not "Fixed mobile bug"
5. **Avoid jargon** - Write for users, not developers
6. **Group related changes** - Don't list 10 separate UI tweaks, summarize them

## Example Complete Entry

```mdx
---
title: "Enhanced Search and Performance Improvements"
description: "Faster search with new filters and 40% performance improvement"
date: "2025-01-15"
tags: ["Feature", "Performance", "UI"]
version: "2.3"
---

This release focuses on making search more powerful and the entire app faster.

- **Advanced search filters**: Filter results by date, status, and category
- **40% faster page loads**: Optimized data fetching across the app
- **Keyboard shortcuts**: Press `/` to focus search, `Esc` to close modals

<Accordion type="multiple" collapsible>
  <AccordionItem value="features">
    <AccordionTrigger>Features</AccordionTrigger>
    <AccordionContent>
      - Added date range picker to search filters
      - New "saved searches" feature to quickly access frequent queries
      - Export search results to CSV
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="fixes">
    <AccordionTrigger>Bug Fixes</AccordionTrigger>
    <AccordionContent>
      - Fixed search results not updating when filters changed
      - Resolved issue where special characters broke search
      - Fixed pagination resetting when applying new filters
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

## After Creating the File

1. Save the file in the correct product folder
2. Run `npx fumadocs-mdx` to regenerate the source index
3. The entry will automatically appear in the changelog under the correct product tab

## Quick Reference

```yaml
---
title: "Your Title Here"           # Required
description: "One sentence"        # Required
date: "YYYY-MM-DD"                 # Required
tags: ["Tag1", "Tag2"]             # Optional
version: "X.Y"                     # Optional
---

Your markdown content here...
```
