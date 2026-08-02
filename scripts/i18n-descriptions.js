// 将四个厂商 JSON 的「描述性文本」从「字符串」升级为「{en, zh}」双语结构，覆盖两类：
//   1. applicationDescriptions   —— 每个组件的一句话简介（前端按当前语言渲染，缺 zh 回退 en）
//   2. standardSupportPolicy.note / .milestones —— 支持政策横幅里的说明文字（同上）
// 用法：
//   node scripts/i18n-descriptions.js          # 实际写回
//   node scripts/i18n-descriptions.js --check  # 只校验：报告每个文件缺失/仍为字符串的条目，不写回
//
// 设计要点：
// - 原英文描述原样保留到 en 字段；zh 字段来自下方翻译表（跨厂商同义组件复用同一条译文）。
// - 专有名词（Spark/Flink/Standard support/GA/EOM/EOS/CVE/SLA/Supported until 等）不直译，保留英文。
// - 统一以 LF 换行、2 空格缩进写回，保持仓库内 JSON 风格一致。
// - 任何没有译文的条目会在 --check 中列出，便于后续补充（缺 zh 时前端回退到 en）。
// - 幂等：已是 {en, zh} 对象的条目会被跳过，可重复运行。
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = [
  'aws-emr-application-version-info.json',
  'azure-hdinsight-application-version-info.json',
  'gcp-dataproc-application-version-info.json',
  'aliyun-emr-application-version-info.json',
];

// ---- 组件描述翻译表：归一化键 → { en?, zh } ----
// lookup 时对组件名做小写化并去除非字母数字字符后匹配，
// 使 AWS 的 "Delta"/GCP 的 "Delta Lake"/Aliyun 的 "DeltaLake" 等可复用同一条译文。
// 某条的 en 若提供，表示「按归一化键强制覆盖英文描述」。
const TRANSLATIONS = {
  // ---- 通用大数据组件（跨厂商复用）----
  spark: { zh: 'Apache Spark，一套统一的分析引擎，支持大规模批处理、流处理、SQL 与机器学习。' },
  spark2: { zh: 'Apache Spark 2.x，一套统一的分析引擎，支持大规模批处理、流处理、SQL 与机器学习。' },
  spark3: { zh: 'Apache Spark 3.x，一套统一的分析引擎，支持大规模批处理、流处理、SQL 与机器学习。' },
  flink: { zh: 'Apache Flink，一套用于有状态流式与批量数据处理的分布式引擎。' },
  hive: { zh: 'Apache Hive，一套数据仓库系统，可对存储在 HDFS 或对象存储中的大规模数据集进行类 SQL 查询。' },
  hadoop: { zh: 'Apache Hadoop，核心的分布式存储（HDFS）与资源管理（YARN）框架，是大多数大数据工作负载的底座。' },
  hbase: { zh: 'Apache HBase，构建在 HDFS 之上的分布式列式 NoSQL 数据库，支持实时随机读写访问。' },
  kafka: { zh: 'Apache Kafka，一个分布式事件流平台，用于构建实时数据管道与消息系统。' },
  tez: { zh: 'Apache Tez，一套数据处理框架，为 Hive 和 Pig 提供更快速的执行引擎。' },
  ranger: { zh: 'Apache Ranger，一个集中式框架，用于管理集群的数据安全、授权与审计。' },
  oozie: { zh: 'Apache Oozie，一个用于协调与管理 Hadoop 作业的工作流调度器。' },
  zookeeper: { zh: 'Apache ZooKeeper，一个分布式协调服务，用于集群各服务间的配置、命名与同步。' },
  livy: { zh: 'Apache Livy，一个 REST 接口，供远端应用提交与管理 Spark 作业。' },
  zeppelin: { zh: 'Apache Zeppelin，一个基于 Web 的笔记本，用于交互式数据探索、可视化与协作。' },
  phoenix: { zh: 'Apache Phoenix，一个 SQL 查询引擎，为存储在 HBase 中的数据提供低延迟访问。' },
  pig: { zh: 'Apache Pig，一个高层脚本平台，可将数据转换以数据流方式表达并运行于 Hadoop 之上。' },
  sqoop: { zh: 'Apache Sqoop，一个用于在 Hadoop 与关系型数据库之间批量传输数据的工具。' },
  hudi: { zh: 'Apache Hudi，一个事务型数据湖框架，支持更新插入（upsert）、删除与增量数据处理。' },
  iceberg: { zh: 'Apache Iceberg，一个高性能开放表格式，面向大型分析数据集，支持模式演进与快照隔离。' },
  deltalake: { zh: 'Delta Lake，一个开放表格式，为基于 Spark 的数据湖提供 ACID 事务与版本管理。' },
  presto: { zh: '一个分布式 SQL 查询引擎，可对大规模数据集进行快速交互式分析。' },
  trino: { zh: 'Trino，一个分布式 SQL 查询引擎，可跨异构数据源进行快速交互式分析。' },
  hue: { zh: '一个基于 Web 的界面，用于浏览 HDFS、运行 Hive 查询并管理工作流。' },
  python: { zh: 'Python 运行时及相关包管理工具，可用于编写 Spark、Hive、Hadoop Streaming 等应用与脚本。' },
  scala: { zh: 'Scala 运行时，用于编译和运行 Spark 及其他基于 JVM 的大数据应用。' },
  hcatalog: { zh: '一个表与存储管理层，使 Hive、Pig 和 MapReduce 能共享统一的数据元数据视图。' },

  // ---- AWS EMR 专有 ----
  amazonsdkforjava: { zh: 'AWS SDK for Java，使应用能够以编程方式从 EMR 内访问各类 AWS 服务。' },
  amazoncloudwatchagent: { zh: '从集群实例采集系统与自定义指标，并发布到 Amazon CloudWatch。' },
  ganglia: { zh: '一个可扩展的集群监控系统，用于可视化各节点的实时资源指标。' },
  jupyterenterprisegateway: { zh: '让远程 Jupyter 内核运行在集群上，使笔记本能够向 YARN 提交 Spark 作业。' },
  jupyterhub: { zh: '一个多用户服务器，可为每位用户派生并管理独立的 Jupyter 笔记本服务。' },
  mxnet: { zh: 'Apache MXNet，一个用于训练和部署神经网络的深度学习框架。' },
  mahout: { zh: 'Apache Mahout，一个构建在分布式处理引擎之上的可扩展机器学习算法库。' },
  tensorflow: { zh: '一个开源机器学习框架，用于构建和训练深度学习模型。' },

  // ---- Azure HDInsight 专有 ----
  apacheambari: { zh: 'Apache Ambari，一个基于 Web 的平台，用于 provisioning、管理和监控集群的 Hadoop 服务。' },

  // ---- GCP Dataproc 专有 ----
  apacheatlas: { zh: 'Apache Atlas，一个数据治理与元数据管理框架，用于编目和分类数据资产。' },
  apachehivewebhcat: { zh: 'Hive 元存储（metastore）的 REST API，使外部工具可通过 HTTP 提交 Hive/Pig/MapReduce 作业并访问表元数据。' },
  bigqueryconnector: { zh: 'Spark BigQuery 连接器，使 Spark 作业能够直接读写 Google BigQuery 表。' },
  cloudstorageconnector: { zh: 'Hadoop Cloud Storage 连接器，使 Hadoop 和 Spark 能将 Google Cloud Storage 存储桶当作分布式文件系统使用。' },
  conscrypt: { zh: 'Conscrypt，一个基于 BoringSSL 的 Java 安全提供者，为 JVM 提供更快速、更新及时的 TLS 与加密支持。' },
  docker: { zh: 'Docker，一个容器运行时，用于在集群上打包并运行自定义或可选组件的工作负载。' },
  java: { zh: 'Java 运行时（JDK），Spark、Hadoop 及其他基于 JVM 的集群组件均运行于其上。' },
  jupyterlabnotebook: { zh: 'JupyterLab，一个基于 Web 的交互式笔记本界面，用于探索性数据分析与 Spark 作业开发。' },
  r: { zh: 'R 运行时，可用于统计计算以及 SparkR/sparklyr 工作负载。' },
  solr: { zh: 'Apache Solr，一个搜索平台，可对集群上存储的数据提供全文检索与索引。' },
  trinoprestosql: { zh: 'Trino（前身为 PrestoSQL），一个分布式 SQL 查询引擎，可跨异构数据源进行快速交互式分析。' },

  // ---- 阿里云 EMR 专有 ----
  celeborn: { zh: 'Apache Celeborn，一个面向 Spark 和 Flink 的中间 Shuffle 服务，可提升大规模 Shuffle 的稳定性与性能。' },
  clickhouse: { zh: 'ClickHouse，一个列式 OLAP 数据库，适用于快速的实时分析查询。' },
  dlfauth: { zh: '阿里云数据湖构建（Data Lake Formation）的认证/授权组件，为 Hive、Spark 等引擎提供统一的数据目录访问控制。' },
  doris: { zh: 'Apache Doris，一个基于 MPP 的实时分析型数据库。' },
  flinktablestore: { zh: 'Flink Table Store，一个流式数据湖存储格式，支持流批一体的读写（Apache Paimon 的前身）。' },
  flume: { zh: 'Apache Flume，一个用于采集、聚合和移动海量日志数据的分布式系统。' },
  hdfs: { zh: 'Hadoop 分布式文件系统（HDFS），是大多数 EMR 集群工作负载的底层核心存储层。' },
  hadoopcommon: { zh: 'Hadoop Common，HDFS、YARN 及其他 Hadoop 模块所依赖的公共库（I/O、序列化、RPC）。' },
  impala: { zh: 'Apache Impala，一个 MPP SQL 查询引擎，可直接对 HDFS/Hive 数据进行低延迟交互式分析。' },
  jindocache: { zh: '阿里云 JindoCache，一个本地数据缓存层，可加速计算作业读取 OSS 及其他对象存储。' },
  jindodata: { zh: '阿里云 JindoData，一个存算分离的数据访问层，优化 Hadoop 生态组件对 OSS 的读写。' },
  kafkamanager: { zh: '一个用于管理和监控 Kafka 集群的 Web 工具。' },
  knox: { zh: 'Apache Knox，一个面向 Hadoop 集群服务的统一 REST API 网关与认证代理。' },
  kudu: { zh: 'Apache Kudu，一个列式存储引擎，在支持实时更新的同时兼顾快速分析。' },
  kyuubi: { zh: 'Apache Kyuubi，一个统一的 JDBC/ODBC 网关服务，使多种引擎（Spark、Flink、Trino）通过单一入口提供 SQL 服务。' },
  osshdfs: { zh: '阿里云针对 OSS 对象存储提供的 HDFS 兼容接口，使 Hadoop 生态组件能像访问 HDFS 一样访问 OSS。' },
  openldap: { zh: '一个开源 LDAP 目录服务，用于集群内的统一身份认证。' },
  paimon: { zh: 'Apache Paimon（前身为 Flink Table Store），一个面向流批一体数据湖工作负载的开放表格式。' },
  rss: { zh: 'Remote Shuffle Service，一个面向 Spark 等引擎的外部/弹性 Shuffle 服务，可降低大规模 Shuffle 对本地磁盘的依赖。' },
  rangerplugin: { zh: '面向各组件的 Ranger 插件（Hive、HDFS、HBase 等），在各服务内部强制执行由 Ranger 管理的访问策略。' },
  starrocks: { zh: 'StarRocks，一个基于 MPP 的实时分析型数据库。' },
  starrocks2: { zh: 'StarRocks 2.x，一个基于 MPP 的实时分析型数据库。' },
  starrocks3: { zh: 'StarRocks 3.x，一个基于 MPP 的实时分析型数据库。' },
  yarn: { zh: 'Yet Another Resource Negotiator（YARN），集群资源管理与作业调度层，是大多数 EMR 工作负载的底座。' },
};

// ---- 支持政策说明文本（standardSupportPolicy.note / .milestones）翻译表 ----
// 键为「厂商 dataKey」，专有名词保留英文不直译。
const POLICY_NOTE_ZH = {
  azure: 'HDInsight 提供两个支持层级。Standard support 涵盖故障排查、RCA、性能调优、Spark core 问题/更新以及安全/CVE 更新；Basic support 仅涵盖在同版本上继续使用/创建集群、扩缩容以及关键安全修复，OSS 组件不在服务范围内。',
  gcp: 'Managed Service for Apache Spark（前身为 Dataproc）按镜像版本发布 "Supported until" 与 "Available until" 日期，而非单独的 Standard/Basic 支持层级。超过 supported-until 日期后，该镜像版本不再推荐用于新建集群；超过 available-until 日期后，则完全无法选择。',
  aliyun: '阿里云 EMR on ECS 通过 GA、EOM、EOS 三个阶段管理每个发行版本的生命周期。',
  aws: '该表格为2024年7月25日支持政策发布时的历史快照，仅包含一条汇总记录，未按单个release逐条列出日期；2024年7月25日之后的最新状态请参考各release自身的release notes。',
};

// Aliyun 的生命周期里程碑（GA/EOM/EOS）释义。
const POLICY_MILESTONES_ZH = {
  GA: 'General Availability（正式发布）— 该版本已发布，可用于生产环境，并提供技术支持与 SLA 保障。',
  EOM: 'End of Market（停止销售）— 名义上为 GA 日期 + 3 年。此后无法基于该版本新建集群，存量集群仍继续获得技术支持与 SLA 保障。',
  EOS: 'End of Service & Support（停止服务与支持）— 至少为 EOM 日期 + 1 年。所有技术支持与 SLA 保障终止，请在此日期前迁移离开该版本。',
};

// 归一化组件名：小写并去除非字母数字。如 "OSS-HDFS"→"osshdfs"、"DLF-Auth"→"dlfauth"。
function normalize(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
}

// 归一化后仍与 TRANSLATIONS 键不一致的组件，做显式别名映射。
// 主要覆盖：Azure/GCP 的 "Apache Xxx" 前缀、各类 "Xxx-Sandbox" 沙箱构建、带后缀的别名。
const ALIASES = {
  delta: 'deltalake',
  zeppelinnotebook: 'zeppelin',
  // Azure / GCP 的 "Apache Xxx" 命名 → 通用键
  apachespark: 'spark',
  apacheflink: 'flink',
  apachehive: 'hive',
  apachehadoop: 'hadoop',
  apachehbase: 'hbase',
  apachekafka: 'kafka',
  apachetez: 'tez',
  apacheranger: 'ranger',
  apacheoozie: 'oozie',
  apachezookeeper: 'zookeeper',
  apachelivy: 'livy',
  apachezeppelin: 'zeppelin',
  apachephoenix: 'phoenix',
  apachepig: 'pig',
  apachesqoop: 'sqoop',
  apachehudi: 'hudi',
  apacheiceberg: 'iceberg',
};

// "Xxx-Sandbox" 沙箱构建：译文基于对应基础组件动态生成。
const SANDBOX_BASE = {
  ooziesandbox: 'Apache Oozie',
  prestosandbox: 'Presto',
  sqoopsandbox: 'Apache Sqoop',
  zeppelinsandbox: 'Apache Zeppelin',
  zookeepersandbox: 'Apache ZooKeeper',
};

function lookupTranslation(appName) {
  const key = normalize(appName);
  if (TRANSLATIONS[key]) return TRANSLATIONS[key];
  if (ALIASES[key] && TRANSLATIONS[ALIASES[key]]) return TRANSLATIONS[ALIASES[key]];
  if (SANDBOX_BASE[key]) {
    return { zh: SANDBOX_BASE[key] + ' 的沙箱构建版本，随早期 EMR 4.x 版本一同打包。' };
  }
  return null;
}

// 判断一个值是否已是 {en, zh} 双语对象。
function isBilingual(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

const checkOnly = process.argv.indexOf('--check') !== -1;
let totalMissing = 0;
let totalUpgraded = 0;
let totalAlready = 0;

FILES.forEach(function (file) {
  const fullPath = path.join(ROOT, file);
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  const dataKey = file.replace('-application-version-info.json', '')
    .replace('aws-emr', 'aws').replace('azure-hdinsight', 'azure')
    .replace('gcp-dataproc', 'gcp').replace('aliyun-emr', 'aliyun');

  let upgraded = 0;
  let already = 0;
  const missing = [];

  // ---- 1. applicationDescriptions ----
  const descriptions = data.applicationDescriptions || {};
  Object.keys(descriptions).forEach(function (app) {
    const cur = descriptions[app];
    if (isBilingual(cur)) { already++; return; }
    const en = typeof cur === 'string' ? cur : '';
    const tr = lookupTranslation(app);
    if (tr && tr.zh) {
      descriptions[app] = { en: tr.en !== undefined ? tr.en : en, zh: tr.zh };
      upgraded++;
    } else {
      descriptions[app] = { en: en, zh: null };
      missing.push('app:' + app);
    }
  });

  // ---- 2. standardSupportPolicy.note ----
  const policy = data.standardSupportPolicy;
  if (policy && policy.note !== undefined) {
    if (isBilingual(policy.note)) {
      already++;
    } else {
      const en = typeof policy.note === 'string' ? policy.note : '';
      const zh = POLICY_NOTE_ZH[dataKey];
      if (zh) {
        policy.note = { en: en, zh: zh };
        upgraded++;
      } else {
        policy.note = { en: en, zh: null };
        missing.push('policy.note');
      }
    }
  }

  // ---- 3. standardSupportPolicy.milestones（GA/EOM/EOS 等）----
  if (policy && policy.milestones && typeof policy.milestones === 'object') {
    Object.keys(policy.milestones).forEach(function (ms) {
      const cur = policy.milestones[ms];
      if (isBilingual(cur)) { already++; return; }
      const en = typeof cur === 'string' ? cur : '';
      const zh = POLICY_MILESTONES_ZH[ms];
      if (zh) {
        policy.milestones[ms] = { en: en, zh: zh };
        upgraded++;
      } else {
        policy.milestones[ms] = { en: en, zh: null };
        missing.push('milestone:' + ms);
      }
    });
  }

  totalMissing += missing.length;
  totalUpgraded += upgraded;
  totalAlready += already;

  console.log('\n=== ' + file + ' ===');
  console.log('  升级(含译文): ' + upgraded + '，已是对象: ' + already + '，缺译文(zh=null): ' + missing.length);
  if (missing.length) {
    console.log('  缺译文条目: ' + missing.join(', '));
  }

  if (!checkOnly) {
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    console.log('  已写回（LF, 2 空格缩进）。');
  }
});

console.log('\n---- 汇总 ----');
console.log('升级: ' + totalUpgraded + '，已是对象: ' + totalAlready + '，缺译文: ' + totalMissing + (checkOnly ? '（--check，未写回）' : ''));
