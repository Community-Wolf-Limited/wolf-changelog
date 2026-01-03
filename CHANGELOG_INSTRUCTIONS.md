# Changelog Entry Creation Guide

This document explains how to create changelog entries for our public changelog. The changelog is hosted separately and entries are synced from your repository.

## Important: Security Guidelines

**Never include in changelog entries:**
- API routes, endpoints, or URL paths
- Internal system names or architecture details
- Database schemas or field names
- Authentication/authorization implementation details
- Error codes or internal error handling logic
- Third-party service names or integration details
- Anything that reveals how systems work internally

**Always keep entries:**
- High-level and user-focused
- Summaritive rather than detailed
- Focused on outcomes and benefits, not implementation

## File Location

Place your changelog files in the `/changelog` folder of your repository:

```
your-repo/
  changelog/
    2025-01-15.mdx
    2025-02-01.mdx
```

## File Naming

Use the release date: `YYYY-MM-DD.mdx`

For multiple releases on the same day: `2025-01-15-hotfix.mdx`

## MDX File Structure

### Required Frontmatter

```yaml
---
title: "Brief, descriptive title"
description: "One sentence summary"
date: "YYYY-MM-DD"
tags: ["Tag1", "Tag2"]
version: "X.Y"
images: ["image-name.png", "demo.mp4"]
---
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Short, descriptive title |
| `description` | Yes | One-sentence summary |
| `date` | Yes | Release date (YYYY-MM-DD) |
| `tags` | No | Array of category tags |
| `version` | No | Version number (e.g., "1.2") |
| `images` | No | Array of image/video filenames with extension |

### Tags

Use 2-4 relevant tags per entry:

- **Type**: `Feature`, `Enhancement`, `Bug Fix`, `Security`, `Performance`
- **Impact**: `Breaking Change`, `Deprecation`
- **Tier**: `Enterprise`, `Pro`, `Free`

### Images and Videos

Place media files in a corresponding images folder that will be synced to the public changelog:

```
public/changelog/{product}/images/My Screenshot.png
public/changelog/{product}/images/Demo.mp4
```

Reference in frontmatter (include file extension):
```yaml
images: ["My Screenshot.png", "Demo.mp4"]
```

Supported formats: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.mp4`, `.webm`

## Content Structure

```mdx
---
title: "Release Title"
description: "Brief description"
date: "2025-01-15"
tags: ["Feature", "Enhancement"]
version: "2.1"
images: ["feature-preview.png"]
---

## What's New

- **Feature name**: What users can now do and why it helps them
- **Another feature**: The benefit to users

## Improvements

- **Area improved**: What's better for users now
- Faster performance when doing X

## Bug Fixes

- Fixed issue where users couldn't do X
- Resolved problem with Y not working correctly
```

## Writing Guidelines

### Do

- Focus on what users can do, not how it works
- Lead with the benefit: "Faster exports" not "Optimized export processing"
- Be specific about user impact: "Fixed login issues on mobile"
- Use active voice: "Added dark mode"
- Group related changes together
- Keep it scannable - users skim changelogs

### Don't

- Expose technical implementation details
- Mention internal systems, services, or infrastructure
- Include API routes or endpoint paths
- Reference database changes or schema updates
- Share authentication/security implementation specifics
- Use internal terminology or codenames
- Write lengthy technical explanations

### Examples

**Bad (exposes internals):**
> Added new `/api/v2/users/sync` endpoint with Redis caching

**Good (user-focused):**
> User data now syncs faster across devices

**Bad (too technical):**
> Migrated auth from JWT to session-based with httpOnly cookies

**Good (user-focused):**
> Improved account security with enhanced session management

**Bad (internal details):**
> Fixed race condition in ProcessingQueue causing duplicate webhook deliveries

**Good (user-focused):**
> Fixed issue where some notifications were sent multiple times

## What to Include

**Always include:**
- New features users can interact with
- Bug fixes that affected users
- Performance improvements users will notice
- Breaking changes requiring user action

**Skip:**
- Internal refactoring
- Dependency updates (unless user-facing)
- Infrastructure changes
- Code quality improvements
- Test changes

## Using Accordions

For longer entries, use accordions to keep content scannable:

```mdx
<Accordion type="multiple" collapsible>
  <AccordionItem value="features">
    <AccordionTrigger>Features</AccordionTrigger>
    <AccordionContent>
      - Feature 1 details
      - Feature 2 details
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

## Quick Reference

```yaml
---
title: "Your Title"              # Required
description: "One sentence"      # Required
date: "YYYY-MM-DD"               # Required
tags: ["Tag1", "Tag2"]           # Optional
version: "X.Y"                   # Optional
images: ["screenshot.png"]       # Optional
---

Your user-focused content here...
```
