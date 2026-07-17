# Cloud EMR Version Intelligence Console

<video src="https://raw.githubusercontent.com/417294448/cloud-emr-support/main/cloud-emr-support.mp4" controls></video>

[▶ Watch the demo video](https://raw.githubusercontent.com/417294448/cloud-emr-support/main/cloud-emr-support.mp4) (if the player above doesn't render in your Markdown viewer)

This project is built around a **Claude Code Skill** (`.claude/skills/build-emr-console`) that can re-fetch, at any time, the latest component-version and lifecycle (support-policy) data straight from each cloud vendor's own official documentation, and turns it into a browsable static console (`index.html`).

Run the skill and it will:

1. Visit each vendor's live release/version docs pages
2. Parse out the current component versions, release dates, and support/EOM/EOS lifecycle info
3. Diff that against the existing data and update whichever provider's JSON changed
4. Rebuild and re-publish the console so the page always reflects what's live in the vendor docs — not a stale, hand-copied snapshot

Currently covers:

- **AWS EMR**
- **Azure HDInsight**
- **GCP Dataproc** (Managed Service for Apache Spark)
- **Alibaba Cloud EMR on ECS**

## Why a Skill, not just a static page

Vendor release docs change on their own schedule — new minor versions ship, old releases retire, support windows get extended. Hand-maintaining that across four different documentation sites (four different page layouts, three different fetch quirks) doesn't scale. The skill encodes, per provider, exactly which pages to read, which tables matter, and how to turn them into structured JSON — so refreshing the console is a single, repeatable, on-demand operation instead of manual re-transcription every time a vendor ships a release.

The generated console (`index.html`) is just the *artifact* of running the skill — a snapshot of "what the vendor docs said as of the last refresh." The skill itself is the actual capability this repo provides.

## Features

- Switch between provider tabs to see the exact component version (Hadoop, Hive, Spark, Flink, etc.) shipped in each release/series
- View each release's release date, support type, and maintenance end dates (EOM/EOS) and other lifecycle details
- Component names come with a short description for quick context

## Project Structure

```
.
├── .claude/skills/build-emr-console/  # The core Skill: how/where to re-fetch each vendor's live docs, and the build+publish pipeline
│
├── index.html                      # Generated console (self-contained single-page app) — do not edit by hand
├── index-old.html                  # Backup of the previous build (auto-maintained, keeps only one generation)
├── app.js                          # Tab switching and overall page init
├── dom-utils.js                    # Shared DOM construction helpers
├── theme.js                        # Light/dark theme toggle
├── style.css                       # Global styles
│
├── aws-emr-application-version-info.json        # AWS EMR data source (kept current by the skill)
├── aws-emr-queries.js                            # AWS EMR query/filter logic
├── aws-emr-view.js                               # AWS EMR rendering logic
│
├── azure-hdinsight-application-version-info.json # Azure HDInsight data source
├── azure-hdinsight-queries.js
├── azure-hdinsight-view.js
│
├── gcp-dataproc-application-version-info.json    # GCP Dataproc data source
├── gcp-dataproc-queries.js
├── gcp-dataproc-view.js
│
├── aliyun-emr-application-version-info.json      # Alibaba Cloud EMR on ECS data source
├── aliyun-emr-queries.js
├── aliyun-emr-view.js
│
├── data/                            # *-data.js compiled from the JSON sources (build output — do not edit by hand)
├── scripts/
│   ├── build-data.js                # Compiles each provider's JSON into data/*-data.js
│   ├── verify-aws-emr-queries.js    # Self-tests for each provider's query logic
│   ├── verify-azure-hdinsight-queries.js
│   ├── verify-gcp-dataproc-queries.js
│   └── verify-aliyun-emr-queries.js
│
└── docs/superpowers/                # Design/planning artifacts from the project's original build-out (plans, specs)
```

## Running the Skill

Ask Claude Code to refresh the console — e.g. "re-fetch the latest EMR/HDInsight/Dataproc/Aliyun EMR version info" or "rebuild the console" — and it invokes `build-emr-console`. The skill documents, per provider, exactly which docs pages/tables to read and how to turn them into JSON, so it can re-run this refresh indefinitely as vendors ship new releases without any of that knowledge living only in someone's head.

Under the hood, a refresh does:

1. Re-fetch the relevant provider's official docs and update its `*-application-version-info.json` if anything changed
2. `node scripts/build-data.js` — compile the JSON sources into `data/*-data.js`
3. `node scripts/verify-<provider>-queries.js` — sanity-check the query logic still holds
4. `node .claude/skills/build-emr-console/scripts/build-index-new.js` — inline everything into a fresh `index.html`, backing up the previous one as `index-old.html`

**Never edit `index.html` directly** — it's a build artifact and gets overwritten on the next refresh. If a refresh produces a bad result, roll back by renaming `index-old.html` back to `index.html`, then fix the underlying JSON/source file and re-run.

## Viewing Locally

The console itself is a pure static page with no build tooling or third-party dependencies — open `index.html` directly in a browser, or serve the repo root with any static file server.

## Data Sources

| Provider | Official Docs |
|---|---|
| AWS EMR | [Amazon EMR Release Guide](https://docs.amazonaws.cn/en_us/emr/latest/ReleaseGuide/emr-release-components.html) |
| Azure HDInsight | [HDInsight component versioning](https://learn.microsoft.com/en-us/azure/hdinsight/hdinsight-component-versioning) |
| GCP Dataproc | [Managed Service for Apache Spark image versions](https://docs.cloud.google.com/managed-spark/docs/concepts/versioning/image-version-lists) |
| Alibaba Cloud EMR on ECS | [EMR on ECS release versions](https://help.aliyun.com/zh/emr/emr-on-ecs/product-overview/emr-on-ecs-release-version/), [Lifecycle policies](https://help.aliyun.com/zh/emr/emr-on-ecs/product-overview/lifecycle-policies-for-emr-on-ecs) |
