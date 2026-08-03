// 本文件由 scripts/build-data.js 自动生成，请勿手动编辑。
// 数据源: azure-hdinsight-application-version-info.json
window.CLOUD_DATA = window.CLOUD_DATA || {};
window.CLOUD_DATA.azure = {
  "dataAsOf": "2026-08-02",
  "standardSupportPolicy": {
    "source": "https://learn.microsoft.com/en-us/azure/hdinsight/hdinsight-component-versioning",
    "note": {
      "en": "HDInsight offers two support tiers. Standard support covers troubleshooting, RCA, performance tuning, Spark core issues/updates, and security/CVE updates. Basic support only covers continued use/creation of clusters on the same version, scaling, and critical security fixes; OSS components are not serviced.",
      "zh": "HDInsight 提供两个支持层级。Standard support 涵盖故障排查、RCA、性能调优、Spark core 问题/更新以及安全/CVE 更新；Basic support 仅涵盖在同版本上继续使用/创建集群、扩缩容以及关键安全修复，OSS 组件不在服务范围内。"
    },
    "supportTypes": {
      "Standard": "Full support: create clusters, troubleshoot runtime issues, root cause analysis, performance tuning, onboarding assistance, Spark core issues/updates, security/CVE updates.",
      "Basic": "Limited support: use/create clusters on the same version, scale up/down; no runtime troubleshooting, RCA, or OSS component servicing beyond critical security fixes."
    }
  },
  "applicationDescriptions": {
    "Apache Spark": {
      "en": "Apache Spark, a unified analytics engine for large-scale batch processing, streaming, SQL, and machine learning.",
      "zh": "Apache Spark，一套统一的分析引擎，支持大规模批处理、流处理、SQL 与机器学习。"
    },
    "Apache Hive": {
      "en": "Apache Hive, a data warehouse system providing SQL-like querying over large datasets stored in HDFS or Azure Data Lake Storage.",
      "zh": "Apache Hive，一套数据仓库系统，可对存储在 HDFS 或对象存储中的大规模数据集进行类 SQL 查询。"
    },
    "Apache Kafka": {
      "en": "Apache Kafka, a distributed event streaming platform for building real-time data pipelines and messaging systems.",
      "zh": "Apache Kafka，一个分布式事件流平台，用于构建实时数据管道与消息系统。"
    },
    "Apache Hadoop": {
      "en": "Apache Hadoop, the core distributed storage (HDFS) and resource management (YARN) framework underlying most HDInsight workloads.",
      "zh": "Apache Hadoop，核心的分布式存储（HDFS）与资源管理（YARN）框架，是大多数大数据工作负载的底座。"
    },
    "Apache Tez": {
      "en": "Apache Tez, a data processing framework that provides a faster execution engine underneath Hive and Pig.",
      "zh": "Apache Tez，一套数据处理框架，为 Hive 和 Pig 提供更快速的执行引擎。"
    },
    "Apache Ranger": {
      "en": "Apache Ranger, a centralized framework for managing data security, authorization, and auditing across the cluster.",
      "zh": "Apache Ranger，一个集中式框架，用于管理集群的数据安全、授权与审计。"
    },
    "Apache HBase": {
      "en": "Apache HBase, a distributed, column-oriented NoSQL database built on HDFS for real-time random read/write access.",
      "zh": "Apache HBase，构建在 HDFS 之上的分布式列式 NoSQL 数据库，支持实时随机读写访问。"
    },
    "Apache Oozie": {
      "en": "Apache Oozie, a workflow scheduler for coordinating and managing Hadoop jobs.",
      "zh": "Apache Oozie，一个用于协调与管理 Hadoop 作业的工作流调度器。"
    },
    "Apache ZooKeeper": {
      "en": "Apache ZooKeeper, a distributed coordination service used for configuration, naming, and synchronization across cluster services.",
      "zh": "Apache ZooKeeper，一个分布式协调服务，用于集群各服务间的配置、命名与同步。"
    },
    "Apache Livy": {
      "en": "Apache Livy, a REST interface for submitting and managing Spark jobs from remote applications.",
      "zh": "Apache Livy，一个 REST 接口，供远端应用提交与管理 Spark 作业。"
    },
    "Apache Ambari": {
      "en": "Apache Ambari, a web-based platform for provisioning, managing, and monitoring the cluster's Hadoop services.",
      "zh": "Apache Ambari，一个基于 Web 的平台，用于 provisioning、管理和监控集群的 Hadoop 服务。"
    },
    "Apache Zeppelin": {
      "en": "Apache Zeppelin, a web-based notebook for interactive data exploration, visualization, and collaboration.",
      "zh": "Apache Zeppelin，一个基于 Web 的笔记本，用于交互式数据探索、可视化与协作。"
    },
    "Apache Phoenix": {
      "en": "Apache Phoenix, a SQL query engine that provides low-latency access to data stored in HBase.",
      "zh": "Apache Phoenix，一个 SQL 查询引擎，为存储在 HBase 中的数据提供低延迟访问。"
    },
    "Apache Pig": {
      "en": "Apache Pig, a high-level scripting platform for expressing data transformations as dataflows over Hadoop.",
      "zh": "Apache Pig，一个高层脚本平台，可将数据转换以数据流方式表达并运行于 Hadoop 之上。"
    },
    "Apache Sqoop": {
      "en": "Apache Sqoop, a tool for transferring bulk data between Hadoop and relational databases.",
      "zh": "Apache Sqoop，一个用于在 Hadoop 与关系型数据库之间批量传输数据的工具。"
    }
  },
  "releases": [
    "5.1",
    "5.0",
    "4.0"
  ],
  "releaseInfo": {
    "5.1": {
      "vmOs": "Ubuntu 18.0.4 LTS",
      "releaseDate": "November 1, 2023",
      "supportType": "Standard",
      "supportExpirationDate": "Not announced",
      "retirementDate": "Not announced",
      "highAvailability": true
    },
    "5.0": {
      "vmOs": "Ubuntu 18.0.4 LTS",
      "releaseDate": "March 11, 2022",
      "supportType": "Basic",
      "supportExpirationDate": "March 31, 2025",
      "retirementDate": "March 31, 2025",
      "highAvailability": true
    },
    "4.0": {
      "vmOs": "Ubuntu 18.0.4 LTS",
      "releaseDate": "September 24, 2018",
      "supportType": "Basic",
      "supportExpirationDate": "March 31, 2025",
      "retirementDate": "March 31, 2025",
      "highAvailability": true
    }
  },
  "applications": {
    "Apache Spark": {
      "5.1": "3.3.1",
      "5.0": "3.1.3",
      "4.0": "2.4.4"
    },
    "Apache Hive": {
      "5.1": "3.1.2",
      "5.0": "3.1.2",
      "4.0": "3.1.2"
    },
    "Apache Kafka": {
      "5.1": "3.2.0",
      "5.0": "2.4.1",
      "4.0": "2.1.1"
    },
    "Apache Hadoop": {
      "5.1": "3.3.4",
      "5.0": "3.1.1",
      "4.0": "3.1.1"
    },
    "Apache Tez": {
      "5.1": "0.9.1",
      "5.0": "0.9.1",
      "4.0": "0.9.1"
    },
    "Apache Ranger": {
      "5.1": "2.3.0",
      "5.0": "1.1.0",
      "4.0": "1.1.0"
    },
    "Apache HBase": {
      "5.1": "2.4.11",
      "5.0": "2.1.6",
      "4.0": "2.1.6"
    },
    "Apache Oozie": {
      "5.1": "5.2.1",
      "5.0": "4.3.1",
      "4.0": "4.3.1"
    },
    "Apache ZooKeeper": {
      "5.1": "3.6.3",
      "5.0": "3.4.6",
      "4.0": "3.4.6"
    },
    "Apache Livy": {
      "5.1": "0.5.",
      "5.0": "0.5",
      "4.0": "0.5"
    },
    "Apache Ambari": {
      "5.1": "2.7.3",
      "5.0": "2.7.3",
      "4.0": "2.7.0"
    },
    "Apache Zeppelin": {
      "5.1": "0.10.1",
      "5.0": "0.8.0",
      "4.0": "0.8.0"
    },
    "Apache Phoenix": {
      "5.1": "5.1.2",
      "5.0": null,
      "4.0": "5"
    },
    "Apache Pig": {
      "5.1": null,
      "5.0": null,
      "4.0": "0.16.1"
    },
    "Apache Sqoop": {
      "5.1": null,
      "5.0": null,
      "4.0": "1.5.0"
    }
  },
  "notes": {
    "sqoopAndPigDiscontinued": "The Sqoop and Pig add-ons were discontinued starting with HDInsight 5.1; they are not present in the HDInsight 5.x component table for either 5.1 or 5.0.",
    "livyVersionAsPublished": "The HDInsight 5.1 Apache Livy version is published as \"0.5.\" (trailing period) on the source page; kept verbatim rather than corrected.",
    "hadoopComponentNaming": "The HDInsight 4.0 source page labels this component \"Apache Hadoop and YARN\"; normalized to \"Apache Hadoop\" here for consistency with the 5.x page."
  }
};
