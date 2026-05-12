# Project Documentation and Progress Access Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a repeatable, source-grounded way to access LuminaReader project documentation and current development progress.

**Architecture:** Treat documentation and progress as two separate evidence streams: checked-in project artifacts and repository/runtime signals. Because this worktree currently has no README, docs, handoff, or progress files, the plan first inventories the absence of docs, then derives progress from package metadata, routes, store capabilities, TODOs, and git history.

**Tech Stack:** Expo SDK 54, React Native 0.81, React 19, TypeScript 5.9, expo-router, Zustand persistence, FlashList, react-native-render-html, fast-xml-parser.

---

## Current Evidence Snapshot

- Worktree: `/Users/evanconnelly/.codex/worktrees/9eb0/LuminaReader`
- Git state: detached `HEAD` at `2d3eecd`, clean working tree before this plan file was added.
- Documentation files found: none from `find . -maxdepth 3 -type f \( -iname '*readme*' -o -path './docs/*' -o -iname '*plan*' -o -iname '*progress*' -o -iname '*handoff*' \)`.
- Main product surfaces: `/app/(tabs)/index.tsx`, `/app/(tabs)/updates.tsx`, `/app/(tabs)/library.tsx`, `/app/(tabs)/search.tsx`, `/app/(tabs)/settings.tsx`, `/app/reader/[id].tsx`, `/app/speed-reader/[id].tsx`, `/app/entity/[entityId].tsx`.
- Core state and import plumbing: `/src/store/useStore.ts`, `/src/utils/rss.ts`, `/src/utils/ai.ts`.
- Known unfinished work in current tree: `/src/components/nav/LinearTabBar.tsx` quick action `add-article` logs to console and has `TODO: Implement add article`; `/src/theme/useTheme.ts` has `TODO: Implement theme mode switching when light mode is needed`.
- Prior memory is partially stale for this worktree: it references older files like `src/components/library/AddArticleModal.tsx` and `src/screens/reader/ReaderScreen.tsx`, while the current checkout uses expo-router paths under `/app` and has no `src/components/library` directory.

## File Structure

- Read: `/package.json` to identify scripts, dependencies, Expo version, and test/build affordances.
- Read: `/app` route files to identify implemented user-facing screens.
- Read: `/src/store/useStore.ts` to identify persisted state, actions, mock data, and integration state.
- Read: `/src/utils/rss.ts` and `/src/utils/ai.ts` to identify implemented ingestion/enrichment behavior.
- Read: `/src/components/nav/LinearTabBar.tsx` to identify global quick actions and explicit TODOs.
- Read: `git status --short --branch`, `git log --oneline -8 --decorate`, and `git diff --stat` to identify branch state, recent work, and uncommitted changes.
- Optional create during execution: `/docs/project-status.md` as a concise living snapshot if the user wants checked-in documentation after this access plan.

---

### Task 1: Inventory Project Documentation

**Files:**
- Read: `/Users/evanconnelly/.codex/worktrees/9eb0/LuminaReader`
- Optional Create: `/Users/evanconnelly/.codex/worktrees/9eb0/LuminaReader/docs/project-status.md`

- [ ] **Step 1: Confirm repository root**

```bash
pwd
```

Expected current output:

```text
/Users/evanconnelly/.codex/worktrees/9eb0/LuminaReader
```

- [ ] **Step 2: Search for existing documentation and handoff files**

```bash
find . -maxdepth 3 -type f \( -iname '*readme*' -o -path './docs/*' -o -iname '*plan*' -o -iname '*progress*' -o -iname '*handoff*' \)
```

Expected current output:

```text
```

Interpretation: there is no checked-in README, docs directory, progress file, handoff, or existing plan in the current worktree before this Superpowers plan.

- [ ] **Step 3: If durable docs are requested, create a status document**

Create `/docs/project-status.md` with this exact structure:

```markdown
# LuminaReader Project Status

## Last Reviewed

- Date: 2026-05-11
- Worktree: `/Users/evanconnelly/.codex/worktrees/9eb0/LuminaReader`
- Git: detached `HEAD` at `2d3eecd`

## Documentation

- No README, handoff, progress report, or project docs were present before `docs/superpowers/plans/2026-05-11-project-docs-progress-access.md`.

## Implemented Surfaces

- Discover feed: `/app/(tabs)/index.tsx`
- Updates feed: `/app/(tabs)/updates.tsx`
- Library: `/app/(tabs)/library.tsx`
- Search: `/app/(tabs)/search.tsx`
- Settings: `/app/(tabs)/settings.tsx`
- Reader: `/app/reader/[id].tsx`
- Speed reader: `/app/speed-reader/[id].tsx`
- Entity view: `/app/entity/[entityId].tsx`

## Development Progress

- RSS feed import exists through `/src/utils/rss.ts` and `/src/store/useStore.ts`.
- Reader rendering exists through `/app/reader/[id].tsx` and `react-native-render-html`.
- Saved library exists through `/app/(tabs)/library.tsx` and `savedArticles` in `/src/store/useStore.ts`.
- Entity graph is currently mock-backed in `/src/store/useStore.ts`.
- AI processing is mock-backed in `/src/utils/ai.ts`.

## Open Work

- Implement the `add-article` quick action in `/src/components/nav/LinearTabBar.tsx`.
- Decide whether URL article import runs client-side, through a small API, or through a local service.
- Replace mock AI/entity enrichment with real extraction if that remains in scope.
```

- [ ] **Step 4: Commit docs only if requested**

```bash
git add docs/project-status.md
git commit -m "docs: add LuminaReader project status"
```

Expected: commit succeeds only after the user asks for a committed status document.

---

### Task 2: Inventory Development Progress From Source

**Files:**
- Read: `/Users/evanconnelly/.codex/worktrees/9eb0/LuminaReader/package.json`
- Read: `/Users/evanconnelly/.codex/worktrees/9eb0/LuminaReader/app/(tabs)/index.tsx`
- Read: `/Users/evanconnelly/.codex/worktrees/9eb0/LuminaReader/app/reader/[id].tsx`
- Read: `/Users/evanconnelly/.codex/worktrees/9eb0/LuminaReader/src/store/useStore.ts`
- Read: `/Users/evanconnelly/.codex/worktrees/9eb0/LuminaReader/src/utils/rss.ts`
- Read: `/Users/evanconnelly/.codex/worktrees/9eb0/LuminaReader/src/utils/ai.ts`

- [ ] **Step 1: Read project metadata**

```bash
sed -n '1,220p' package.json
```

Expected current facts:

```text
name: lumina-reader
scripts: start, android, ios, web
framework: Expo SDK 54 with React Native 0.81.5
state: zustand with AsyncStorage
reader rendering: react-native-render-html
RSS parsing: fast-xml-parser
```

- [ ] **Step 2: Read app routes**

```bash
rg --files app src | sort
```

Expected current route categories:

```text
app/(tabs)/index.tsx        Discover feed and add RSS feed UI
app/(tabs)/updates.tsx      Updates and unread article feed
app/(tabs)/library.tsx      Saved article library
app/(tabs)/search.tsx       Article and entity search
app/(tabs)/settings.tsx     Webhook, theme, and typography settings
app/reader/[id].tsx         HTML reader and article properties
app/speed-reader/[id].tsx   Speed-reading surface
app/entity/[entityId].tsx   Entity detail and contextual article grouping
```

- [ ] **Step 3: Read the store as the source of truth for progress**

```bash
sed -n '1,220p' src/store/useStore.ts
sed -n '260,380p' src/store/useStore.ts
```

Expected current facts:

```text
Implemented: Feed, Article, Settings, TabPreferences, Entity, EntityEdge, ArticleEntityRef types.
Implemented: persisted feeds, articles, savedArticles, settings, tab preferences, entities, articleEntityRefs.
Implemented: addFeed, removeFeed, saveArticle, unsaveArticle, markAsRead, refreshAllFeeds, triggerSync.
Mock-backed: entity seed data and articleEntityRefs.
Mock-backed: article enrichment through mockAIProcessArticle.
```

- [ ] **Step 4: Read RSS import implementation**

```bash
sed -n '1,140p' src/utils/rss.ts
```

Expected current facts:

```text
Implemented: fetch RSS or Atom URL, parse XML, derive feed metadata, map items to Article.
Limitation: import currently consumes feeds, not arbitrary article URLs.
Limitation: content cleanup is basic HTML stripping and does not use a readability parser.
```

- [ ] **Step 5: Read reader implementation**

```bash
sed -n '1,220p' 'app/reader/[id].tsx'
```

Expected current facts:

```text
Implemented: reader lookup by article id, save/unsave action, entity chips, summary block, RenderHtml body.
Open: note and share actions currently log to console.
```

---

### Task 3: Inventory Progress From Git

**Files:**
- Read: Git metadata for `/Users/evanconnelly/.codex/worktrees/9eb0/LuminaReader`

- [ ] **Step 1: Check current branch and dirty state**

```bash
git status --short --branch
```

Expected current output before this plan file was added:

```text
## HEAD (no branch)
```

Expected current output after this plan file exists:

```text
## HEAD (no branch)
?? docs/
```

- [ ] **Step 2: Check recent work history**

```bash
git log --oneline -8 --decorate
```

Expected current commits:

```text
2d3eecd (HEAD, master) Finish: implemented context-aware action bar, settings screen, and favicon support. Migrated all components to new design system.
ce566e2 Refine: fixed article safe area padding, enforced serif typography for summaries, and optimized spacing density
0d82fcf Fix: handled ExpoBlurView native unimplemented error and resolved SafeAreaView deprecations
b775812 Refining Linear design: implemented light mode, typography enforcement, and spacing optimization in article view
e53e6e1 Initial commit
```

- [ ] **Step 3: Check uncommitted file-level changes**

```bash
git diff --stat
```

Expected current output before editing tracked files:

```text
```

Interpretation: the worktree was clean before adding this plan, and the only current untracked change should be `/docs/superpowers/plans/2026-05-11-project-docs-progress-access.md`.

---

### Task 4: Reconcile Memory With Current Worktree

**Files:**
- Read: `/Users/evanconnelly/.codex/memories/MEMORY.md`
- Read: `/Users/evanconnelly/.codex/memories/rollout_summaries/2026-04-28T19-34-07-nYaF-luminareader_ladder_import_planning.md`

- [ ] **Step 1: Pull prior LuminaReader context**

```bash
rg -n "LuminaReader|Ladder|Reader import|No bypass|AddArticleModal|ReaderScreen" /Users/evanconnelly/.codex/memories/MEMORY.md
```

Expected current facts:

```text
Prior direction: Reader import.
Prior boundary: No bypass.
Prior unresolved architecture decision: in-app importer vs small API vs local proxy service.
```

- [ ] **Step 2: Mark stale file references explicitly**

Record this in any follow-up report:

```text
The prior memory references `src/components/library/AddArticleModal.tsx` and `src/screens/reader/ReaderScreen.tsx`; those files are not present in the current worktree. Current equivalents are the RSS/feed import surface in `/app/(tabs)/index.tsx`, global quick action in `/src/components/nav/LinearTabBar.tsx`, reader route in `/app/reader/[id].tsx`, and article state in `/src/store/useStore.ts`.
```

- [ ] **Step 3: Preserve the still-valid product boundary**

Use this exact scope statement for future planning:

```text
For LuminaReader, default toward reader-centric URL import and cleanup, not a general proxy or paywall-bypass surface. If arbitrary article URL import is implemented, first decide whether fetching and extraction run inside the Expo app, in a small API, or in a local service.
```

---

## Self-Review

- Spec coverage: The plan covers how to access current docs, confirms there are no existing docs in this worktree, identifies the source files that reveal progress, and includes git commands for current development state.
- Placeholder scan: No `TBD`, vague `TODO`, or unspecified files remain in this plan.
- Type consistency: Current file paths match the inspected worktree; stale memory paths are identified as stale rather than reused as current source paths.
