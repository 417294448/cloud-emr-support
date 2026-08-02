---
name: build-emr-console
description: Refreshes and regenerates the Cloud Big Data Version Intelligence Console (AWS EMR + Azure HDInsight + GCP Dataproc + Alibaba Cloud EMR, with more providers to come). Documents exactly where and how to re-fetch each provider's source data (which docs pages, which tables, how each JSON is structured), then bundles the latest aws-emr-application-version-info.json, azure-hdinsight-application-version-info.json, gcp-dataproc-application-version-info.json, and aliyun-emr-application-version-info.json together with the current style.css/app.js/dom-utils.js/i18n.js/aws-emr-queries.js/aws-emr-view.js/azure-hdinsight-queries.js/azure-hdinsight-view.js/gcp-dataproc-queries.js/gcp-dataproc-view.js/aliyun-emr-queries.js/aliyun-emr-view.js/theme.js into a single self-contained document, then immediately promotes it to be the live index.html (backing up the previous index.html as index-old.html — no separate review gate). Use this whenever the user wants to pull the latest AWS EMR, Azure HDInsight, GCP Dataproc (Managed Service for Apache Spark), or Alibaba Cloud EMR on ECS release/version data from the vendor docs, edits any provider's JSON data file by hand (new release data, new application descriptions, updated support-policy/lifecycle or release dates) and wants to see the result, or asks to "rebuild", "regenerate", "refresh", or "update" the console / index page / version data.
---

# Build and promote the Cloud Console

## 运行环境

| 依赖 | 版本要求 |
|---|---|
| Python | 3.8+（建议 3.10+），并安装 `beautifulsoup4`（`pip install beautifulsoup4`） — GCP Dataproc 与阿里云 EMR 两个数据源的页面解析依赖 `bs4`/`BeautifulSoup` |
| Node.js | 18.0+ — 所有 build/verify/promote 脚本（`scripts/build-data.js`、`scripts/verify-*-queries.js`、`.claude/skills/build-emr-console/scripts/build-index-new.js`）均要求 Node 运行时 |
| curl | 任意现代版本 — 各云厂商文档站点对内置 web fetch 工具均有限制，实际抓取通过 `curl -sL -A "Mozilla/5.0" <url>` 完成 |

仅在重新抓取云厂商文档更新 JSON 数据时才需要 Python + `bs4`；若只是手工编辑了某个
`*-application-version-info.json` 后重跑构建，Node.js 即可满足全部步骤。

## Guard: skip when no data changed

**Before doing anything else, check whether any `*-application-version-info.json`
file has actually changed** (e.g. `git status` / `git diff --stat` against the
working tree, or simply confirm with the user which JSON file they edited). If
**none** of `aws-emr-application-version-info.json`,
`azure-hdinsight-application-version-info.json`,
`gcp-dataproc-application-version-info.json`, or
`aliyun-emr-application-version-info.json` has been modified, **stop immediately
— do not run any of the build/verify/promote steps below.** Rebuilding from
unchanged JSON sources produces byte-identical output and only churns
`index.html` / `index-old.html` for no benefit. When in doubt, ask the user
which provider's JSON changed before running anything.

## Why this exists

The console (`index.html`) is assembled from several files per cloud provider:
a JSON data source (`aws-emr-application-version-info.json`,
`azure-hdinsight-application-version-info.json`,
`gcp-dataproc-application-version-info.json`,
`aliyun-emr-application-version-info.json`), a build step
(`scripts/build-data.js`) that turns each one into `data/<provider>-data.js`,
and a pair of plain JS files per provider (`aws-emr-queries.js` +
`aws-emr-view.js`, `azure-hdinsight-queries.js` + `azure-hdinsight-view.js`,
`gcp-dataproc-queries.js` + `gcp-dataproc-view.js`, `aliyun-emr-queries.js` +
`aliyun-emr-view.js`) plus the shared `dom-utils.js`, `i18n.js`, `app.js`,
`theme.js`, and `style.css` that `index.html` loads via `<script>`/`<link>`
tags.

Most of the time, only a JSON data file changes (a new release, an updated
application description, a new support-policy or release date). This skill
takes that changed JSON, rebuilds every provider's `data/*-data.js`, inlines
all of it plus the current `style.css`/`dom-utils.js`/`i18n.js`/`app.js`/
`theme.js` and every provider's `*-queries.js`/`*-view.js` into one
self-contained document (`index-new.html`), and then **immediately promotes
it**: the live
`index.html` is renamed to `index-old.html` (overwriting any previous backup)
and `index-new.html` takes its place as the new `index.html`. There is no
review gate in between — the promotion happens automatically as part of
running the skill, on the theory that rebuilding from the same source files
is deterministic and safe, and `index-old.html` is there specifically so a
bad result is one file-swap away from being undone.

**Consequence worth knowing:** after promotion, the live `index.html` is a
generated artifact — a frozen, fully-inlined snapshot — not a live reference
to `style.css`/`dom-utils.js`/the provider `.js` files anymore. If you hand-edit
`index.html` directly after this point, that edit will be silently discarded
(moved into `index-old.html`) the next time this skill runs. The actual
source of truth to edit going forward is still the modular files
(`style.css`, `app.js`, `dom-utils.js`, `i18n.js`, each provider's
`*-queries.js` / `*-view.js`, and the JSON data files) — treat `index.html`
the way you'd
treat a `dist/` build output.

When a new provider gets its own JSON source, queries file, and view file
following the same pattern, wire it into all three places that currently know
about the existing four providers:

1. `scripts/build-data.js` — add an entry to the `PROVIDERS` array so its
   JSON gets built into `data/<provider>-data.js`.
2. `app.js` — add an entry to its `PROVIDERS` array with the new
   `view: window.<Provider>View`, or the tab will stay stuck showing
   "Not yet supported" even once the JSON and view file exist.
3. `.claude/skills/build-emr-console/scripts/build-index-new.js` — add
   `read()` calls for its data/queries/view files (in the same relative order
   as the existing providers: data file, then shared files, then each
   provider's queries then view file, per the comment at the top of that
   script) **and** add matching `<script>` lines to the HTML template string
   in the same file. This script's template is the *only* place the page
   structure is defined now — see the note below about `index.html` no
   longer being a hand-edited file.

**UI language (i18n).** The console UI is bilingual (English/Chinese) via
`i18n.js`, which holds the UI string dictionary (`I18n.t(key)`), the language
detection/persistence, and the change notification that `app.js` subscribes
to for re-rendering. **Load order matters:** `i18n.js` must be inlined
*after* `dom-utils.js` but *before* every provider's `*-view.js` — each view
file runs `const t = window.I18n.t;` at the top of its IIFE, which evaluates
`window.I18n` immediately when that script block executes. If `i18n.js` loads
after any view (e.g. right before `app.js`), that view's whole script block
throws, `window.<Provider>View` stays `undefined`, and the panel renders no
table at all. All user-facing UI strings live in `i18n.js`'s dictionary —
never hardcode English in a `*-view.js` or in the `build-index-new.js` HTML
template; add a dictionary key (both `en` and `zh`) and reference it via
`I18n.t(key)` instead. Component *descriptions* are bilingual too, stored
per-entry as `{"en","zh"}` in each provider's `applicationDescriptions` (see
above), and rendered per the active language with English fallback. The same
`{"en","zh"}` treatment applies to the *support-policy prose* shown in each
provider's banner — `standardSupportPolicy.note` and, for Alibaba Cloud, the
`standardSupportPolicy.milestones` (GA/EOM/EOS) blurbs: when editing these,
keep both languages in sync (proper nouns like Standard/Basic support, RCA,
CVE, GA/EOM/EOS, "Supported until", SLA stay in English, not translated).
`node scripts/i18n-descriptions.js` re-applies the shared Chinese
translations for known component descriptions *and* these policy texts, and
is idempotent (already-bilingual entries are skipped).

**Static text baked into the HTML template** (the header `<h1>`, the header
subtitle, and the aria-label/tooltip on the home-link and the theme/language
toggle buttons) is *not* translated by editing the template string. Those
elements carry stable ids (`#header-title`, `#header-subtitle`, `#home-link`,
`#theme-toggle`, `#lang-toggle`), and `app.js`'s `applyStaticText()`
overwrites their text at runtime from the i18n dictionary (`headerTitle`,
`headerSubtitle`, `homeLinkAria`, `themeToggleAria`, `langToggleAria`) on
initial load and on every language switch. So when you add or change a piece
of static UI chrome in the `build-index-new.js` template: give it an id, add
a dictionary key in `i18n.js` (both `en` and `zh`), and wire it into
`applyStaticText()` — the literal text in the template is just the pre-JS
placeholder, not the source of truth. (The `#home-link` in `.header-actions`
links back to the site root `https://www.cloudproduct.top/`; it opens in a
new tab via `target="_blank"` and its icon is pure CSS, so only its
aria-label/title needs a dictionary entry.)

Everything else in this skill (the steps below) stays the same regardless of
how many providers exist.

## Refreshing the source data per provider

Each provider's JSON is hand-curated from a different vendor docs site with a
different page structure and a different extraction quirk. There's no single
shared scraper — follow the provider-specific recipe below, then continue
with **Steps to rebuild the preview after the JSON is updated** below. If
you're onboarding a brand-new provider that doesn't have a recipe here yet,
add one in the same format (source URL, which tables/sections to read, any
fetch quirks, the resulting JSON shape) once you've worked out how its docs
site is structured — don't skip writing it down just because it was a
one-off investigation.

**Important: rediscover the version list every time, don't trust the examples
below.** Every specific release/version number named in this section (AWS's
4.x–7.x, Azure's 5.1/5.0/4.0, GCP's 3.0/2.3/2.2/2.1, Alibaba Cloud's
EMR-5.20.x/EMR-3.54.x as the newest rows) is a snapshot of what existed when
this skill was last updated — it drifts. AWS will eventually publish an 8.x
series, GCP's 3.0 preview will go GA and probably get sibling minor versions,
Azure's 5.1 will stop being the newest row, Alibaba Cloud will keep shipping
new EMR-5.x/EMR-3.x minor versions on its usual cadence. Treat each
provider's main listing page as the live source of truth: re-fetch it fresh,
parse **whatever** version links/table rows it currently contains, and follow
**all** of them — don't hardcode the counts or numbers below into a script or
assume the page still has exactly as many rows as it did before. The concrete
numbers below are illustrations of the pattern, not a checklist to reproduce.

### AWS EMR → `aws-emr-application-version-info.json`

- Start at
  `https://docs.amazonaws.cn/en_us/emr/latest/ReleaseGuide/emr-release-components.html`.
  Under **"A comprehensive history of application versions"** it links to one
  page per release series — read the bullet list at fetch time and follow
  every link it contains (as of this writing: `emr-release-app-versions-4.x.html`
  through `-7.x.html`; a future fetch may additionally find `-8.x.html`, and
  should include it without being told to).
- Fetch the **Markdown** export of each series page, not the HTML —
  `.../emr-release-app-versions-<series>.md` instead of `.html`. The HTML page
  renders its giant version table client-side and doesn't contain the full
  data in the static markup; the `.md` export has the same table as a plain
  pipe-table with every release as a column. `WebFetch` is blocked for this
  domain — fetch with `curl -sL -A "Mozilla/5.0" <url>` instead.
- Each `.md` file has one table under **"Application version information"**:
  first column is the application name, remaining columns are one per release
  — read the header row at fetch time to get the current release labels
  (`emr-X.Y.Z`) for that series; don't assume which patch releases exist.
  Parse it as a normal markdown pipe-table.
- Support-policy dates come from
  `.../emr-standard-support.html`, "Releases and supported periods" table.
  As of this writing that table is a single aggregated row covering every
  release up to the 2024-07-25 policy announcement, not one row per release —
  re-check this at fetch time too; AWS may switch to per-release granularity
  in a future policy update.
- Resulting JSON shape: top-level `standardSupportPolicy`,
  `applicationDescriptions` (hand-written one-sentence blurbs, **bilingual**:
  each entry is `{"en": "...", "zh": "..."}` — carry these forward when a
  release refresh doesn't touch the application list, and add both the `en`
  and `zh` text for any newly-introduced application; see
  `scripts/i18n-descriptions.js`, which can re-apply the shared Chinese
  translations for known apps via `node scripts/i18n-descriptions.js`), then
  one key per series discovered on the main page (currently
  `4.x`/`5.x`/`6.x`/`7.x` — add or drop keys to match whatever series the main
  page currently links to) each holding `releases` (array of release labels
  found in that series' table, newest first) and `applications` (map of app
  name → `{release: version}`, using `null` for "not shipped in this
  release").

### Azure HDInsight → `azure-hdinsight-application-version-info.json`

- Start at
  `https://learn.microsoft.com/en-us/azure/hdinsight/hdinsight-component-versioning`.
  The **"Supported HDInsight versions"** section has one table — HDInsight
  version, VM OS, Release date, Support type, Support expiration date,
  Retirement date, High availability — whose first column links to a
  per-major-version component page. Read this table fresh each time; the
  number of rows and which version is newest will change (as of this writing:
  5.1, 5.0, 4.0 — don't assume the next version follows this exact numbering,
  just read whatever the newest row says; expect the oldest row to eventually
  drop off or move to an archive page).
- Follow every **distinct** linked page the current table contains — more
  than one version row can point at the same detail page (as of this writing,
  5.1 and 5.0 both link to `hdinsight-5x-component-versioning` as two
  columns, while 4.0 has its own `hdinsight-40-component-versioning`; a
  future 6.x would likely follow the same "one page per major version, one
  column per minor version" pattern, but confirm rather than assume).
  `WebFetch` is blocked for this domain too — fetch with
  `curl -sL -A "Mozilla/5.0" <url>` and read the plain HTML.
- Each linked page has an **"Open-source components available with
  HDInsight ..."** table: first column is the component name, remaining
  columns are one per HDInsight version on that page — read the header row at
  fetch time for the current version columns.
- Unlike AWS EMR, HDInsight has no further per-release grouping — the
  versions in the main table are the finest granularity available, so the
  JSON is flat rather than nested by series.
- Resulting JSON shape: top-level `standardSupportPolicy`,
  `applicationDescriptions`, `releases` (flat array reflecting whatever rows
  the main table currently has, newest first), `releaseInfo` (map of release
  → `{vmOs, releaseDate, supportType, supportExpirationDate, retirementDate,
  highAvailability}`), and `applications` (map of app name →
  `{release: version}`, `null` where a component isn't listed for that
  version).

### GCP Dataproc (Managed Service for Apache Spark) → `gcp-dataproc-application-version-info.json`

- Start at
  `https://docs.cloud.google.com/managed-spark/docs/concepts/versioning/image-version-lists`.
  The **"Supported Managed Service for Apache Spark image versions"** section
  has three tables — one each for Debian, Ubuntu, and Rocky Linux images —
  with columns Version, Last updated, Released on, Supported until, Available
  until, Notes. Read these tables fresh each time: the set of release lines
  changes as old ones retire and new ones ship (as of this writing: 3.0
  Preview, 2.3, 2.2, 2.1 — expect 3.0 to become GA and a new preview line to
  appear above it, and 2.1 to eventually drop off). `WebFetch` is blocked for
  this domain too — fetch with `curl -sL -A "Mozilla/5.0" <url>`; unlike the
  other two providers the data is present in the static HTML (no need for a
  `.md` export).
- The Version column links to a per-release detail page shared across all
  three OS variants for the same release line — follow every **distinct**
  link the current tables contain (as of this writing: `image-release-3.0`,
  `-2.3`, `-2.2`, `-2.1`).
- Each detail page's **first** `<table>` in the article body is the component
  table: first column is the component name, remaining columns are the most
  recent sub-minor patches of that release line (newest first, count varies),
  each shared across all its OS variants. Use the **first data column** (the
  newest patch) as the representative version for that release line —
  sub-minor patches within a line are almost always identical, but always
  re-read the header row rather than assuming which patch is newest.
  Parsing this reliably needs a real HTML parser (Python's
  `bs4`/`BeautifulSoup`), not regex — the page has a large nav sidebar before
  the article body and several smaller tables (GPU libraries, XGBoost,
  Python/R libraries) after the main component table, so grab
  `soup.find('div', class_='devsite-article-body').find('table')`
  specifically, not just any `<table>` on the page.
- Dates on this site are `YYYY/MM/DD`; converted to the same `Month D, YYYY`
  prose style as the other two providers' JSON for consistency. `TBD` is kept
  verbatim (used for whichever release is currently in preview with no
  support/expiry dates yet).
- Resulting JSON shape: top-level `standardSupportPolicy` (GCP has no
  Standard/Basic support tiers like Azure — it only publishes per-release
  `supportedUntil`/`availableUntil` dates, noted here instead),
  `applicationDescriptions`, `releases` (flat array reflecting whatever
  release lines the main tables currently list, newest first), `releaseInfo`
  (map of release → `{osImages, lastUpdated, releasedOn, supportedUntil,
  availableUntil, releaseStage, additionalNotes}`), and `applications` (map
  of app name → `{release: version}`, `null` where a component isn't listed
  for that release).

### Alibaba Cloud EMR on ECS → `aliyun-emr-application-version-info.json`

This provider's data comes from **two separate pages** — component versions
and lifecycle dates aren't on the same page like the other three providers,
so you fetch and merge both.

- Component versions: start at
  `https://help.aliyun.com/zh/emr/emr-on-ecs/product-overview/emr-on-ecs-release-version/`.
  The page is a client-rendered app — the HTML you get from `curl` doesn't
  contain the content directly; it's JSON-encoded inside
  `window.__ICE_PAGE_PROPS__ = {...}` in an inline `<script>` tag. Parse that
  JSON (brace-match from the `=` sign, since it can't be regex-extracted
  reliably) and read `.docDetailData.storeData.data.content`, which is an
  HTML string — parse *that* with a real HTML parser (`bs4`) to get the
  actual page markup. `WebFetch` is blocked for this domain too.
- Inside that content, the **"各版本支持的组件"** ("Components supported by
  each version") section has one `<h3>` per release series (as of this
  writing: `EMR-5.x`, based on Hadoop 3.x/Hive 3.x, and `EMR-3.x`, based on
  Hadoop 2.x/Hive 2.x) and, under each, several collapsed/expandable blocks
  (e.g. "EMR-5.19.x and later", "EMR-5.18.x and earlier") each containing one
  table. Read **every** expandable block under a series, not just the first
  — a series' full release list and component set is scattered across all of
  them. Each table's first column is the component name; the header row
  gives the release labels for that block (e.g. `EMR-5.20.x`, `EMR-5.19.x`).
  A cell can contain a compound note instead of a bare version (e.g. a
  component that changed mid-way through a single labeled release) — keep
  that text verbatim rather than trying to force it into a single version
  string.
- Release granularity here is coarser than AWS EMR: one label like
  `EMR-5.20.x` covers **all patch releases** within that minor version — there
  is no finer per-patch table to dig into.
- Lifecycle dates: start at
  `https://help.aliyun.com/zh/emr/emr-on-ecs/product-overview/lifecycle-policies-for-emr-on-ecs`
  (same client-rendered JSON-in-`<script>` extraction as above). The
  **"存量发行版本与生命周期时间点的对应关系"** ("Mapping between existing
  release versions and lifecycle time points") section has one table: 发行版本
  (release) | GA | EOM | EOS. Rows are either a specific minor version (e.g.
  `5.18.x`, note: **no** `EMR-` prefix here, unlike the component-version
  page — match by stripping the prefix) or a grouped/retired range (e.g.
  `3.0.x~3.35.x 系列`, `1.x.x 系列`) for series old enough to have dropped off
  the component-version page entirely.
- **This page updates on a slower cadence than the component-version page** —
  expect the newest 1-2 releases in each series to have component versions
  published already but no lifecycle row yet. Don't treat a missing lifecycle
  row as an error; it means "not announced yet," not "fetch failed."
- GA/EOM/EOS meanings (from the page's own milestone table): **GA** = General
  Availability, the release ships with support and an SLA. **EOM** = End of
  Market (nominally GA + 3 years) — no new clusters on this release, existing
  clusters keep support. **EOS** = End of Service & Support (at least EOM + 1
  year) — all support and SLA guarantees stop.
- Resulting JSON shape: top-level `standardSupportPolicy` (with a
  `milestones` sub-object defining GA/EOM/EOS), `applicationDescriptions`,
  one key per series discovered on the component-version page (currently
  `EMR-5.x`/`EMR-3.x`) each holding `releases` + `applications` in the same
  shape as AWS EMR's series objects, `releaseLifecycle` (map of the
  `EMR-`-prefixed release label → `{ga, eom, eos}`, `null` fields where the
  lifecycle page hasn't caught up yet), and `retiredSeriesLifecycle` (array
  of the grouped/retired rows from the lifecycle table that no longer have a
  matching entry in the series objects, kept so that history isn't silently
  dropped).

## Steps to rebuild and promote

**Prerequisite (re-stated from the guard at the top):** at least one
`*-application-version-info.json` file must have been modified before you run
anything in this section. If all four JSON files are unchanged from the last
committed state, stop here — there is nothing to publish, and running the
steps below would only regenerate an identical `index.html` while needlessly
rotating `index-old.html`.

Almost always, only one provider's JSON actually changed — you don't need to
re-fetch or touch the others. Steps 1 and 2 below still run every provider's
build/verify by default because that's cheap and safe (rebuilding a provider
whose JSON didn't change just regenerates byte-identical output), but if you
want to be explicit about updating a single cloud, scope them to just that
provider:

```
node scripts/build-data.js <dataKey>          # dataKey: aws | azure | gcp | aliyun
node scripts/verify-<provider>-queries.js     # e.g. scripts/verify-gcp-dataproc-queries.js
```

`build-data.js` without an argument still builds all four (the original,
default behavior); passing a `dataKey` builds only that one provider's
`data/<provider>-data.js` and leaves the other three untouched. Step 3 (the
assemble-and-promote step) always bundles all four regardless of which one
you touched — that's intentional, see **Why this exists** above.

**Keeping translations from going stale on incremental updates.** The usual
refresh introduces new components or policy text that has no Chinese
translation yet. Two safety nets keep that from slipping through silently:

- `scripts/build-data.js` prints a **non-blocking** `[i18n 提醒]` warning
  whenever it builds a provider whose JSON still has untranslated
  descriptive text (a bare-string entry, or an `{"en","zh"}` entry whose `zh`
  is empty) in `applicationDescriptions`, `standardSupportPolicy.note`, or
  `standardSupportPolicy.milestones`. The build still succeeds and the page
  falls back to English for those entries — the warning is your cue to add
  the translation, not a hard failure.
- `node scripts/i18n-descriptions.js --check` lists exactly which entries
  are missing a translation without writing anything. Running
  `node scripts/i18n-descriptions.js` (after adding the `zh` to the
  translation table in that file) upgrades bare strings to `{"en","zh"}` and
  is **idempotent** — already-bilingual entries are left untouched, so it is
  always safe to re-run.

When you add a brand-new component during a refresh, write its
`applicationDescriptions` entry directly as `{"en":"...","zh":"..."}` if you
have the translation; if not, a plain string is fine as a stopgap and the
warning above will remind you to come back for it.

1. **Rebuild the data files from the JSON sources:**

   ```
   node scripts/build-data.js
   ```

   This regenerates `data/aws-emr-data.js`, `data/azure-hdinsight-data.js`,
   `data/gcp-dataproc-data.js`, and `data/aliyun-emr-data.js` from their
   respective JSON files, and validates that each JSON file is well-formed
   (it calls `JSON.parse` internally). If it errors, fix the JSON file it
   names before continuing — don't try to patch around it in a later step.
   Pass a single `dataKey` (`aws`/`azure`/`gcp`/`aliyun`) as an argument to
   rebuild just that one provider instead of all four.

2. **Sanity-check the query logic still holds, for every provider:**

   ```
   node scripts/verify-aws-emr-queries.js
   node scripts/verify-azure-hdinsight-queries.js
   node scripts/verify-gcp-dataproc-queries.js
   node scripts/verify-aliyun-emr-queries.js
   ```

   These exercise the pure functions in `aws-emr-queries.js`,
   `azure-hdinsight-queries.js`, `gcp-dataproc-queries.js`, and
   `aliyun-emr-queries.js` against known inputs/outputs. If any fails,
   something changed in that file in a way that breaks tested behavior —
   investigate before continuing rather than promoting a broken build. If
   you only touched one provider, it's fine to run only that provider's
   verify script instead of all four.

3. **Assemble and promote — this is the step that actually replaces the live
   page:**

   ```
   node .claude/skills/build-emr-console/scripts/build-index-new.js
   ```

   This reads the current `style.css`, `dom-utils.js`, `i18n.js`, `app.js`,
   `theme.js`, each provider's `*-queries.js` + `*-view.js`, and each
   provider's freshly-built `data/*-data.js`, inlines all of them into one
   file (`index-new.html`), and then **immediately**:

   - renames the current `index.html` to `index-old.html` (overwriting
     whatever backup was there from the previous run — this skill only ever
     keeps one generation of history on disk; anything older lives in git),
     then
   - renames `index-new.html` to `index.html`.

   There's no confirmation prompt built into the script — running it *is*
   the decision to publish. `index-new.html` never lingers on disk after a
   successful run (it always ends up renamed to `index.html`); if you see it
   sitting on disk, the script died mid-run before the rename.

4. **Spot-check the result, and know how to undo it.** Open the new
   `index.html` in a browser — check the provider tab(s) you actually
   changed data for, but also glance at the others since the rebuild
   touches all of them. If something is wrong, restore the previous version
   with a single move:

   ```
   node -e "const fs=require('fs'); fs.renameSync('index-old.html','index.html')"
   ```

   (or just delete `index.html` and rename `index-old.html` back by hand).
   Then go fix whichever source file was actually wrong (the JSON, or one of
   the shared/provider `.js`/`.css` files) and rerun from step 1 — don't
   patch the generated `index.html` directly, since the next run overwrites
   it anyway. Once you're confident the promoted version is correct, delete
   `index-old.html`; there's no need to keep it around once git history
   covers the same rollback.

## When NOT to use this

- **Adding a feature, a new provider tab, or changing behavior/layout** is a
  real code change to the source files, not a data refresh. Follow this
  project's normal editing conventions for that (see `docs/superpowers/` for
  the design/plan process this console was originally built with), and
  remember that any change needs to land in the *source* files (`style.css`,
  `app.js`, `dom-utils.js`, `i18n.js`, each provider's
  `*-queries.js`/`*-view.js`, and the HTML template inside
  `build-index-new.js`) — never in `index.html` directly, since this skill
  overwrites it on every run.
- **No JSON data source changed.** If none of
  `aws-emr-application-version-info.json`,
  `azure-hdinsight-application-version-info.json`,
  `gcp-dataproc-application-version-info.json`, or
  `aliyun-emr-application-version-info.json` was edited, there's nothing new
  to publish and this skill has no effect worth running.

## If something looks wrong after promotion

`index.html` is generated purely by inlining existing files — it doesn't
contain any logic of its own. If it looks broken after a run, the bug is in
one of the source files (most likely the relevant provider's JSON file if
data looks wrong, or one of the shared/provider `.js`/`.css` files if
rendering/behavior looks wrong), not in the assembly step. Roll back via
`index-old.html` (see step 4 above) while you fix the source file, then
rerun from step 1.
