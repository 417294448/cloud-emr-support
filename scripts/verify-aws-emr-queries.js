const assert = require('assert');
const path = require('path');
const q = require(path.join(__dirname, '..', 'aws-emr-queries.js'));

const sampleData = {
  standardSupportPolicy: {
    note: 'ignored in series listing',
    releases: {
      '5.36': { initialReleaseDate: 'June 15, 2022', standardSupportEndDate: 'Bridge support until August 31, 2026', extendedSupportEndDate: 'June 30, 2027', endOfSupportStartDate: 'June 30, 2027', endOfLifeStartDate: 'July 1, 2028' },
      '6.15': { initialReleaseDate: 'November 13, 2023', standardSupportEndDate: 'Bridge support until August 31, 2026', extendedSupportEndDate: 'June 30, 2027', endOfSupportStartDate: 'June 30, 2027', endOfLifeStartDate: 'July 1, 2028' },
      '7.0': { initialReleaseDate: 'December 19, 2023', standardSupportEndDate: 'Bridge support until August 31, 2026', extendedSupportEndDate: 'August 31, 2027', endOfSupportStartDate: 'August 31, 2027', endOfLifeStartDate: 'August 31, 2028' },
      'emr-spark-8.1 [LTS]': { initialReleaseDate: 'September 8, 2026', standardSupportEndDate: 'September 7, 2029', extendedSupportEndDate: 'N/A', endOfSupportStartDate: 'September 8, 2029', endOfLifeStartDate: 'September 8, 2029' },
    },
  },
  applicationDescriptions: { Spark: 'ignored in series listing' },
  '6.x': {
    releases: ['emr-6.15.0', 'emr-6.14.0'],
    applications: {
      Spark: { 'emr-6.15.0': '3.4.1-amzn-2', 'emr-6.14.0': '3.4.1-amzn-1' },
      Hive: { 'emr-6.15.0': null, 'emr-6.14.0': '3.1.3-amzn-8' },
    },
  },
  '7.x': {
    releases: ['emr-7.0.0'],
    applications: {
      Spark: { 'emr-7.0.0': '3.5.0-amzn-0' },
    },
  },
};

// getSeriesKeys: 排除 standardSupportPolicy 和 applicationDescriptions 等非系列元数据键，按版本号降序
assert.deepStrictEqual(q.getSeriesKeys(sampleData), ['7.x', '6.x'], 'getSeriesKeys failed');

// getAppNames: 按字母排序
assert.deepStrictEqual(q.getAppNames(sampleData['6.x']), ['Hive', 'Spark'], 'getAppNames failed');

// getReleaseRow: 某个release下所有应用的版本
assert.deepStrictEqual(
  q.getReleaseRow(sampleData['6.x'], 'emr-6.15.0'),
  [['Hive', null], ['Spark', '3.4.1-amzn-2']],
  'getReleaseRow failed'
);

// getAppHistory: 某个应用在该系列所有release下的版本，按release顺序
assert.deepStrictEqual(
  q.getAppHistory(sampleData['6.x'], 'Spark'),
  [['emr-6.15.0', '3.4.1-amzn-2'], ['emr-6.14.0', '3.4.1-amzn-1']],
  'getAppHistory failed'
);

// getDistinctVersions: 去重、忽略null
assert.deepStrictEqual(
  q.getDistinctVersions(sampleData['6.x'], 'Hive'),
  ['3.1.3-amzn-8'],
  'getDistinctVersions failed'
);

// findReleasesByVersion: 精确匹配版本号所在release
assert.deepStrictEqual(
  q.findReleasesByVersion(sampleData['6.x'], 'Spark', '3.4.1-amzn-1'),
  ['emr-6.14.0'],
  'findReleasesByVersion failed'
);

// findReleasesByVersion: 无匹配返回空数组
assert.deepStrictEqual(
  q.findReleasesByVersion(sampleData['6.x'], 'Spark', '9.9.9-not-exist'),
  [],
  'findReleasesByVersion (no match) failed'
);

// compareReleases: 跨系列对比，应用列表取并集，缺失应用补null
const compared = q.compareReleases(sampleData, [
  { series: '6.x', release: 'emr-6.15.0' },
  { series: '7.x', release: 'emr-7.0.0' },
]);
assert.deepStrictEqual(compared.headers, ['Application', 'emr-6.15.0', 'emr-7.0.0'], 'compareReleases headers failed');
assert.deepStrictEqual(
  compared.rows,
  [
    ['Hive', null, null],
    ['Spark', '3.4.1-amzn-2', '3.5.0-amzn-0'],
  ],
  'compareReleases rows failed'
);

// getSupportReleases: 返回政策表逐版本键，保持官方顺序
assert.deepStrictEqual(
  q.getSupportReleases(sampleData),
  ['5.36', '6.15', '7.0', 'emr-spark-8.1 [LTS]'],
  'getSupportReleases failed'
);

// getReleaseSupportInfo: emr-6.15.0 → 6.15，日期随版本不同
assert.deepStrictEqual(
  q.getReleaseSupportInfo(sampleData, 'emr-6.15.0').endOfLifeStartDate,
  'July 1, 2028',
  'getReleaseSupportInfo (emr-6.15.0) failed'
);
assert.deepStrictEqual(
  q.getReleaseSupportInfo(sampleData, 'emr-7.0.0').endOfLifeStartDate,
  'August 31, 2028',
  'getReleaseSupportInfo (emr-7.0.0) failed'
);

// getReleaseSupportInfo: emr-spark-8.1.0 → 去掉 [LTS] 后匹配 emr-spark-8.1
assert.deepStrictEqual(
  q.getReleaseSupportInfo(sampleData, 'emr-spark-8.1.0').standardSupportEndDate,
  'September 7, 2029',
  'getReleaseSupportInfo (emr-spark-8.1) failed'
);

// getReleaseSupportInfo: 无对应数据返回 null（主版本回退也可能命中，这里用一个不存在的主版本）
assert.strictEqual(
  q.getReleaseSupportInfo(sampleData, 'emr-9.9.0'),
  null,
  'getReleaseSupportInfo (no match) failed'
);

console.log('All aws-emr-queries assertions passed.');
