// 本文件由 scripts/build-data.js 自动生成，请勿手动编辑。
// 数据源: gcp-dataproc-application-version-info.json
window.CLOUD_DATA = window.CLOUD_DATA || {};
window.CLOUD_DATA.gcp = {
  "standardSupportPolicy": {
    "source": "https://docs.cloud.google.com/managed-spark/docs/concepts/versioning/image-version-lists",
    "note": {
      "en": "Managed Service for Apache Spark (formerly Dataproc) publishes per-image-version \"Supported until\" and \"Available until\" dates rather than separate Standard/Basic support tiers. After the supported-until date the image version is no longer recommended for new clusters; after the available-until date it can no longer be selected at all.",
      "zh": "Managed Service for Apache Spark（前身为 Dataproc）按镜像版本发布 \"Supported until\" 与 \"Available until\" 日期，而非单独的 Standard/Basic 支持层级。超过 supported-until 日期后，该镜像版本不再推荐用于新建集群；超过 available-until 日期后，则完全无法选择。"
    }
  },
  "applicationDescriptions": {
    "Apache Atlas": {
      "en": "Apache Atlas, a data governance and metadata management framework for cataloging and classifying data assets.",
      "zh": "Apache Atlas，一个数据治理与元数据管理框架，用于编目和分类数据资产。"
    },
    "Apache Flink": {
      "en": "Apache Flink, a distributed engine for stateful stream and batch data processing.",
      "zh": "Apache Flink，一套用于有状态流式与批量数据处理的分布式引擎。"
    },
    "Apache Hadoop": {
      "en": "Apache Hadoop, the core distributed storage (HDFS) and resource management (YARN) framework underlying most Spark cluster workloads.",
      "zh": "Apache Hadoop，核心的分布式存储（HDFS）与资源管理（YARN）框架，是大多数大数据工作负载的底座。"
    },
    "Apache Hive": {
      "en": "Apache Hive, a data warehouse system providing SQL-like querying over large datasets stored in HDFS or Cloud Storage.",
      "zh": "Apache Hive，一套数据仓库系统，可对存储在 HDFS 或对象存储中的大规模数据集进行类 SQL 查询。"
    },
    "Apache Hive WebHCat": {
      "en": "A REST API for Hive's metastore, letting external tools submit Hive/Pig/MapReduce jobs and access table metadata over HTTP.",
      "zh": "Hive 元存储（metastore）的 REST API，使外部工具可通过 HTTP 提交 Hive/Pig/MapReduce 作业并访问表元数据。"
    },
    "Apache Hudi": {
      "en": "Apache Hudi, a transactional data lake framework enabling upserts, deletes, and incremental data processing.",
      "zh": "Apache Hudi，一个事务型数据湖框架，支持更新插入（upsert）、删除与增量数据处理。"
    },
    "Apache Iceberg": {
      "en": "Apache Iceberg, a high-performance open table format for large analytic datasets with schema evolution and snapshot isolation.",
      "zh": "Apache Iceberg，一个高性能开放表格式，面向大型分析数据集，支持模式演进与快照隔离。"
    },
    "Apache Kafka": {
      "en": "Apache Kafka, a distributed event streaming platform for building real-time data pipelines and messaging systems.",
      "zh": "Apache Kafka，一个分布式事件流平台，用于构建实时数据管道与消息系统。"
    },
    "Apache Pig": {
      "en": "Apache Pig, a high-level scripting platform for expressing data transformations as dataflows over Hadoop.",
      "zh": "Apache Pig，一个高层脚本平台，可将数据转换以数据流方式表达并运行于 Hadoop 之上。"
    },
    "Apache Spark": {
      "en": "Apache Spark, a unified analytics engine for large-scale batch processing, streaming, SQL, and machine learning.",
      "zh": "Apache Spark，一套统一的分析引擎，支持大规模批处理、流处理、SQL 与机器学习。"
    },
    "Apache Sqoop": {
      "en": "Apache Sqoop, a tool for transferring bulk data between Hadoop and relational databases.",
      "zh": "Apache Sqoop，一个用于在 Hadoop 与关系型数据库之间批量传输数据的工具。"
    },
    "Apache Tez": {
      "en": "Apache Tez, a data processing framework that provides a faster execution engine underneath Hive and Pig.",
      "zh": "Apache Tez，一套数据处理框架，为 Hive 和 Pig 提供更快速的执行引擎。"
    },
    "BigQuery Connector": {
      "en": "The Spark BigQuery connector, enabling Spark jobs to read from and write to Google BigQuery tables directly.",
      "zh": "Spark BigQuery 连接器，使 Spark 作业能够直接读写 Google BigQuery 表。"
    },
    "Cloud Storage Connector": {
      "en": "The Hadoop Cloud Storage connector, letting Hadoop and Spark treat Google Cloud Storage buckets as a distributed filesystem.",
      "zh": "Hadoop Cloud Storage 连接器，使 Hadoop 和 Spark 能将 Google Cloud Storage 存储桶当作分布式文件系统使用。"
    },
    "Conscrypt": {
      "en": "Conscrypt, a Java security provider using BoringSSL for faster, more up-to-date TLS and cryptography support on the JVM.",
      "zh": "Conscrypt，一个基于 BoringSSL 的 Java 安全提供者，为 JVM 提供更快速、更新及时的 TLS 与加密支持。"
    },
    "Delta Lake": {
      "en": "Delta Lake, an open table format that adds ACID transactions and versioning to Spark-based data lakes.",
      "zh": "Delta Lake，一个开放表格式，为基于 Spark 的数据湖提供 ACID 事务与版本管理。"
    },
    "Docker": {
      "en": "Docker, a container runtime used to package and run custom or optional-component workloads on the cluster.",
      "zh": "Docker，一个容器运行时，用于在集群上打包并运行自定义或可选组件的工作负载。"
    },
    "Hue": {
      "en": "A web-based interface for browsing HDFS, running Hive queries, and managing workflows.",
      "zh": "一个基于 Web 的界面，用于浏览 HDFS、运行 Hive 查询并管理工作流。"
    },
    "Java": {
      "en": "The Java runtime (JDK) that Spark, Hadoop, and other JVM-based cluster components run on.",
      "zh": "Java 运行时（JDK），Spark、Hadoop 及其他基于 JVM 的集群组件均运行于其上。"
    },
    "JupyterLab Notebook": {
      "en": "JupyterLab, a web-based interactive notebook interface for exploratory data analysis and Spark job development.",
      "zh": "JupyterLab，一个基于 Web 的交互式笔记本界面，用于探索性数据分析与 Spark 作业开发。"
    },
    "Oozie": {
      "en": "Apache Oozie, a workflow scheduler for coordinating and managing Hadoop jobs.",
      "zh": "Apache Oozie，一个用于协调与管理 Hadoop 作业的工作流调度器。"
    },
    "Python": {
      "en": "The Python runtime and package manager (Conda/Mamba/Pixi, version-dependent) available for PySpark and general scripting.",
      "zh": "Python 运行时及相关包管理工具，可用于编写 Spark、Hive、Hadoop Streaming 等应用与脚本。"
    },
    "R": {
      "en": "The R runtime, available for statistical computing and SparkR/sparklyr workloads.",
      "zh": "R 运行时，可用于统计计算以及 SparkR/sparklyr 工作负载。"
    },
    "Ranger": {
      "en": "Apache Ranger, a centralized framework for managing data security, authorization, and auditing across the cluster.",
      "zh": "Apache Ranger，一个集中式框架，用于管理集群的数据安全、授权与审计。"
    },
    "Scala": {
      "en": "The Scala runtime used to compile and run Spark and other JVM-based big data applications.",
      "zh": "Scala 运行时，用于编译和运行 Spark 及其他基于 JVM 的大数据应用。"
    },
    "Solr": {
      "en": "Apache Solr, a search platform providing full-text search and indexing over data stored on the cluster.",
      "zh": "Apache Solr，一个搜索平台，可对集群上存储的数据提供全文检索与索引。"
    },
    "Trino": {
      "en": "Trino, a distributed SQL query engine for fast interactive analytics across heterogeneous data sources.",
      "zh": "Trino，一个分布式 SQL 查询引擎，可跨异构数据源进行快速交互式分析。"
    },
    "Zeppelin Notebook": {
      "en": "Apache Zeppelin, a web-based notebook for interactive data exploration, visualization, and collaboration.",
      "zh": "Apache Zeppelin，一个基于 Web 的笔记本，用于交互式数据探索、可视化与协作。"
    },
    "Zookeeper": {
      "en": "Apache ZooKeeper, a distributed coordination service used for configuration, naming, and synchronization across cluster services.",
      "zh": "Apache ZooKeeper，一个分布式协调服务，用于集群各服务间的配置、命名与同步。"
    }
  },
  "releases": [
    "3.0",
    "2.3",
    "2.2",
    "2.1"
  ],
  "releaseInfo": {
    "3.0": {
      "osImages": [
        "3.0-debian12",
        "3.0-ubuntu24",
        "3.0-rocky9"
      ],
      "lastUpdated": "May 3, 2026",
      "releasedOn": "September 8, 2025",
      "supportedUntil": "TBD",
      "availableUntil": "TBD",
      "releaseStage": "Preview",
      "additionalNotes": null
    },
    "2.3": {
      "osImages": [
        "2.3-debian12",
        "2.3-ubuntu22",
        "2.3-rocky9"
      ],
      "lastUpdated": "June 30, 2026",
      "releasedOn": "June 9, 2025",
      "supportedUntil": "June 9, 2027",
      "availableUntil": "June 9, 2029",
      "releaseStage": "General availability",
      "additionalNotes": null
    },
    "2.2": {
      "osImages": [
        "2.2-debian12",
        "2.2-ubuntu22",
        "2.2-rocky9"
      ],
      "lastUpdated": "June 30, 2026",
      "releasedOn": "December 8, 2023",
      "supportedUntil": "March 31, 2027",
      "availableUntil": "December 31, 2027",
      "releaseStage": "General availability",
      "additionalNotes": "Image version 2.2 becomes the default image version on September, 13, 2024."
    },
    "2.1": {
      "osImages": [
        "2.1-debian11",
        "2.1-ubuntu20",
        "2.1-rocky8"
      ],
      "lastUpdated": "June 30, 2026",
      "releasedOn": "December 12, 2022",
      "supportedUntil": "March 31, 2026",
      "availableUntil": "December 31, 2026",
      "releaseStage": "General availability",
      "additionalNotes": null
    }
  },
  "applications": {
    "Apache Atlas": {
      "3.0": null,
      "2.3": "2.2.0",
      "2.2": "2.2.0",
      "2.1": "2.2.0"
    },
    "Apache Flink": {
      "3.0": "2.2.0",
      "2.3": "1.17.0",
      "2.2": "1.17.0",
      "2.1": "1.15.4"
    },
    "Apache Hadoop": {
      "3.0": "3.5.0",
      "2.3": "3.3.6",
      "2.2": "3.3.6",
      "2.1": "3.3.6"
    },
    "Apache Hive": {
      "3.0": "4.2.0",
      "2.3": "3.1.3",
      "2.2": "3.1.3",
      "2.1": "3.1.3"
    },
    "Apache Hive WebHCat": {
      "3.0": "4.2.0",
      "2.3": "3.1.3",
      "2.2": "3.1.3",
      "2.1": "3.1.3"
    },
    "Apache Hudi": {
      "3.0": null,
      "2.3": "0.15.0",
      "2.2": "0.15.0",
      "2.1": "0.12.3"
    },
    "Apache Iceberg": {
      "3.0": null,
      "2.3": "1.6.1",
      "2.2": "1.6.1",
      "2.1": null
    },
    "Apache Kafka": {
      "3.0": "3.9.2",
      "2.3": "3.1.0",
      "2.2": "3.1.0",
      "2.1": "3.1.0"
    },
    "Apache Pig": {
      "3.0": "0.18.0-SNAPSHOT",
      "2.3": "0.18.0-SNAPSHOT",
      "2.2": "0.18.0-SNAPSHOT",
      "2.1": "0.18.0-SNAPSHOT"
    },
    "Apache Spark": {
      "3.0": "4.1.1",
      "2.3": "3.5.3",
      "2.2": "3.5.3",
      "2.1": "3.3.2"
    },
    "Apache Sqoop": {
      "3.0": null,
      "2.3": "1.5.0-SNAPSHOT",
      "2.2": "1.5.0-SNAPSHOT",
      "2.1": "1.5.0-SNAPSHOT"
    },
    "Apache Tez": {
      "3.0": "0.10.5",
      "2.3": "0.10.2",
      "2.2": "0.10.2",
      "2.1": "0.10.2"
    },
    "BigQuery Connector": {
      "3.0": "0.44.1-Preview",
      "2.3": "0.42.3",
      "2.2": "0.34.1",
      "2.1": "0.27.1"
    },
    "Cloud Storage Connector": {
      "3.0": "3.1.13",
      "2.3": "3.1.13",
      "2.2": "3.0.17",
      "2.1": "hadoop3-2.2.32"
    },
    "Conscrypt": {
      "3.0": "2.6",
      "2.3": "2.5.2",
      "2.2": "2.5.2",
      "2.1": "2.5.2"
    },
    "Delta Lake": {
      "3.0": null,
      "2.3": "3.2.1",
      "2.2": "3.2.1",
      "2.1": null
    },
    "Docker": {
      "3.0": "28.1",
      "2.3": "28.1",
      "2.2": "24.0",
      "2.1": "20.10"
    },
    "Hue": {
      "3.0": null,
      "2.3": "4.11.0",
      "2.2": "4.11.0",
      "2.1": "4.10.0"
    },
    "Java": {
      "3.0": "21",
      "2.3": "11",
      "2.2": "11",
      "2.1": "11"
    },
    "JupyterLab Notebook": {
      "3.0": "4.5.7",
      "2.3": "3.6",
      "2.2": "3.6",
      "2.1": "3.4"
    },
    "Oozie": {
      "3.0": null,
      "2.3": "5.2.1",
      "2.2": "5.2.1",
      "2.1": "5.2.1"
    },
    "Python": {
      "3.0": "Pixi 0.67.1 with Python 3.11",
      "2.3": "micromamba 2.0.5 with Python 3.11",
      "2.2": "conda 23.11.0 with Python 3.11",
      "2.1": "conda 22.9.0 with Python 3.10"
    },
    "R": {
      "3.0": "R 4.5",
      "2.3": "R 4.3",
      "2.2": "R 4.3",
      "2.1": "R 4.1"
    },
    "Ranger": {
      "3.0": null,
      "2.3": "2.4.0",
      "2.2": "2.4.0",
      "2.1": "2.2.0"
    },
    "Scala": {
      "3.0": "2.13.17",
      "2.3": "2.12.18",
      "2.2": "2.12.18",
      "2.1": "2.12.18"
    },
    "Solr": {
      "3.0": "9.10.1",
      "2.3": "9.4.1",
      "2.2": "9.2.1",
      "2.1": "9.0.0"
    },
    "Trino": {
      "3.0": "480",
      "2.3": "432",
      "2.2": "432",
      "2.1": "376"
    },
    "Zeppelin Notebook": {
      "3.0": "0.12.0",
      "2.3": "0.10.1",
      "2.2": "0.10.1",
      "2.1": "0.10.1"
    },
    "Zookeeper": {
      "3.0": "3.9.5",
      "2.3": "3.9.5",
      "2.2": "3.8.3",
      "2.1": "3.8.3"
    }
  },
  "notes": {
    "componentVersionSource": "Application/component versions are taken from the latest sub-minor patch listed on each release's own version-detail page (e.g. image-release-2.3) at fetch time, not from the summary table on the main versioning page. Sub-minor patches within the same release line usually share identical component versions.",
    "osVariants": "Each release ships as three OS variants (Debian, Ubuntu LTS, Rocky Linux) with the same component/date info; only the OS image name suffix differs. See releaseInfo.<release>.osImages for the exact image names.",
    "version30Preview": "Release 3.0 is a Preview release as of this writing; its component versions and dates may still change before general availability."
  }
};
