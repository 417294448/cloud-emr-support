const fs = require('fs');
const path = require('path');

const skillPath = path.join(__dirname, '..', 'SKILL.md');
const rulePath = path.join(__dirname, '..', '..', '..', '..', '.trae', 'rules', 'build-emr-console.md');

const skill = fs.readFileSync(skillPath, 'utf8');

// Strip the YAML frontmatter (name/description) from the skill file.
const body = skill.replace(/^---\n[\s\S]*?\n---\n\n?/, '');

const ruleHeader = `# Build and promote the Cloud Console

> This is the Trae project-rule mirror of the Claude Code skill at
> \`.claude/skills/build-emr-console/SKILL.md\`. The pipeline steps are identical
> and invoke the exact same scripts — including the assemble/promote step at
> \`.claude/skills/build-emr-console/scripts/build-index-new.js\` — so both Claude
> Code and Trae operate on a single shared copy of the build pipeline. Keep both
> files in sync when the pipeline changes.
>
> To regenerate this rule from the skill, run:
> \`node .claude/skills/build-emr-console/scripts/sync-rule.js\`

`;

fs.writeFileSync(rulePath, ruleHeader + body);
console.log(`Synced ${path.relative(process.cwd(), rulePath)} from ${path.relative(process.cwd(), skillPath)}`);
