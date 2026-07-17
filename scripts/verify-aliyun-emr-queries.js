const assert = require('assert');
const path = require('path');
const q = require(path.join(__dirname, '..', 'aliyun-emr-queries.js'));

const sampleData = {
  standardSupportPolicy: { note: 'ignored in series listing' },
  applicationDescriptions: { Spark3: 'ignored in series listing' },
  'EMR-5.x': {
    releases: ['EMR-5.20.x', 'EMR-5.19.x'],
    applications: {
      Spark3: { 'EMR-5.20.x': '3.5.3', 'EMR-5.19.x': '3.5.3' },
      HBase: { 'EMR-5.20.x': null, 'EMR-5.19.x': '2.4.17' },
    },
  },
  'EMR-3.x': {
    releases: ['EMR-3.54.x'],
    applications: {
      Spark2: { 'EMR-3.54.x': '2.4.8' },
    },
  },
  releaseLifecycle: {
    'EMR-5.20.x': { ga: null, eom: null, eos: null },
    'EMR-5.19.x': { ga: '2024-12-04', eom: 'TBD', eos: 'TBD' },
  },
  retiredSeriesLifecycle: [{ series: '1.x.x', ga: '2015~2017', eom: '2024-09-30', eos: '2025-10-20' }],
  notes: { ignored: 'in series listing' },
};

// getSeriesKeys: 排除元数据键，只保留 EMR-X.x 形式的系列，按版本号降序
assert.deepStrictEqual(q.getSeriesKeys(sampleData), ['EMR-5.x', 'EMR-3.x'], 'getSeriesKeys failed');

// getAppNames: 按字母排序
assert.deepStrictEqual(q.getAppNames(sampleData['EMR-5.x']), ['HBase', 'Spark3'], 'getAppNames failed');

// getReleaseRow: 某个release下所有应用的版本
assert.deepStrictEqual(
  q.getReleaseRow(sampleData['EMR-5.x'], 'EMR-5.20.x'),
  [['HBase', null], ['Spark3', '3.5.3']],
  'getReleaseRow failed'
);

// getAppHistory: 某个应用在该系列所有release下的版本，按release顺序
assert.deepStrictEqual(
  q.getAppHistory(sampleData['EMR-5.x'], 'Spark3'),
  [['EMR-5.20.x', '3.5.3'], ['EMR-5.19.x', '3.5.3']],
  'getAppHistory failed'
);

// getDistinctVersions: 去重、忽略null
assert.deepStrictEqual(
  q.getDistinctVersions(sampleData['EMR-5.x'], 'HBase'),
  ['2.4.17'],
  'getDistinctVersions failed'
);

// findReleasesByVersion: 精确匹配版本号所在release
assert.deepStrictEqual(
  q.findReleasesByVersion(sampleData['EMR-5.x'], 'Spark3', '3.5.3'),
  ['EMR-5.20.x', 'EMR-5.19.x'],
  'findReleasesByVersion failed'
);

// findReleasesByVersion: 无匹配返回空数组
assert.deepStrictEqual(
  q.findReleasesByVersion(sampleData['EMR-5.x'], 'HBase', '9.9.9-not-exist'),
  [],
  'findReleasesByVersion (no match) failed'
);

// compareReleases: 跨系列对比，应用列表取并集，缺失应用补null
const compared = q.compareReleases(sampleData, [
  { series: 'EMR-5.x', release: 'EMR-5.20.x' },
  { series: 'EMR-3.x', release: 'EMR-3.54.x' },
]);
assert.deepStrictEqual(compared.headers, ['Application', 'EMR-5.20.x', 'EMR-3.54.x'], 'compareReleases headers failed');
assert.deepStrictEqual(
  compared.rows,
  [
    ['HBase', null, null],
    ['Spark2', null, '2.4.8'],
    ['Spark3', '3.5.3', null],
  ],
  'compareReleases rows failed'
);

// getReleaseLifecycle: 返回该release的GA/EOM/EOS
assert.deepStrictEqual(
  q.getReleaseLifecycle(sampleData, 'EMR-5.19.x'),
  { ga: '2024-12-04', eom: 'TBD', eos: 'TBD' },
  'getReleaseLifecycle failed'
);

// getReleaseLifecycle: 未匹配时返回null
assert.strictEqual(q.getReleaseLifecycle(sampleData, 'EMR-3.54.x'), null, 'getReleaseLifecycle (no match) failed');

console.log('All aliyun-emr-queries assertions passed.');
