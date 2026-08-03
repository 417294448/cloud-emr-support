const fs = require('fs');
const path = require('path');
const { diffData, formatSummary, extractData } = require('./generate-diff');

const ROOT = path.join(__dirname, '..');

const PROVIDERS = [
  { source: 'aws-emr-application-version-info.json', output: 'data/aws-emr-data.js', dataKey: 'aws' },
  { source: 'azure-hdinsight-application-version-info.json', output: 'data/azure-hdinsight-data.js', dataKey: 'azure' },
  { source: 'gcp-dataproc-application-version-info.json', output: 'data/gcp-dataproc-data.js', dataKey: 'gcp' },
  { source: 'aliyun-emr-application-version-info.json', output: 'data/aliyun-emr-data.js', dataKey: 'aliyun' },
];

// 可选：node scripts/build-data.js <dataKey> 只构建指定的单个云厂商(如 aws/azure/gcp/aliyun)。
// 不传参数时按原逻辑构建全部厂商。
// 收集 data 里所有「未双语化」的描述性文本（applicationDescriptions、
// standardSupportPolicy.note / .milestones），返回人类可读的条目名列表。
function findUntranslated(data) {
  const problems = [];
  const needsZh = function (v) {
    return typeof v === 'string' || (v && typeof v === 'object' && !Array.isArray(v) && !v.zh);
  };
  const descriptions = data.applicationDescriptions || {};
  Object.keys(descriptions).forEach(function (app) {
    if (needsZh(descriptions[app])) problems.push('组件:' + app);
  });
  const policy = data.standardSupportPolicy || {};
  if (policy.note !== undefined && needsZh(policy.note)) problems.push('policy.note');
  if (policy.milestones && typeof policy.milestones === 'object') {
    Object.keys(policy.milestones).forEach(function (ms) {
      if (needsZh(policy.milestones[ms])) problems.push('milestone:' + ms);
    });
  }
  return problems;
}

function warnIfUntranslated(dataKey, data) {
  const problems = findUntranslated(data);
  if (problems.length === 0) return;
  console.warn(
    '  [i18n 提醒] ' + dataKey + ' 有 ' + problems.length + ' 条描述性文本缺中文译文（将回退英文显示）：' +
    problems.slice(0, 5).join(', ') + (problems.length > 5 ? ' …' : '')
  );
  console.warn('  可在 scripts/i18n-descriptions.js 的翻译表中补译后运行：node scripts/i18n-descriptions.js');
}

const filterKey = process.argv[2];
const targets = filterKey
  ? PROVIDERS.filter(function (p) { return p.dataKey === filterKey; })
  : PROVIDERS;

if (filterKey && targets.length === 0) {
  const known = PROVIDERS.map(function (p) { return p.dataKey; }).join(', ');
  throw new Error('Unknown provider "' + filterKey + '". Known providers: ' + known);
}

const diffItems = [];
const buildDate = new Date();

targets.forEach(function (provider) {
  const sourcePath = path.join(ROOT, provider.source);
  const outputPath = path.join(ROOT, provider.output);

  const raw = fs.readFileSync(sourcePath, 'utf-8');
  const data = JSON.parse(raw); // 提前校验 JSON 格式是否合法

  // 非阻断提醒：检查描述性文本是否仍为「未双语化」状态（字符串 或 zh 为空）。
  // 增量抓取常会引入尚无译文的新组件/政策文本，此处给出提示以便及时补译，
  // 但不中断构建 —— 前端会对缺失的 zh 回退到 en。
  warnIfUntranslated(provider.dataKey, data);

  // 在覆盖前读取旧 data 文件，用于生成本次变更摘要。
  let oldContent = null;
  try {
    oldContent = fs.readFileSync(outputPath, 'utf-8');
  } catch (e) {
    // 旧文件不存在，首次生成，oldContent 保持 null。
  }

  const banner =
    '// 本文件由 scripts/build-data.js 自动生成，请勿手动编辑。\n' +
    '// 数据源: ' + provider.source + '\n';
  const content =
    banner +
    'window.CLOUD_DATA = window.CLOUD_DATA || {};\n' +
    'window.CLOUD_DATA.' + provider.dataKey + ' = ' + JSON.stringify(data, null, 2) + ';\n';

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log('Wrote ' + outputPath + ' (' + content.length + ' bytes)');

  // 收集该 provider 的变更条目，用于最后生成统一汇总 diff。
  const oldData = oldContent ? extractData(oldContent) : null;
  const changes = diffData(oldData, data);
  diffItems.push({ name: provider.dataKey.toUpperCase(), changes: changes });
});

// 生成并保存本次刷新的统一汇总 diff（使用本地时间戳）。
function pad2(n) { return n.toString().padStart(2, '0'); }
function formatLocalOffset(d) {
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const hours = pad2(Math.abs(offset) / 60 | 0);
  const minutes = pad2(Math.abs(offset) % 60);
  return sign + hours + ':' + minutes;
}

const diffDir = path.join(ROOT, 'diffs');
fs.mkdirSync(diffDir, { recursive: true });
const dateStr = buildDate.getFullYear() + '-' + pad2(buildDate.getMonth() + 1) + '-' + pad2(buildDate.getDate());
const timestamp = dateStr + '-' + pad2(buildDate.getHours()) + '-' + pad2(buildDate.getMinutes()) + '-' + pad2(buildDate.getSeconds());
const generatedAt = dateStr + ' ' + pad2(buildDate.getHours()) + ':' + pad2(buildDate.getMinutes()) + ':' + pad2(buildDate.getSeconds()) + ' ' + formatLocalOffset(buildDate);
const summaryPath = path.join(diffDir, 'refresh-diff-' + timestamp + '.txt');
const summaryText = formatSummary(dateStr, generatedAt, diffItems);
fs.writeFileSync(summaryPath, summaryText, 'utf-8');
console.log('Wrote summary diff ' + summaryPath);
