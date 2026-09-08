const assert = require('assert');
const path = require('path');
const fs = require('fs');
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

// ---- 真实 JSON 的防御性不变量（防止历史回归：组件名清洗 / 命名归一化 / osImages 类型）----
const realData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'gcp-dataproc-application-version-info.json'), 'utf-8')
);

// osImages 必须是字符串，视图层直接渲染、绝不调用 .join()（字符串 .join 会抛 TypeError）。
Object.keys(realData.releaseInfo).forEach(function (r) {
  assert.strictEqual(
    typeof realData.releaseInfo[r].osImages,
    'string',
    `releaseInfo[${r}].osImages should be a string, not ${typeof realData.releaseInfo[r].osImages}`
  );
});

// 组件名不得残留未清洗的提示后缀（installed / optional component / initialization action）。
Object.keys(realData.applications).forEach(function (app) {
  assert.ok(
    !/installed|optional\s*component|initialization\s*action/i.test(app),
    `application key "${app}" still carries an un-stripped hint suffix`
  );
});

// 命名归一化：Ranger/Solr/Zeppelin Notebook/Zookeeper 只允许无 Apache 前缀的单一行。
['Apache Ranger', 'Apache Solr', 'Apache Zeppelin Notebook', 'Apache Zookeeper'].forEach(function (dup) {
  assert.strictEqual(realData.applications[dup], undefined, `"${dup}" should be normalized into its non-prefixed key`);
});

console.log('All gcp-dataproc-queries assertions passed (incl. real-JSON invariants).');
