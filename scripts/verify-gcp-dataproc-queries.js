const assert = require('assert');
const path = require('path');
const q = require(path.join(__dirname, '..', 'gcp-dataproc-queries.js'));

const sampleData = {
  releases: ['2.3', '2.2', '2.1'],
  releaseInfo: {
    '2.3': { releasedOn: 'June 9, 2025', releaseStage: 'General availability' },
    '2.2': { releasedOn: 'December 8, 2023', releaseStage: 'General availability' },
    '2.1': { releasedOn: 'December 12, 2022', releaseStage: 'General availability' },
  },
  applications: {
    'Apache Spark': { '2.3': '3.5.3', '2.2': '3.5.3', '2.1': '3.3.2' },
    'Delta Lake': { '2.3': '3.2.1', '2.2': '3.2.1', '2.1': null },
  },
};

// getReleases: 保持原始顺序
assert.deepStrictEqual(q.getReleases(sampleData), ['2.3', '2.2', '2.1'], 'getReleases failed');

// getAppNames: 按字母排序
assert.deepStrictEqual(q.getAppNames(sampleData), ['Apache Spark', 'Delta Lake'], 'getAppNames failed');

// getReleaseRow: 某个release下所有应用的版本
assert.deepStrictEqual(
  q.getReleaseRow(sampleData, '2.1'),
  [['Apache Spark', '3.3.2'], ['Delta Lake', null]],
  'getReleaseRow failed'
);

// getReleaseInfo: 返回该release的元数据
assert.deepStrictEqual(
  q.getReleaseInfo(sampleData, '2.3'),
  { releasedOn: 'June 9, 2025', releaseStage: 'General availability' },
  'getReleaseInfo failed'
);

// getAppHistory: 某个应用在所有release下的版本，按release顺序
assert.deepStrictEqual(
  q.getAppHistory(sampleData, 'Apache Spark'),
  [['2.3', '3.5.3'], ['2.2', '3.5.3'], ['2.1', '3.3.2']],
  'getAppHistory failed'
);

// getDistinctVersions: 去重、忽略null
assert.deepStrictEqual(
  q.getDistinctVersions(sampleData, 'Apache Spark'),
  ['3.5.3', '3.3.2'],
  'getDistinctVersions failed'
);

// findReleasesByVersion: 精确匹配版本号所在release
assert.deepStrictEqual(
  q.findReleasesByVersion(sampleData, 'Apache Spark', '3.5.3'),
  ['2.3', '2.2'],
  'findReleasesByVersion failed'
);

// findReleasesByVersion: 无匹配返回空数组
assert.deepStrictEqual(
  q.findReleasesByVersion(sampleData, 'Delta Lake', '9.9.9-not-exist'),
  [],
  'findReleasesByVersion (no match) failed'
);

// compareReleases: 选中的release列对比
const compared = q.compareReleases(sampleData, ['2.3', '2.1']);
assert.deepStrictEqual(compared.headers, ['Application', '2.3', '2.1'], 'compareReleases headers failed');
assert.deepStrictEqual(
  compared.rows,
  [
    ['Apache Spark', '3.5.3', '3.3.2'],
    ['Delta Lake', '3.2.1', null],
  ],
  'compareReleases rows failed'
);

console.log('All gcp-dataproc-queries assertions passed.');
