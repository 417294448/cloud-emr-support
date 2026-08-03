const fs = require('fs');
const path = require('path');

/**
 * 从 data/*.js 文件内容中提取 provider 数据对象。
 * data 文件格式：window.CLOUD_DATA.<key> = { ... };
 */
function extractData(content) {
  const match = content.match(/window\.CLOUD_DATA\.\w+\s*=\s*(\{[\s\S]*\});?\s*$/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    return null;
  }
}

function isSeriesObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && value.releases;
}

/** 将嵌套 series 的 releases 合并为扁平数组（AWS/Aliyun）。 */
function getReleases(data) {
  if (data.releases && Array.isArray(data.releases)) {
    return data.releases;
  }
  const releases = [];
  Object.keys(data).forEach(function (key) {
    const value = data[key];
    if (isSeriesObject(value) && Array.isArray(value.releases)) {
      releases.push(...value.releases);
    }
  });
  return releases;
}

/** 将嵌套 series 的 applications 合并为 { appName: { release: version } }。 */
function getApplications(data) {
  if (data.applications && typeof data.applications === 'object') {
    return data.applications;
  }
  const apps = {};
  Object.keys(data).forEach(function (key) {
    const value = data[key];
    if (isSeriesObject(value) && value.applications) {
      Object.keys(value.applications).forEach(function (app) {
        if (!apps[app]) apps[app] = {};
        Object.assign(apps[app], value.applications[app]);
      });
    }
  });
  return apps;
}

function diffData(oldData, newData) {
  const changes = [];

  if (!oldData) {
    return [{ type: 'initial', message: '首次生成数据文件，无历史对比。' }];
  }

  // dataAsOf
  if (oldData.dataAsOf !== newData.dataAsOf) {
    changes.push({ type: 'dataAsOf', old: oldData.dataAsOf, new: newData.dataAsOf });
  }

  // standardSupportPolicy
  if (JSON.stringify(oldData.standardSupportPolicy) !== JSON.stringify(newData.standardSupportPolicy)) {
    changes.push({ type: 'policy', message: 'Support policy 有变更' });
  }

  // releases
  const oldReleases = getReleases(oldData);
  const newReleases = getReleases(newData);
  const addedReleases = newReleases.filter(function (r) { return !oldReleases.includes(r); });
  const removedReleases = oldReleases.filter(function (r) { return !newReleases.includes(r); });
  if (addedReleases.length) {
    changes.push({ type: 'releasesAdded', releases: addedReleases });
  }
  if (removedReleases.length) {
    changes.push({ type: 'releasesRemoved', releases: removedReleases });
  }

  // applicationDescriptions
  const oldDesc = oldData.applicationDescriptions || {};
  const newDesc = newData.applicationDescriptions || {};
  const addedApps = Object.keys(newDesc).filter(function (k) { return !oldDesc[k]; });
  const removedApps = Object.keys(oldDesc).filter(function (k) { return !newDesc[k]; });
  if (addedApps.length) {
    changes.push({ type: 'appsAdded', apps: addedApps });
  }
  if (removedApps.length) {
    changes.push({ type: 'appsRemoved', apps: removedApps });
  }

  // application versions
  const oldApps = getApplications(oldData);
  const newApps = getApplications(newData);
  const appNames = new Set([...Object.keys(oldApps), ...Object.keys(newApps)]);
  appNames.forEach(function (app) {
    const oldVersions = oldApps[app] || {};
    const newVersions = newApps[app] || {};
    const versionChanges = [];
    const allReleases = new Set([...Object.keys(oldVersions), ...Object.keys(newVersions)]);
    allReleases.forEach(function (rel) {
      if (oldVersions[rel] !== newVersions[rel]) {
        versionChanges.push({ release: rel, old: oldVersions[rel], new: newVersions[rel] });
      }
    });
    if (versionChanges.length) {
      changes.push({ type: 'versionChanges', app: app, changes: versionChanges });
    }
  });

  return changes;
}

function formatValue(v) {
  return v === undefined ? 'undefined' : JSON.stringify(v);
}

function renderChanges(changes, indent) {
  const prefix = ' '.repeat(indent);
  const lines = [];

  if (changes.length === 0 || (changes.length === 1 && changes[0].type === 'initial')) {
    lines.push(prefix + '本次无结构化变更。');
    return lines;
  }

  changes.forEach(function (c) {
    switch (c.type) {
      case 'initial':
        lines.push(prefix + '- ' + c.message);
        break;
      case 'dataAsOf':
        lines.push(prefix + '- dataAsOf: `' + formatValue(c.old) + '` → `' + formatValue(c.new) + '`');
        break;
      case 'policy':
        lines.push(prefix + '- ' + c.message);
        break;
      case 'releasesAdded':
        lines.push(prefix + '- 新增 release: ' + c.releases.join(', '));
        break;
      case 'releasesRemoved':
        lines.push(prefix + '- 移除 release: ' + c.releases.join(', '));
        break;
      case 'appsAdded':
        lines.push(prefix + '- 新增组件: ' + c.apps.join(', '));
        break;
      case 'appsRemoved':
        lines.push(prefix + '- 移除组件: ' + c.apps.join(', '));
        break;
      case 'versionChanges':
        lines.push(prefix + '- `' + c.app + '` 版本变更:');
        c.changes.forEach(function (vc) {
          lines.push(prefix + '  - `' + vc.release + '`: ' + formatValue(vc.old) + ' → ' + formatValue(vc.new));
        });
        break;
      default:
        lines.push(prefix + '- ' + JSON.stringify(c));
    }
  });

  return lines;
}

function formatMarkdown(provider, changes) {
  const lines = [];
  lines.push('# ' + provider + ' 数据变更摘要');
  lines.push('');
  lines.push('生成时间: ' + new Date().toISOString());
  lines.push('');
  lines.push(...renderChanges(changes, 0));
  return lines.join('\n');
}

/**
 * 生成一次刷新操作的统一汇总 diff 文本。
 * @param {string} dateStr  日期字符串，如 "2026-08-03"
 * @param {string} generatedAt  生成时间字符串，如 "2026-08-03 18:51:00 +08:00"
 * @param {Array<{name: string, changes: Array}>} items  各 provider 的变更列表
 */
function formatSummary(dateStr, generatedAt, items) {
  const lines = [];
  lines.push('# Cloud EMR Console Refresh Diff — ' + dateStr);
  lines.push('');
  lines.push('生成时间: ' + generatedAt);
  lines.push('');

  items.forEach(function (item) {
    lines.push('## ' + item.name);
    lines.push('');
    lines.push(...renderChanges(item.changes, 0));
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * 生成单个 provider 的 diff 文本。
 * @param {string} providerName  provider 显示名称
 * @param {string|null} oldContent  旧 data 文件内容（可为 null）
 * @param {string} newContent  新 data 文件内容
 */
function generateDiff(providerName, oldContent, newContent) {
  const oldData = oldContent ? extractData(oldContent) : null;
  const newData = extractData(newContent);
  const changes = diffData(oldData, newData);
  return formatMarkdown(providerName, changes);
}

module.exports = { generateDiff, extractData, diffData, formatMarkdown, formatSummary };

// 命令行用法：node scripts/generate-diff.js <provider-name> <old-file> <new-file>
if (require.main === module) {
  const providerName = process.argv[2];
  const oldFile = process.argv[3];
  const newFile = process.argv[4];
  if (!providerName || !newFile) {
    console.error('Usage: node scripts/generate-diff.js <provider-name> <old-file> <new-file>');
    process.exit(1);
  }
  const oldContent = oldFile && fs.existsSync(oldFile) ? fs.readFileSync(oldFile, 'utf-8') : null;
  const newContent = fs.readFileSync(newFile, 'utf-8');
  console.log(generateDiff(providerName, oldContent, newContent));
}
