---
name: build-emr-console
description: Regenerates the Cloud EMR Version Intelligence Console as a self-contained standalone preview file named index-new.html — bundling the latest aws-emr-application-version-info.json data together with the current style.css/app.js/dom-utils.js/aws-emr-queries.js/aws-emr-view.js/theme.js into one document for safe review. It NEVER overwrites the live index.html or any of its source files. Use this whenever the user edits aws-emr-application-version-info.json (new EMR release data, new application descriptions, updated support-policy dates) and wants to see the result, or asks to "rebuild", "regenerate", or "refresh" the EMR console / index page, or explicitly mentions index-new.html.
---

# Build EMR Console preview

## Why this exists

The console (`index.html`) is assembled from several files: the data source
`aws-emr-application-version-info.json`, a build step (`scripts/build-data.js`)
that turns it into `data/aws-emr-data.js`, and a handful of plain JS/CSS files
(`dom-utils.js`, `aws-emr-queries.js`, `aws-emr-view.js`, `app.js`, `theme.js`,
`style.css`) that `index.html` loads via `<script>`/`<link>` tags.

Most of the time, only the JSON data changes (a new EMR release, an updated
application description, a new support-policy date) — `index.html` itself
doesn't need to change, since it just references `data/aws-emr-data.js` by
path. But it's still useful to get a single, throwaway document that reflects
the *current* state of the whole console, so it can be reviewed in a browser
without wondering which of several files changed. That's what this skill
produces: `index-new.html`, a fully self-contained snapshot (data + CSS + JS
all inlined into one file). It is disposable by design — it never replaces
`index.html`, so the reviewed, working source files are never at risk of
being silently clobbered.

## Steps

1. **Rebuild the data file from the JSON source:**

   ```
   node scripts/build-data.js
   ```

   This also validates that `aws-emr-application-version-info.json` is
   well-formed JSON (it calls `JSON.parse` internally). If it errors, fix the
   JSON file before continuing — don't try to patch around it in a later step.

2. **Sanity-check the query logic still holds:**

   ```
   node scripts/verify-aws-emr-queries.js
   ```

   This exercises the pure functions in `aws-emr-queries.js` against known
   inputs/outputs. If it fails, something changed in that file in a way that
   breaks tested behavior — investigate before continuing rather than
   generating a preview from broken logic.

3. **Assemble the standalone preview document:**

   ```
   node .claude/skills/build-emr-console/scripts/build-index-new.js
   ```

   This reads the current `style.css`, `dom-utils.js`, `aws-emr-queries.js`,
   `aws-emr-view.js`, `app.js`, `theme.js`, and the freshly-built
   `data/aws-emr-data.js`, and inlines all of them into one file:
   `index-new.html` at the repo root. It always overwrites any previous
   `index-new.html` — that file is meant to be regenerated freely, never
   hand-edited.

4. **Hand off to the user for review.** Tell them to open `index-new.html` in
   a browser and compare it against the live `index.html`. Since the only
   thing that usually changed is data, in the common case there's nothing to
   "port back" — `index.html` already picks up the new `data/aws-emr-data.js`
   automatically. If they're happy, `index-new.html` has served its purpose
   and can be deleted. If something needs to change in the actual UI/logic,
   that's a real source edit to `index.html`/`style.css`/the `.js` files —
   this skill only previews, it doesn't author changes for you.

## When NOT to use this

- **Adding a feature or changing behavior/layout** is a real code change to
  the source files, not a data-refresh preview. Follow this project's normal
  editing conventions for that (see `docs/superpowers/` for the design/plan
  process this console was originally built with) — don't try to make
  feature changes by hand-editing `index-new.html`.
- **The JSON data source hasn't changed.** If nothing in
  `aws-emr-application-version-info.json` was edited, there's nothing new to
  preview and this skill has no effect worth running.

## If something looks wrong in the preview

`index-new.html` is generated purely by inlining existing files — it doesn't
contain any logic of its own. If the preview looks broken, the bug is in one
of the source files (most likely `aws-emr-application-version-info.json` if
data looks wrong, or one of the `.js`/`.css` files if rendering/behavior looks
wrong), not in the assembly step. Fix the source file and rerun from step 1.
