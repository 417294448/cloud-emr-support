// 本文件由 scripts/build-data.js 自动生成，请勿手动编辑。
// 数据源: gcp-dataproc-application-version-info.json
window.CLOUD_DATA = window.CLOUD_DATA || {};
window.CLOUD_DATA.gcp = {
  "dataAsOf": "2026-09-03",
  "standardSupportPolicy": {
    "source": "https://docs.cloud.google.com/managed-spark/docs/concepts/versioning/image-version-lists",
    "note": {
      "en": "Managed Service for Apache Spark (formerly Dataproc) publishes per-image-version \"Supported until\" and \"Available until\" dates rather than separate Standard/Basic support tiers. After the supported-until date the image version is no longer recommended for new clusters; after the available-until date it can no longer be selected at all.",
      "zh": "Managed Service for Apache Spark（前身为 Dataproc）按镜像版本发布 \"Supported until\" 与 \"Available until\" 日期，而非单独的 Standard/Basic 支持层级。超过 supported-until 日期后，该镜像版本不再推荐用于新建集群；超过 available-until 日期后，则完全无法选择。"
    }
  },
  "applicationDescriptions": {},
  "releases": [
    "3.0",
    "2.3",
    "2.2",
    "2.1",
    "2.0",
    "1.5",
    "1.4",
    "1.3",
    "1.2",
    "1.1",
    "1.0",
    "0.2",
    "0.1"
  ],
  "releaseInfo": {
    "3.0": {
      "osImages": "3.0-debian13",
      "lastUpdated": "August 19, 2026",
      "releasedOn": "July 15, 2026",
      "supportedUntil": "July 15, 2028",
      "availableUntil": "July 15, 2030",
      "releaseStage": "General availability release.",
      "additionalNotes": "General availability release."
    },
    "2.3": {
      "osImages": "2.3-debian12",
      "lastUpdated": "August 19, 2026",
      "releasedOn": "June 9, 2025",
      "supportedUntil": "June 9, 2027",
      "availableUntil": "June 9, 2029",
      "releaseStage": "General availability release.",
      "additionalNotes": "General availability release."
    },
    "2.2": {
      "osImages": "2.2-debian12",
      "lastUpdated": "August 19, 2026",
      "releasedOn": "December 8, 2023",
      "supportedUntil": "March 31, 2027",
      "availableUntil": "December 31, 2027",
      "releaseStage": "General availability release. Image version 2.2 becomes the default image version on September, 13, 2024.",
      "additionalNotes": "General availability release. Image version 2.2 becomes the default image version on September, 13, 2024."
    },
    "2.1": {
      "osImages": "2.1-debian11",
      "lastUpdated": "August 19, 2026",
      "releasedOn": "December 12, 2022",
      "supportedUntil": "March 31, 2026",
      "availableUntil": "December 31, 2026",
      "releaseStage": "General availability release.",
      "additionalNotes": "General availability release."
    },
    "2.0": {
      "osImages": "2.0-debian10/-ubuntu18/-rocky8",
      "lastUpdated": "",
      "releasedOn": "",
      "supportedUntil": "",
      "availableUntil": "August 25, 2026",
      "releaseStage": "Unsupported as of 2026/02/24.2.0.160-debian10/-ubuntu18/-rocky8 was the final released version.",
      "additionalNotes": "Unsupported as of 2026/02/24.2.0.160-debian10/-ubuntu18/-rocky8 was the final released version."
    },
    "1.5": {
      "osImages": "1.5-debian10/-ubuntu18/-rocky8",
      "lastUpdated": "",
      "releasedOn": "",
      "supportedUntil": "",
      "availableUntil": "August 25, 2026",
      "releaseStage": "Unsupported as of 2023/04/28.1.5.89-debian10/-ubuntu18/-rocky8 was the final released version.",
      "additionalNotes": "Unsupported as of 2023/04/28.1.5.89-debian10/-ubuntu18/-rocky8 was the final released version."
    },
    "1.4": {
      "osImages": "1.4-debian10/-ubuntu18",
      "lastUpdated": "",
      "releasedOn": "",
      "supportedUntil": "",
      "availableUntil": "August 25, 2026",
      "releaseStage": "Unsupported as of 2022/02/01.1.4.80-debian10/-ubuntu18 was the final released version.",
      "additionalNotes": "Unsupported as of 2022/02/01.1.4.80-debian10/-ubuntu18 was the final released version."
    },
    "1.3": {
      "osImages": "1.3-debian10/-ubuntu18",
      "lastUpdated": "",
      "releasedOn": "",
      "supportedUntil": "",
      "availableUntil": "August 25, 2026",
      "releaseStage": "Unsupported as of 2021/08/01.1.3.95-debian10/-ubuntu18 was the final released version, which has log4j2 vulnerabilities addressed. Note: previously released versions are vulnerable and must be upgraded.",
      "additionalNotes": "Unsupported as of 2021/08/01.1.3.95-debian10/-ubuntu18 was the final released version, which has log4j2 vulnerabilities addressed. Note: previously released versions are vulnerable and must be upgraded."
    },
    "1.2": {
      "osImages": "1.2-debian9",
      "lastUpdated": "",
      "releasedOn": "",
      "supportedUntil": "",
      "availableUntil": "Unavailable",
      "releaseStage": "Unsupported as of 2020/07/10.1.2.102-debian9 was the final released version.",
      "additionalNotes": "Unsupported as of 2020/07/10.1.2.102-debian9 was the final released version."
    },
    "1.1": {
      "osImages": "1.1-debian9",
      "lastUpdated": "",
      "releasedOn": "",
      "supportedUntil": "",
      "availableUntil": "Unavailable",
      "releaseStage": "Unsupported as of 2019/10/01.1.1.121-debian9 is the final released version.",
      "additionalNotes": "Unsupported as of 2019/10/01.1.1.121-debian9 is the final released version."
    },
    "1.0": {
      "osImages": "1.0-debian9",
      "lastUpdated": "",
      "releasedOn": "",
      "supportedUntil": "",
      "availableUntil": "Unavailable",
      "releaseStage": "GA image first release.Unsupported as of 2019/04/01.1.0.119-debian9 was the final released version.",
      "additionalNotes": "GA image first release.Unsupported as of 2019/04/01.1.0.119-debian9 was the final released version."
    },
    "0.2": {
      "osImages": "0.2",
      "lastUpdated": "",
      "releasedOn": "",
      "supportedUntil": "",
      "availableUntil": "Unavailable",
      "releaseStage": "Beta image second release.",
      "additionalNotes": "Beta image second release."
    },
    "0.1": {
      "osImages": "0.1",
      "lastUpdated": "",
      "releasedOn": "",
      "supportedUntil": "",
      "availableUntil": "Unavailable",
      "releaseStage": "Managed Service for Apache Spark beta release. Spark 1.5 has been compiled against Hive 1.2.",
      "additionalNotes": "Managed Service for Apache Spark beta release. Spark 1.5 has been compiled against Hive 1.2."
    }
  },
  "applications": {
    "Apache Atlas": {
      "2.3": "2.2.0",
      "2.2": "2.2.0",
      "2.1": "2.2.0"
    },
    "Apache Flink": {
      "2.3": "1.17.0",
      "2.2": "1.17.0",
      "2.1": "1.15.4",
      "3.0": "2.2.0"
    },
    "Apache Hadoopinstalled": {
      "2.3": "3.3.6",
      "2.2": "3.3.6",
      "2.1": "3.3.6",
      "3.0": "3.5.0"
    },
    "Apache Hiveinstalled": {
      "2.3": "3.1.3",
      "2.2": "3.1.3",
      "2.1": "3.1.3",
      "3.0": "4.2.0"
    },
    "Apache Hive WebHCat": {
      "2.3": "3.1.3",
      "2.2": "3.1.3",
      "2.1": "3.1.3",
      "3.0": "4.2.0"
    },
    "Apache Hudi": {
      "2.3": "0.15.0",
      "2.2": "0.15.0",
      "2.1": "0.12.3"
    },
    "Apache Iceberg": {
      "2.3": "1.6.1",
      "2.2": "1.6.1",
      "3.0": "1.11.0"
    },
    "Apache Kafka": {
      "2.3": "3.1.0",
      "2.2": "3.1.0",
      "2.1": "3.1.0",
      "3.0": "3.9.2"
    },
    "Apache Pig": {
      "2.3": "0.18.0-SNAPSHOT",
      "3.0": "0.18.0"
    },
    "Apache Sparkinstalled": {
      "2.3": "3.5.3",
      "2.2": "3.5.3",
      "2.1": "3.3.2",
      "3.0": "4.1.2"
    },
    "Apache Sqoop": {
      "2.3": "1.5.0-SNAPSHOT",
      "2.2": "1.5.0-SNAPSHOT",
      "2.1": "1.5.0-SNAPSHOT"
    },
    "Apache Tezinstalled": {
      "2.3": "0.10.2",
      "2.2": "0.10.2",
      "2.1": "0.10.2",
      "3.0": "0.10.5"
    },
    "BigQuery Connectorinstalled": {
      "2.3": "0.42.3",
      "2.2": "0.34.1",
      "2.1": "0.27.1",
      "3.0": "0.44.1-Preview"
    },
    "Cloud Storage Connectorinstalled": {
      "2.3": "3.1.13",
      "2.2": "3.0.17",
      "2.1": "hadoop3-2.2.32",
      "3.0": "3.1.13"
    },
    "Conscryptinstalled": {
      "2.3": "2.5.2",
      "2.2": "2.5.2",
      "2.1": "2.5.2",
      "3.0": "2.6"
    },
    "Delta Lake": {
      "2.3": "3.2.1",
      "2.2": "3.2.1",
      "3.0": "4.2.0"
    },
    "Docker": {
      "2.3": "28.1",
      "2.2": "24.0",
      "2.1": "20.10",
      "3.0": "28.1"
    },
    "Hue": {
      "2.3": "4.11.0",
      "2.2": "4.11.0",
      "2.1": "4.10.0"
    },
    "Javainstalled": {
      "2.3": "11",
      "2.2": "11",
      "2.1": "11",
      "3.0": "21"
    },
    "JupyterLab Notebook": {
      "2.3": "3.6",
      "2.2": "3.6",
      "2.1": "3.4",
      "3.0": "4.5.7"
    },
    "Oozie": {
      "2.3": "5.2.1",
      "2.2": "5.2.1",
      "2.1": "5.2.1"
    },
    "Pythoninstalled": {
      "2.3": "micromamba 2.0.5 with Python 3.11",
      "2.2": "conda 23.11.0 with Python 3.11",
      "2.1": "conda 22.9.0 with Python 3.10",
      "3.0": "Pixi 0.67.1 with Python 3.12"
    },
    "Rinstalled": {
      "2.3": "R 4.3",
      "2.2": "R 4.3",
      "2.1": "R 4.1",
      "3.0": "R 4.5"
    },
    "Ranger": {
      "2.3": "2.4.0",
      "2.2": "2.4.0",
      "2.1": "2.2.0"
    },
    "Scalainstalled": {
      "2.3": "2.12.18",
      "2.2": "2.12.18",
      "2.1": "2.12.18",
      "3.0": "2.13.17"
    },
    "Solr": {
      "2.3": "9.4.1",
      "2.2": "9.2.1",
      "2.1": "9.0.0"
    },
    "Trino": {
      "2.3": "432",
      "2.2": "432",
      "2.1": "376",
      "3.0": "480"
    },
    "Zeppelin Notebook": {
      "2.3": "0.10.1",
      "2.2": "0.10.1",
      "2.1": "0.10.1"
    },
    "Zookeeper": {
      "2.3": "3.9.5",
      "2.2": "3.8.3",
      "2.1": "3.8.3"
    },
    "Apache Piginstalled": {
      "2.2": "0.18.0-SNAPSHOT",
      "2.1": "0.18.0-SNAPSHOT"
    },
    "Apache Ranger": {
      "3.0": "2.8.0"
    },
    "Apache Solr": {
      "3.0": "9.10.1"
    },
    "Apache Zeppelin Notebook": {
      "3.0": "0.12.0"
    },
    "Apache Zookeeper": {
      "3.0": "3.9.5"
    }
  }
};
