# 云托管大数据服务版本信息多维度查询页面 · 设计文档

日期：2026-07-16

## 背景与目标

`aws-emr-application-version-info.json` 中已经收录了 AWS EMR 4.x/5.x/6.x/7.x 各 release 的应用版本信息，以及 `standardSupportPolicy` 支持政策摘要。目标是基于这份数据构建一个纯静态、可离线打开的多维度查询页面，方便快速查询"某个release包含哪些应用版本""某个应用版本演变历史""某个版本号出现在哪些release"等信息。

页面需要为未来接入 **Azure HDInsight**、**GCP Dataproc** 的同类数据预留清晰的Tab入口和扩展机制，但本次仅实现 AWS EMR 部分的完整功能。

## 范围

**本次实现：**
- AWS EMR Tab 的完整查询功能（4种查询模式）
- 顶层Tab预留 Azure HDInsight / GCP Dataproc 入口，显示"暂不支持，敬请期待"占位状态
- 数据转换脚本，将 JSON 数据源转换为页面可直接加载的 JS 数据文件

**不在本次范围：**
- Azure HDInsight、GCP Dataproc 的实际数据采集和查询实现
- 自动化测试框架搭建（采用手动浏览器验证）
- 服务端/构建工具链（保持零构建、纯静态文件）

## 文件结构

```
cloud-emr-support/
├── aws-emr-application-version-info.json   # 数据源（已存在，含 standardSupportPolicy）
├── scripts/
│   └── build-data.js                        # Node脚本：JSON → data/*.js
├── data/
│   ├── aws-emr-data.js                       # 由 build-data.js 生成，挂载 window.CLOUD_DATA.aws
│   ├── azure-hdinsight-data.js               # 占位，本次不生成实际数据（或生成空结构）
│   └── gcp-dataproc-data.js                  # 占位，同上
├── index.html                                # 页面骨架，引入 data/*.js 和 app.js
├── style.css
└── app.js                                    # 查询逻辑与渲染逻辑
```

**设计要点：**
- `aws-emr-application-version-info.json` 是唯一数据源，不重复手工维护。
- `build-data.js` 将 JSON 转换为 `window.CLOUD_DATA.aws = {...}` 形式的普通 JS 文件，通过 `<script src="data/aws-emr-data.js">` 引入，避免 `file://` 协议下 `fetch()` 本地 JSON 被 CORS 拦截的问题。双击 `index.html` 即可直接使用，无需启动本地服务器。
- `app.js` 启动时检测 `window.CLOUD_DATA` 上存在哪些 key（`aws`/`azure`/`gcp`），据此动态生成顶层Tab；没有对应数据的厂商Tab 显示"暂不支持，敬请期待"并禁用点击，为后续接入新厂商只需新增一个 `data/xxx-data.js` 文件并在 `index.html` 中新增一行 `<script>` 引入。

## 页面整体布局

顶层 Tab 切换云厂商（AWS EMR / Azure HDInsight / GCP Dataproc），二级 Tab 切换查询模式（按Release查询 / 按应用查询 / 按版本号反查 / 多Release对比）。每种查询模式独占页面主体区域，界面简洁清晰。

AWS EMR Tab 顶部展示 `standardSupportPolicy` 摘要信息（一句话 + 指向官方文档来源的链接），不作为可查询维度，仅作静态提示。

## 数据查询逻辑

数据结构 `{ "6.x": { "releases": [...], "applications": { "Spark": {"emr-6.15.0": "3.4.1-amzn-2", ...} } } }` 已经足以支撑全部4种查询，前端纯遍历实现，无需额外建反向索引。

### 1. 按 Release 查询
- 交互：选系列（4.x/5.x/6.x/7.x）→ 选具体 release → 展示该 release 下所有应用及版本的表格（应用名 | 版本号）。
- 实现：`Object.entries(series.applications).map(([app, versions]) => [app, versions[release]])`

### 2. 按应用查询
- 交互：选系列 → 选应用（如 Spark）→ 展示该应用在该系列所有 release 下的版本演变历史。
- 默认只显示最新 N 个 release（如最近10个），提供"展开全部历史"按钮查看完整历史（5.x 系列最长可达88个release）。
- 实现：直接读取 `series.applications[app]`，按 `series.releases` 顺序取值。

### 3. 按应用版本号反查
- 交互：选系列 → 选应用 → 从该应用实际出现过的版本号列表中选择（去重下拉）→ 展示包含该版本的所有 release。
- 实现：`Object.entries(series.applications[app]).filter(([release, v]) => v === targetVersion).map(([release]) => release)`

### 4. 多 Release 对比（支持跨系列）
- 交互：可从任意系列勾选多个 release（如 `emr-6.15.0` + `emr-7.0.0`）→ 展示"应用 × 所选release"矩阵表格。
- 跨系列对比时，应用列表取所选 release 所属系列的 `applications` key 并集，缺失的应用用 `—` 占位。

## 边界情况与错误处理

- **版本值为 `null`**（原 JSON 中的 `-`）：表格中显示为 `—`，可用灰色样式表示"该版本未包含此应用"。
- **`"Not tracked"` 值**：原样显示为文字，不做特殊转换。
- **反查无匹配结果**：提示"未找到包含该版本号的 release"，而非空白表格。
- **多 Release 对比中跨系列应用不一致**：某应用在该系列不存在时统一按 `—` 处理，不报错、不中断渲染。

## 视觉风格

延续"子Tab切换"布局：顶层云厂商 Tab + 二级查询模式 Tab，配色简洁（浅色背景 + 少量强调色区分选中状态），表格采用斑马纹提升可读性。具体像素级样式在实现阶段直接给出，不再另出可视化稿。

## 测试策略

无自动化测试框架，采用手动浏览器验证：实现完成后启动/打开页面，依次走查4种查询模式的正常路径，以及上述列出的边界情况，确认表格渲染正确。

## 决策记录（Q&A 摘要）

| 问题 | 决策 |
|---|---|
| 查询维度 | 按Release查询 + 按应用查询 + 按版本号反查 + 多Release对比（全选） |
| 页面布局 | 子Tab切换模式（顶层选云厂商，二级选查询模式） |
| 技术栈 | 纯 HTML/JS，零构建，双击即用 |
| 应用历史数据展示 | 默认最新N个 + "展开全部"按钮 |
| 应用查询的系列范围 | 先选系列再选应用（不跨系列合并展示） |
| 版本反查方式 | 先选应用再输入/选版本号（精确匹配） |
| 多Release对比范围 | 允许跨系列对比 |
| 本次任务范围 | 只实现 AWS EMR Tab，预留 Azure/GCP 入口 |
| 数据加载方式 | 数据内联为 JS 文件（`data/*.js`），避免 CORS 限制 |
| 代码组织 | 多文件静态站（index.html + style.css + app.js + data/*.js） |
