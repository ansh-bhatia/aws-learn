// Analytics
export default {
  id: "analytics",
  label: "Analytics",
  icon: "📈",
  color: "#00A1C9",
  topics: [
    {
      id: "athena",
      title: "Athena",
      shortDesc: "Query S3 data with SQL",
      content: `## Athena

**Amazon Athena** is **serverless, interactive SQL queries directly on data in S3** — no servers, no loading. You **pay per query** (per TB scanned).

- Uses **Presto**; works with CSV, JSON, Parquet, ORC. Pair with the **Glue Data Catalog** for table schemas.
- Tip: use **columnar formats (Parquet) + partitioning + compression** to scan less data = cheaper/faster.

> Exam: "**query S3 data with SQL, serverless, ad-hoc, no infrastructure**" → **Athena**. (Heavy/continuous warehousing → Redshift.)`,
    },
    {
      id: "glue",
      title: "AWS Glue",
      shortDesc: "Serverless ETL and data integration",
      content: `## AWS Glue

**AWS Glue** is a serverless **ETL** (extract, transform, load) and data-integration service for preparing data for analytics.

- **Glue Crawlers** auto-discover schemas and populate the **Glue Data Catalog** (central metadata used by Athena, Redshift Spectrum, EMR).
- Run **Spark/Python** ETL jobs serverlessly; no clusters to manage.

> Exam: "**ETL / discover schema / catalog data / prepare data** serverlessly" → **Glue**. The **Data Catalog** is the shared metadata store.`,
    },
    {
      id: "quicksight",
      title: "QuickSight",
      shortDesc: "Business intelligence and data visualization",
      content: `## QuickSight

**Amazon QuickSight** is a serverless **business intelligence (BI)** service — build interactive **dashboards & visualizations** from your data.

- Connects to S3, Athena, Redshift, RDS, Aurora and more; **SPICE** in-memory engine for fast queries.
- **ML Insights** (anomaly detection, forecasting) and **Q** (natural-language questions).

> Exam keyword: "**dashboards / data visualization / BI reports**" → **QuickSight**.`,
    },
    {
      id: "emr",
      title: "EMR – Elastic MapReduce",
      shortDesc: "Big data with Hadoop / Spark",
      content: `## EMR

**Amazon EMR (Elastic MapReduce)** is a managed **big-data platform** for running open-source frameworks — **Apache Spark, Hadoop, Hive, Presto, HBase** — on scalable clusters (EC2, EKS, or **EMR Serverless**).

- For **massive-scale data processing, ML, large ETL** over petabytes.
- Can use **Spot** instances to cut cost; integrates with S3 (data lake).

> Exam: "run **Spark/Hadoop / huge-scale big-data processing**" → **EMR**. (Simple S3 SQL → Athena; managed ETL → Glue.)`,
    },
    {
      id: "opensearch",
      title: "OpenSearch Service",
      shortDesc: "Search and analytics (Elasticsearch fork)",
      content: `## OpenSearch Service

**Amazon OpenSearch Service** (formerly Elasticsearch Service) is managed **search, log analytics & observability**. Store, search, and visualize large volumes of data in near-real-time, with built-in **OpenSearch Dashboards** (Kibana).

- Use cases: **full-text search, log/event analytics, application & infrastructure monitoring, SIEM**.
- Often fed by **Kinesis Data Firehose** or CloudWatch Logs.

> Exam keyword: "**search / analyze logs in near-real-time / dashboards over log data**" → **OpenSearch**.`,
    },
  ],
};
