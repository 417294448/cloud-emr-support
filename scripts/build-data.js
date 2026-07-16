const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, '..', 'aws-emr-application-version-info.json');
const OUTPUT = path.join(__dirname, '..', 'data', 'aws-emr-data.js');

const raw = fs.readFileSync(SOURCE, 'utf-8');
const data = JSON.parse(raw); // 提前校验 JSON 格式是否合法

const banner =
  '// 本文件由 scripts/build-data.js 自动生成，请勿手动编辑。\n' +
  '// 数据源: aws-emr-application-version-info.json\n';
const content =
  banner +
  'window.CLOUD_DATA = window.CLOUD_DATA || {};\n' +
  'window.CLOUD_DATA.aws = ' + JSON.stringify(data, null, 2) + ';\n';

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, content, 'utf-8');
console.log('Wrote ' + OUTPUT + ' (' + content.length + ' bytes)');
