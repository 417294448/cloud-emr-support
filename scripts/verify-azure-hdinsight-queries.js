const assert = require('assert');
const path = require('path');
const q = require(path.join(__dirname, '..', 'azure-hdinsight-queries.js'));

const sampleData = {
  releases: ['5.1', '5.0', '4.0'],
  releaseInfo: {
    '5.1': { vmOs: 'Ubuntu 18.0.4 LTS', releaseDate: 'November 1, 2023' },
    '5.0': { vmOs: 'Ubuntu 18.0.4 LTS', releaseDate: 'March 11, 2022' },
    '4.0': { vmOs: 'Ubuntu 18.0.4 LTS', releaseDate: 'September 24, 2018' },
  },
  applications: {
    'Apache Spark': { '5.1': '3.3.1', '5.0': '3.1.3', '4.0': '2.4.4' },
    'Apache Pig': { '5.1': null, '5.0': null, '4.0': '0.16.1' },
  },
};

// getReleases: 保持原始顺序
assert.deepStrictEqual(q.getReleases(sampleData), ['5.1', '5.0', '4.0'], 'getReleases failed');

// getAppNames: 按字母排序
assert.deepStrictEqual(q.getAppNames(sampleData), ['Apache Pig', 'Apache Spark'], 'getAppNames failed');

// getReleaseRow: 某个release下所有应用的版本
assert.deepStrictEqual(
  q.getReleaseRow(sampleData, '4.0'),
  [['Apache Pig', '0.16.1'], ['Apache Spark', '2.4.4']],
  'getReleaseRow failed'
);

// getReleaseInfo: 返回该release的元数据
assert.deepStrictEqual(
  q.getReleaseInfo(sampleData, '5.1'),
  { vmOs: 'Ubuntu 18.0.4 LTS', releaseDate: 'November 1, 2023' },
  'getReleaseInfo failed'
);

// getAppHistory: 某个应用在所有release下的版本，按release顺序
assert.deepStrictEqual(
  q.getAppHistory(sampleData, 'Apache Spark'),
  [['5.1', '3.3.1'], ['5.0', '3.1.3'], ['4.0', '2.4.4']],
  'getAppHistory failed'
);

// getDistinctVersions: 去重、忽略null
assert.deepStrictEqual(
  q.getDistinctVersions(sampleData, 'Apache Pig'),
  ['0.16.1'],
  'getDistinctVersions failed'
);

// findReleasesByVersion: 精确匹配版本号所在release
assert.deepStrictEqual(
  q.findReleasesByVersion(sampleData, 'Apache Spark', '3.1.3'),
  ['5.0'],
  'findReleasesByVersion failed'
);

// findReleasesByVersion: 无匹配返回空数组
assert.deepStrictEqual(
  q.findReleasesByVersion(sampleData, 'Apache Pig', '9.9.9-not-exist'),
  [],
  'findReleasesByVersion (no match) failed'
);

// compareReleases: 选中的release列对比，应用取全部并按字母排序
const compared = q.compareReleases(sampleData, ['5.1', '4.0']);
assert.deepStrictEqual(compared.headers, ['Application', '5.1', '4.0'], 'compareReleases headers failed');
assert.deepStrictEqual(
  compared.rows,
  [
    ['Apache Pig', null, '0.16.1'],
    ['Apache Spark', '3.3.1', '2.4.4'],
  ],
  'compareReleases rows failed'
);

console.log('All azure-hdinsight-queries assertions passed.');
