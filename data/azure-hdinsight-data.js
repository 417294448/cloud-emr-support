// 本文件由 scripts/build-data.js 自动生成，请勿手动编辑。
// 数据源: azure-hdinsight-application-version-info.json
window.CLOUD_DATA = window.CLOUD_DATA || {};
window.CLOUD_DATA.azure = {
  "standardSupportPolicy": {
    "source": "https://learn.microsoft.com/en-us/azure/hdinsight/hdinsight-component-versioning",
    "note": "HDInsight offers two support tiers. Standard support covers troubleshooting, RCA, performance tuning, Spark core issues/updates, and security/CVE updates. Basic support only covers continued use/creation of clusters on the same version, scaling, and critical security fixes; OSS components are not serviced.",
    "supportTypes": {
      "Standard": "Full support: create clusters, troubleshoot runtime issues, root cause analysis, performance tuning, onboarding assistance, Spark core issues/updates, security/CVE updates.",
      "Basic": "Limited support: use/create clusters on the same version, scale up/down; no runtime troubleshooting, RCA, or OSS component servicing beyond critical security fixes."
    }
  },
  "applicationDescriptions": {
    "Apache Spark": "Apache Spark, a unified analytics engine for large-scale batch processing, streaming, SQL, and machine learning.",
    "Apache Hive": "Apache Hive, a data warehouse system providing SQL-like querying over large datasets stored in HDFS or Azure Data Lake Storage.",
    "Apache Kafka": "Apache Kafka, a distributed event streaming platform for building real-time data pipelines and messaging systems.",
    "Apache Hadoop": "Apache Hadoop, the core distributed storage (HDFS) and resource management (YARN) framework underlying most HDInsight workloads.",
    "Apache Tez": "Apache Tez, a data processing framework that provides a faster execution engine underneath Hive and Pig.",
    "Apache Ranger": "Apache Ranger, a centralized framework for managing data security, authorization, and auditing across the cluster.",
    "Apache HBase": "Apache HBase, a distributed, column-oriented NoSQL database built on HDFS for real-time random read/write access.",
    "Apache Oozie": "Apache Oozie, a workflow scheduler for coordinating and managing Hadoop jobs.",
    "Apache ZooKeeper": "Apache ZooKeeper, a distributed coordination service used for configuration, naming, and synchronization across cluster services.",
    "Apache Livy": "Apache Livy, a REST interface for submitting and managing Spark jobs from remote applications.",
    "Apache Ambari": "Apache Ambari, a web-based platform for provisioning, managing, and monitoring the cluster's Hadoop services.",
    "Apache Zeppelin": "Apache Zeppelin, a web-based notebook for interactive data exploration, visualization, and collaboration.",
    "Apache Phoenix": "Apache Phoenix, a SQL query engine that provides low-latency access to data stored in HBase.",
    "Apache Pig": "Apache Pig, a high-level scripting platform for expressing data transformations as dataflows over Hadoop.",
    "Apache Sqoop": "Apache Sqoop, a tool for transferring bulk data between Hadoop and relational databases."
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
