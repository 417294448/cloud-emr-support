const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const PROVIDERS = [
  { source: 'aws-emr-application-version-info.json', output: 'data/aws-emr-data.js', dataKey: 'aws' },
  { source: 'azure-hdinsight-application-version-info.json', output: 'data/azure-hdinsight-data.js', dataKey: 'azure' },
  { source: 'gcp-dataproc-application-version-info.json', output: 'data/gcp-dataproc-data.js', dataKey: 'gcp' },
  { source: 'aliyun-emr-application-version-info.json', output: 'data/aliyun-emr-data.js', dataKey: 'aliyun' },
];

PROVIDERS.forEach(function (provider) {
  const sourcePath = path.join(ROOT, provider.source);
  const outputPath = path.join(ROOT, provider.output);

  const raw = fs.readFileSync(sourcePath, 'utf-8');
  const data = JSON.parse(raw); // 提前校验 JSON 格式是否合法

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
});
