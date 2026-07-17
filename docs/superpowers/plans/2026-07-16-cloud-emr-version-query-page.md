# 云托管大数据服务版本信息查询页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 `aws-emr-application-version-info.json`，构建一个零构建、双击即可打开的静态 HTML 页面，支持"按Release查询""按应用查询""按应用版本号反查""多Release对比（跨系列）"四种查询方式，并为未来接入 Azure HDInsight / GCP Dataproc 预留Tab入口。

**Architecture:** 纯静态多文件站点。`scripts/build-data.js` 把 JSON 数据源转换为 `data/aws-emr-data.js`（挂载到 `window.CLOUD_DATA.aws`），`index.html` 通过普通 `<script>` 标签依次加载数据文件、`dom-utils.js`（通用DOM工具）、`aws-emr-queries.js`（纯数据查询函数，无DOM依赖）、`aws-emr-view.js`（AWS EMR 的Tab与四种查询模式渲染）、`app.js`（顶层云厂商Tab切换与整体接线）。全程无 `fetch()`、无 ES module、无 npm 依赖，避免 `file://` 协议下的 CORS 限制。

**Tech Stack:** 原生 HTML5 + CSS3 + 无框架 JavaScript（ES5兼容语法即可）；数据生成脚本用 Node.js（仅用于开发时生成 `data/aws-emr-data.js`，运行时页面不依赖 Node）。纯逻辑函数（`aws-emr-queries.js`）额外提供 Node 兼容导出，配合一个不依赖任何测试框架、只用内置 `assert` 模块的校验脚本做真正的自动化验证；UI 渲染部分按设计文档采用手动浏览器验证。

---

## Task 1: 数据构建脚本与数据文件生成

**Files:**
- Create: `scripts/build-data.js`
- Create (generated): `data/aws-emr-data.js`

- [ ] **Step 1: 编写 build-data.js**

```javascript
// scripts/build-data.js
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
```

- [ ] **Step 2: 运行脚本生成数据文件**

Run: `node scripts/build-data.js`
Expected: 输出 `Wrote .../data/aws-emr-data.js (NNN bytes)`，且 `data/aws-emr-data.js` 文件被创建

- [ ] **Step 3: 校验生成文件的开头内容**

Run: `head -c 200 data/aws-emr-data.js`
Expected: 输出以 `// 本文件由 scripts/build-data.js 自动生成` 开头，紧接着能看到 `window.CLOUD_DATA.aws = {`

- [ ] **Step 4: Commit**

```bash
git add scripts/build-data.js data/aws-emr-data.js
git commit -m "feat: 添加数据构建脚本，生成AWS EMR页面数据文件"
```

---

## Task 2: 页面骨架与基础样式

**Files:**
- Create: `index.html`
- Create: `style.css`

- [ ] **Step 1: 编写 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>云托管大数据服务版本信息查询</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="app-header">
    <h1>云托管大数据服务版本信息查询</h1>
  </header>
  <nav id="provider-tab-bar" class="provider-tab-bar"></nav>
  <main id="provider-panel" class="provider-panel"></main>

  <script src="data/aws-emr-data.js"></script>
  <script src="dom-utils.js"></script>
  <script src="aws-emr-queries.js"></script>
  <script src="aws-emr-view.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: 编写 style.css**

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
  color: #1f2933;
  background: #f7f9fb;
}

.app-header {
  padding: 16px 24px;
  background: #1f3a5f;
  color: #fff;
}

.app-header h1 {
  margin: 0;
  font-size: 20px;
}

.provider-tab-bar,
.sub-tab-bar {
  display: flex;
  gap: 4px;
  padding: 12px 24px 0;
  background: #fff;
  border-bottom: 1px solid #d9e2ec;
}

.provider-tab-btn,
.sub-tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #486581;
  border-bottom: 2px solid transparent;
}

.provider-tab-btn:hover,
.sub-tab-btn:hover {
  color: #1f3a5f;
}

.provider-tab-btn.active,
.sub-tab-btn.active {
  color: #1f3a5f;
  border-bottom-color: #1f3a5f;
  font-weight: 600;
}

.provider-tab-btn.disabled {
  color: #bcccdc;
  cursor: not-allowed;
}

.provider-panel {
  padding: 24px;
}

.coming-soon {
  color: #829ab1;
  font-size: 14px;
}

.support-banner {
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 4px;
  padding: 10px 16px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #1f3a5f;
}

.sub-tab-panel {
  padding-top: 16px;
}

.query-panel .field {
  margin-bottom: 12px;
}

.query-panel label {
  font-size: 14px;
  color: #334e68;
}

.query-panel select {
  margin-left: 6px;
  padding: 4px 8px;
  font-size: 14px;
}

.data-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
  margin-top: 12px;
}

.data-table th,
.data-table td {
  border: 1px solid #d9e2ec;
  padding: 6px 10px;
  text-align: left;
}

.data-table thead th {
  background: #1f3a5f;
  color: #fff;
}

.data-table tbody tr:nth-child(even) {
  background: #f0f4f8;
}

.cell-empty {
  color: #bcccdc;
}

.toggle-btn {
  margin-top: 8px;
  padding: 6px 12px;
  border: 1px solid #1f3a5f;
  background: #fff;
  color: #1f3a5f;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.toggle-btn:hover {
  background: #1f3a5f;
  color: #fff;
}

.compare-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #d9e2ec;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.compare-item {
  font-size: 13px;
  color: #334e68;
}

.empty-msg,
.hint {
  color: #829ab1;
  font-size: 13px;
}
```

- [ ] **Step 3: 手动验证页面骨架**

用浏览器打开 `index.html`（双击文件，或用 `run` 技能启动）。
Expected: 页面标题栏"云托管大数据服务版本信息查询"正常显示，浏览器控制台无 `dom-utils.js`/`aws-emr-queries.js`/`aws-emr-view.js`/`app.js` 404 之外的报错（此时这几个文件还不存在，出现404是预期的，先确认 `index.html`/`style.css`/`data/aws-emr-data.js` 三者正常加载）。

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: 添加页面骨架与基础样式"
```

---

## Task 3: DOM工具函数

**Files:**
- Create: `dom-utils.js`

- [ ] **Step 1: 编写 dom-utils.js**

```javascript
// dom-utils.js
window.DomUtils = (function () {
  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (key) {
        const value = props[key];
        if (key === 'class') {
          node.className = value;
        } else if (key === 'onclick') {
          node.addEventListener('click', value);
        } else if (key === 'onchange') {
          node.addEventListener('change', value);
        } else {
          node.setAttribute(key, value);
        }
      });
    }
    (children || []).forEach(function (child) {
      if (child === null || child === undefined) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  function clear(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function formatCell(value) {
    if (value === null || value === undefined || value === '') {
      return el('span', { class: 'cell-empty' }, ['—']);
    }
    return String(value);
  }

  function renderTable(headers, rows) {
    const thead = el('thead', null, [
      el('tr', null, headers.map(function (h) { return el('th', null, [h]); })),
    ]);
    const tbody = el('tbody', null, rows.map(function (row) {
      return el('tr', null, row.map(function (cell) { return el('td', null, [formatCell(cell)]); }));
    }));
    return el('table', { class: 'data-table' }, [thead, tbody]);
  }

  return { el: el, clear: clear, renderTable: renderTable, formatCell: formatCell };
})();
```

- [ ] **Step 2: 手动验证加载无报错**

用浏览器打开 `index.html`。
Expected: 控制台不再出现 `dom-utils.js` 的 404，`aws-emr-queries.js`/`aws-emr-view.js`/`app.js` 仍是预期中的 404（尚未创建）。

- [ ] **Step 3: Commit**

```bash
git add dom-utils.js
git commit -m "feat: 添加通用DOM工具函数"
```

---

## Task 4: AWS EMR查询逻辑纯函数层（TDD）

**Files:**
- Create: `aws-emr-queries.js`
- Create: `scripts/verify-aws-emr-queries.js`

这一层是纯数据函数，不依赖浏览器DOM，因此可以用 Node 内置 `assert` 模块写一个真正会失败/通过的校验脚本，先写脚本、再实现、再验证通过。

- [ ] **Step 1: 编写校验脚本（此时会失败，因为 aws-emr-queries.js 还不存在）**

```javascript
// scripts/verify-aws-emr-queries.js
const assert = require('assert');
const path = require('path');
const q = require(path.join(__dirname, '..', 'aws-emr-queries.js'));

const sampleData = {
  standardSupportPolicy: { note: 'ignored in series listing' },
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

// getSeriesKeys: 排除 standardSupportPolicy，按版本号降序
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
assert.deepStrictEqual(compared.headers, ['应用', 'emr-6.15.0', 'emr-7.0.0'], 'compareReleases headers failed');
assert.deepStrictEqual(
  compared.rows,
  [
    ['Hive', null, null],
    ['Spark', '3.4.1-amzn-2', '3.5.0-amzn-0'],
  ],
  'compareReleases rows failed'
);

console.log('All aws-emr-queries assertions passed.');
```

- [ ] **Step 2: 运行校验脚本，确认它因模块不存在而失败**

Run: `node scripts/verify-aws-emr-queries.js`
Expected: 报错 `Cannot find module '.../aws-emr-queries.js'`

- [ ] **Step 3: 编写 aws-emr-queries.js 实现**

```javascript
// aws-emr-queries.js
(function (root) {
  function getSeriesKeys(data) {
    return Object.keys(data)
      .filter(function (k) { return k !== 'standardSupportPolicy'; })
      .sort(function (a, b) { return parseFloat(b) - parseFloat(a); });
  }

  function getAppNames(seriesData) {
    return Object.keys(seriesData.applications).sort();
  }

  function getReleaseRow(seriesData, release) {
    return getAppNames(seriesData).map(function (app) {
      return [app, seriesData.applications[app][release]];
    });
  }

  function getAppHistory(seriesData, app) {
    return seriesData.releases.map(function (release) {
      return [release, seriesData.applications[app][release]];
    });
  }

  function getDistinctVersions(seriesData, app) {
    const versions = [];
    seriesData.releases.forEach(function (release) {
      const v = seriesData.applications[app][release];
      if (v && versions.indexOf(v) === -1) versions.push(v);
    });
    return versions;
  }

  function findReleasesByVersion(seriesData, app, version) {
    return seriesData.releases.filter(function (release) {
      return seriesData.applications[app][release] === version;
    });
  }

  function compareReleases(data, selections) {
    const appNamesSet = {};
    selections.forEach(function (selection) {
      getAppNames(data[selection.series]).forEach(function (app) {
        appNamesSet[app] = true;
      });
    });
    const apps = Object.keys(appNamesSet).sort();
    const headers = ['应用'].concat(selections.map(function (s) { return s.release; }));
    const rows = apps.map(function (app) {
      const row = [app];
      selections.forEach(function (selection) {
        const seriesData = data[selection.series];
        row.push(seriesData.applications[app] ? seriesData.applications[app][selection.release] : null);
      });
      return row;
    });
    return { headers: headers, rows: rows };
  }

  const AwsEmrQueries = {
    getSeriesKeys: getSeriesKeys,
    getAppNames: getAppNames,
    getReleaseRow: getReleaseRow,
    getAppHistory: getAppHistory,
    getDistinctVersions: getDistinctVersions,
    findReleasesByVersion: findReleasesByVersion,
    compareReleases: compareReleases,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AwsEmrQueries;
  } else {
    root.AwsEmrQueries = AwsEmrQueries;
  }
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 4: 再次运行校验脚本，确认全部通过**

Run: `node scripts/verify-aws-emr-queries.js`
Expected: 输出 `All aws-emr-queries assertions passed.`，无报错

- [ ] **Step 5: Commit**

```bash
git add aws-emr-queries.js scripts/verify-aws-emr-queries.js
git commit -m "feat: 添加AWS EMR查询纯函数层及校验脚本"
```

---

## Task 5: AWS EMR视图框架 + 支持政策横幅 + 按Release查询模式

**Files:**
- Create: `aws-emr-view.js`

- [ ] **Step 1: 编写 aws-emr-view.js（框架 + 支持横幅 + 系列选择器 + 按Release查询模式）**

```javascript
// aws-emr-view.js
window.AwsEmrView = (function () {
  const el = window.DomUtils.el;
  const clear = window.DomUtils.clear;
  const renderTable = window.DomUtils.renderTable;
  const q = window.AwsEmrQueries;

  function renderSupportBanner(data) {
    const policy = data.standardSupportPolicy;
    if (!policy) return el('div');
    return el('div', { class: 'support-banner' }, [
      el('strong', null, ['支持政策：']),
      policy.initialReleaseDate + ' 发布的release —— ' + policy.standardSupportEndDate + '，',
      'EoS开始于 ' + policy.endOfSupportStartDate + '，EoL开始于 ' + policy.endOfLifeStartDate + '。',
      ' ',
      el('a', { href: policy.source, target: '_blank' }, ['查看官方文档来源']),
    ]);
  }

  function renderSeriesSelect(seriesKeys, onChange) {
    return el('select', { class: 'series-select', onchange: function (e) { onChange(e.target.value); } },
      seriesKeys.map(function (key) { return el('option', { value: key }, [key]); })
    );
  }

  // ---- Mode 1: 按Release查询 ----
  function renderByRelease(container, data) {
    clear(container);
    const seriesKeys = q.getSeriesKeys(data);
    const state = { series: seriesKeys[0] };

    const releaseSelectWrap = el('div', { class: 'field' });
    const resultWrap = el('div', { class: 'result' });

    function renderResult(release) {
      clear(resultWrap);
      const seriesData = data[state.series];
      resultWrap.appendChild(renderTable(['应用', '版本'], q.getReleaseRow(seriesData, release)));
    }

    function renderReleaseOptions() {
      clear(releaseSelectWrap);
      const seriesData = data[state.series];
      const releaseSelect = el('select', {
        class: 'release-select',
        onchange: function (e) { renderResult(e.target.value); },
      }, seriesData.releases.map(function (r) { return el('option', { value: r }, [r]); }));
      releaseSelectWrap.appendChild(el('label', null, ['Release: ', releaseSelect]));
      renderResult(seriesData.releases[0]);
    }

    const seriesSelect = renderSeriesSelect(seriesKeys, function (value) {
      state.series = value;
      renderReleaseOptions();
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'field' }, [el('label', null, ['系列: ', seriesSelect])]),
      releaseSelectWrap,
      resultWrap,
    ]));

    renderReleaseOptions();
  }

  const MODES = [
    { id: 'by-release', label: '按Release查询', render: renderByRelease },
  ];

  function mount(container, data) {
    clear(container);
    container.appendChild(renderSupportBanner(data));

    const tabBar = el('div', { class: 'sub-tab-bar' });
    const panel = el('div', { class: 'sub-tab-panel' });

    function selectMode(modeId) {
      Array.prototype.forEach.call(tabBar.children, function (btn) {
        btn.classList.toggle('active', btn.dataset.modeId === modeId);
      });
      const mode = MODES.filter(function (m) { return m.id === modeId; })[0];
      mode.render(panel, data);
    }

    MODES.forEach(function (mode) {
      const btn = el('button', {
        class: 'sub-tab-btn',
        onclick: function () { selectMode(mode.id); },
      }, [mode.label]);
      btn.dataset.modeId = mode.id;
      tabBar.appendChild(btn);
    });

    container.appendChild(tabBar);
    container.appendChild(panel);

    selectMode(MODES[0].id);
  }

  return { mount: mount };
})();
```

- [ ] **Step 2: 临时接线以便手动验证（在 index.html 末尾script前加一行内联调用）**

在 `index.html` 的 `</body>` 前，`app.js` 引入行的**上一行**临时加入：

```html
<script>
  document.addEventListener('DOMContentLoaded', function () {
    window.AwsEmrView.mount(document.getElementById('provider-panel'), window.CLOUD_DATA.aws);
  });
</script>
```

用浏览器打开 `index.html`。
Expected: 页面主体显示支持政策横幅文字，下方"按Release查询"Tab按钮高亮，系列下拉默认显示 `7.x`，Release下拉显示 `emr-7.13.0` 等选项，表格列出该release下所有应用及版本号。切换系列/Release下拉，表格内容随之更新。

- [ ] **Step 3: 移除临时接线代码**

删除 Step 2 中加入的临时 `<script>` 块（正式接线在 Task 9 通过 `app.js` 完成）。

- [ ] **Step 4: Commit**

```bash
git add aws-emr-view.js index.html
git commit -m "feat: 添加AWS EMR视图框架、支持政策横幅与按Release查询模式"
```

---

## Task 6: 按应用查询模式（含展开历史）

**Files:**
- Modify: `aws-emr-view.js`

- [ ] **Step 1: 在 `MODES` 数组定义之前添加 `renderByApp` 函数**

在 `aws-emr-view.js` 中，紧接着 `renderByRelease` 函数之后（`const MODES = [...]` 之前）插入：

```javascript
  // ---- Mode 2: 按应用查询 ----
  const HISTORY_PAGE_SIZE = 10;

  function renderByApp(container, data) {
    clear(container);
    const seriesKeys = q.getSeriesKeys(data);
    const state = { series: seriesKeys[0], expanded: false };

    const appSelectWrap = el('div', { class: 'field' });
    const resultWrap = el('div', { class: 'result' });

    function renderResult(app) {
      clear(resultWrap);
      const seriesData = data[state.series];
      const history = q.getAppHistory(seriesData, app);
      const visible = state.expanded ? history : history.slice(0, HISTORY_PAGE_SIZE);
      resultWrap.appendChild(renderTable(['Release', '版本'], visible));
      if (history.length > HISTORY_PAGE_SIZE) {
        const toggleBtn = el('button', {
          class: 'toggle-btn',
          onclick: function () {
            state.expanded = !state.expanded;
            renderResult(app);
          },
        }, [state.expanded ? '收起' : ('展开全部历史（共' + history.length + '个release）')]);
        resultWrap.appendChild(toggleBtn);
      }
    }

    function renderAppOptions() {
      clear(appSelectWrap);
      const seriesData = data[state.series];
      const appNames = q.getAppNames(seriesData);
      const appSelect = el('select', {
        class: 'app-select',
        onchange: function (e) {
          state.expanded = false;
          renderResult(e.target.value);
        },
      }, appNames.map(function (a) { return el('option', { value: a }, [a]); }));
      appSelectWrap.appendChild(el('label', null, ['应用: ', appSelect]));
      renderResult(appNames[0]);
    }

    const seriesSelect = renderSeriesSelect(seriesKeys, function (value) {
      state.series = value;
      state.expanded = false;
      renderAppOptions();
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'field' }, [el('label', null, ['系列: ', seriesSelect])]),
      appSelectWrap,
      resultWrap,
    ]));

    renderAppOptions();
  }
```

- [ ] **Step 2: 在 `MODES` 数组中注册新模式**

```javascript
  const MODES = [
    { id: 'by-release', label: '按Release查询', render: renderByRelease },
    { id: 'by-app', label: '按应用查询', render: renderByApp },
  ];
```

- [ ] **Step 3: 手动验证**

用浏览器打开 `index.html`（可临时恢复 Task 5 Step 2 的内联调用代码，验证后再移除）。
Expected: 点击"按应用查询"Tab，系列默认 `7.x`，应用下拉默认第一个应用（字母序），表格展示该应用最近10个release的版本；切到 `5.x` 系列选择 `Spark`（88个release），确认只显示最新10条并出现"展开全部历史（共88个release）"按钮，点击后展示全部88条并按钮变为"收起"。

- [ ] **Step 4: Commit**

```bash
git add aws-emr-view.js
git commit -m "feat: 添加按应用查询模式，支持展开完整历史"
```

---

## Task 7: 按应用版本号反查模式

**Files:**
- Modify: `aws-emr-view.js`

- [ ] **Step 1: 在 `renderByApp` 之后、`MODES` 数组之前添加 `renderByVersion` 函数**

```javascript
  // ---- Mode 3: 按应用版本号反查 ----
  function renderByVersion(container, data) {
    clear(container);
    const seriesKeys = q.getSeriesKeys(data);
    const state = { series: seriesKeys[0] };

    const appSelectWrap = el('div', { class: 'field' });
    const versionSelectWrap = el('div', { class: 'field' });
    const resultWrap = el('div', { class: 'result' });

    function renderResult(app, version) {
      clear(resultWrap);
      const seriesData = data[state.series];
      const releases = q.findReleasesByVersion(seriesData, app, version);
      if (releases.length === 0) {
        resultWrap.appendChild(el('p', { class: 'empty-msg' }, ['未找到包含该版本号的release。']));
        return;
      }
      resultWrap.appendChild(renderTable(['Release'], releases.map(function (r) { return [r]; })));
    }

    function renderVersionOptions(app) {
      clear(versionSelectWrap);
      const seriesData = data[state.series];
      const versions = q.getDistinctVersions(seriesData, app);
      if (versions.length === 0) {
        clear(resultWrap);
        resultWrap.appendChild(el('p', null, ['该应用在此系列下没有可反查的版本号。']));
        return;
      }
      const versionSelect = el('select', {
        class: 'version-select',
        onchange: function (e) { renderResult(app, e.target.value); },
      }, versions.map(function (v) { return el('option', { value: v }, [v]); }));
      versionSelectWrap.appendChild(el('label', null, ['版本号: ', versionSelect]));
      renderResult(app, versions[0]);
    }

    function renderAppOptions() {
      clear(appSelectWrap);
      const seriesData = data[state.series];
      const appNames = q.getAppNames(seriesData);
      const appSelect = el('select', {
        class: 'app-select',
        onchange: function (e) { renderVersionOptions(e.target.value); },
      }, appNames.map(function (a) { return el('option', { value: a }, [a]); }));
      appSelectWrap.appendChild(el('label', null, ['应用: ', appSelect]));
      renderVersionOptions(appNames[0]);
    }

    const seriesSelect = renderSeriesSelect(seriesKeys, function (value) {
      state.series = value;
      renderAppOptions();
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'field' }, [el('label', null, ['系列: ', seriesSelect])]),
      appSelectWrap,
      versionSelectWrap,
      resultWrap,
    ]));

    renderAppOptions();
  }
```

- [ ] **Step 2: 在 `MODES` 数组中注册新模式**

```javascript
  const MODES = [
    { id: 'by-release', label: '按Release查询', render: renderByRelease },
    { id: 'by-app', label: '按应用查询', render: renderByApp },
    { id: 'by-version', label: '按版本号反查', render: renderByVersion },
  ];
```

- [ ] **Step 3: 手动验证**

用浏览器打开 `index.html`（临时恢复内联调用代码）。
Expected: 点击"按版本号反查"Tab，选系列 `6.x`、应用 `Spark`，版本号下拉列出该应用在此系列出现过的所有不重复版本；选择某个版本，下方表格列出所有包含该版本的release。手动测试一个必然无匹配的场景（例如给 `Ganglia` 在 `7.x` 下——它全系列都是 `-`），确认版本下拉为空且显示"该应用在此系列下没有可反查的版本号。"

- [ ] **Step 4: Commit**

```bash
git add aws-emr-view.js
git commit -m "feat: 添加按应用版本号反查模式"
```

---

## Task 8: 多Release对比模式（跨系列）

**Files:**
- Modify: `aws-emr-view.js`

- [ ] **Step 1: 在 `renderByVersion` 之后、`MODES` 数组之前添加 `renderCompare` 函数**

```javascript
  // ---- Mode 4: 多Release对比（跨系列） ----
  function renderCompare(container, data) {
    clear(container);
    const seriesKeys = q.getSeriesKeys(data);
    const checkboxWrap = el('div', { class: 'compare-checkboxes' });
    const resultWrap = el('div', { class: 'result' });
    const selections = [];

    function renderResult() {
      clear(resultWrap);
      if (selections.length === 0) {
        resultWrap.appendChild(el('p', { class: 'empty-msg' }, ['请至少选择一个release进行对比。']));
        return;
      }
      const compared = q.compareReleases(data, selections);
      resultWrap.appendChild(renderTable(compared.headers, compared.rows));
    }

    seriesKeys.forEach(function (series) {
      data[series].releases.forEach(function (release) {
        const checkbox = el('input', {
          type: 'checkbox',
          onchange: function (e) {
            if (e.target.checked) {
              selections.push({ series: series, release: release });
            } else {
              const idx = selections.map(function (s) { return s.series + '|' + s.release; })
                .indexOf(series + '|' + release);
              if (idx !== -1) selections.splice(idx, 1);
            }
            renderResult();
          },
        });
        checkboxWrap.appendChild(el('label', { class: 'compare-item' }, [checkbox, ' ' + release]));
      });
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('p', { class: 'hint' }, ['勾选任意系列下的release进行对比（支持跨系列）：']),
      checkboxWrap,
      resultWrap,
    ]));

    renderResult();
  }
```

- [ ] **Step 2: 在 `MODES` 数组中注册新模式**

```javascript
  const MODES = [
    { id: 'by-release', label: '按Release查询', render: renderByRelease },
    { id: 'by-app', label: '按应用查询', render: renderByApp },
    { id: 'by-version', label: '按版本号反查', render: renderByVersion },
    { id: 'compare', label: '多Release对比', render: renderCompare },
  ];
```

- [ ] **Step 3: 手动验证**

用浏览器打开 `index.html`（临时恢复内联调用代码）。
Expected: 点击"多Release对比"Tab，初始显示"请至少选择一个release进行对比。"；勾选 `emr-6.15.0` 和 `emr-7.0.0`（跨系列），表格显示两列，应用为两个系列应用名的并集，某系列独有的应用在另一列显示 `—`；取消勾选后对应列消失，全部取消后恢复提示文案。

- [ ] **Step 4: 移除临时接线代码，最终确认 aws-emr-view.js 完整性**

确认 `index.html` 中没有残留 Task 5 Step 2 加入的临时 `<script>` 内联块。

- [ ] **Step 5: Commit**

```bash
git add aws-emr-view.js index.html
git commit -m "feat: 添加多Release跨系列对比模式"
```

---

## Task 9: 顶层Provider Tab接线与整体手动验证

**Files:**
- Create: `app.js`

- [ ] **Step 1: 编写 app.js**

```javascript
// app.js
(function () {
  const el = window.DomUtils.el;
  const clear = window.DomUtils.clear;

  const PROVIDERS = [
    { id: 'aws', label: 'AWS EMR', dataKey: 'aws', view: window.AwsEmrView },
    { id: 'azure', label: 'Azure HDInsight', dataKey: 'azure', view: null },
    { id: 'gcp', label: 'GCP Dataproc', dataKey: 'gcp', view: null },
  ];

  function init() {
    const cloudData = window.CLOUD_DATA || {};
    const tabBar = document.getElementById('provider-tab-bar');
    const panel = document.getElementById('provider-panel');

    function selectProvider(providerId) {
      Array.prototype.forEach.call(tabBar.children, function (btn) {
        btn.classList.toggle('active', btn.dataset.providerId === providerId);
      });
      const provider = PROVIDERS.filter(function (p) { return p.id === providerId; })[0];
      const data = cloudData[provider.dataKey];
      clear(panel);
      if (!data || !provider.view) {
        panel.appendChild(el('p', { class: 'coming-soon' }, ['暂不支持，敬请期待。']));
        return;
      }
      provider.view.mount(panel, data);
    }

    PROVIDERS.forEach(function (provider) {
      const available = Boolean(cloudData[provider.dataKey]) && Boolean(provider.view);
      const btn = el('button', {
        class: available ? 'provider-tab-btn' : 'provider-tab-btn disabled',
        onclick: function () {
          if (!available) return;
          selectProvider(provider.id);
        },
      }, [provider.label]);
      btn.dataset.providerId = provider.id;
      tabBar.appendChild(btn);
    });

    const firstAvailable = PROVIDERS.filter(function (p) {
      return cloudData[p.dataKey] && p.view;
    })[0];
    if (firstAvailable) {
      selectProvider(firstAvailable.id);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
```

- [ ] **Step 2: 全量手动验证**

用浏览器打开 `index.html`。逐项确认：
1. 顶部显示三个Tab：`AWS EMR`（可点击、默认高亮）、`Azure HDInsight`（灰色禁用）、`GCP Dataproc`（灰色禁用）
2. 点击灰色Tab无反应（不切换、不报错）
3. `AWS EMR` Tab下默认展示支持政策横幅 + 4个二级Tab（按Release查询/按应用查询/按版本号反查/多Release对比），默认选中"按Release查询"
4. 依次点击4个二级Tab，重复 Task 5～8 中列出的手动验证要点，确认所有场景在完整接线后仍然正确
5. 打开浏览器开发者工具Console，全程无 JS 报错

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: 添加顶层云厂商Tab切换逻辑，完成AWS EMR查询页面接线"
```

---

## 验证总览（对照设计文档的验收清单）

- [ ] 按Release查询：选系列+release，展示该release下所有应用版本表格
- [ ] 按应用查询：选系列+应用，展示版本历史，默认最新10个+可展开全部（5.x系列验证88个release的展开效果）
- [ ] 按应用版本号反查：选系列+应用+版本号，展示包含该版本的release列表；无匹配时给出明确提示
- [ ] 多Release对比：支持跨系列勾选，矩阵表格正确显示并集应用列表，缺失值显示 `—`
- [ ] AWS EMR Tab顶部正确展示 `standardSupportPolicy` 摘要及来源链接
- [ ] Azure HDInsight / GCP Dataproc Tab显示为禁用状态，点击无反应
- [ ] `null` 值统一显示为 `—`，`"Not tracked"` 原样显示
- [ ] `node scripts/verify-aws-emr-queries.js` 全部断言通过
- [ ] 双击 `index.html` 即可离线使用，无需本地服务器，控制台无报错
