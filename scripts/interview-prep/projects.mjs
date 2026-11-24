// Project pages, in simple English.
//
// Questions are not here. They are all together in Part 3, so there is one
// place to revise from. Each page points at its section there.

export const projects = [
  {
    id: "fitpass",
    bankRef: "Part 3, section 1",
    client: "Fitpass",
    name: "AI Nutrition Analysis",
    oneLine:
      "A chat feature in a fitness app. Users ask questions about their food in normal words, and get answers based on a real nutrition database, not on the AI's memory.",
    problem:
      "Users could record their food, but could not ask questions about it. Questions like 'am I eating enough protein' or 'why am I not losing weight' needed a nutritionist. The company wanted that conversation inside the app. It had to use a checked nutrition database, because a wrong calorie number in a fitness app is a serious problem, not a small bug.",
    stack: "LangChain · LlamaIndex · OpenSearch or pgvector · FastAPI · S3 · Lambda",
    diagram: {
      lanes: [
        { label: "Client", nodes: [{ id: "app", k: "client", t: "Fitpass app", s: "iOS / Android" }] },
        { label: "API", nodes: [
          { id: "api", k: "compute", t: "FastAPI service", s: "ECS Fargate" },
          { id: "auth", k: "ops", t: "Cognito", s: "who is this user" },
        ] },
        { label: "Search", nodes: [
          { id: "idx", k: "ai", t: "LlamaIndex search" },
          { id: "vec", k: "data", t: "Vector store", s: "OpenSearch / pgvector" },
        ] },
        { label: "AI", nodes: [
          { id: "chain", k: "ai", t: "LangChain steps" },
          { id: "llm", k: "ai", t: "AI model", s: "Bedrock / OpenAI" },
        ] },
        { label: "Data", nodes: [
          { id: "s3", k: "data", t: "Nutrition documents", s: "S3, versioned" },
          { id: "logs", k: "data", t: "User food log", s: "RDS Postgres" },
        ] },
      ],
      edges: [
        ["app", "api", "HTTPS"],
        ["api", "auth", "token", { dashed: true }],
        ["api", "idx", "question"],
        ["idx", "vec", "find top 4"],
        ["idx", "chain"],
        ["chain", "llm", "prompt"],
        ["vec", "s3", "built from", { dashed: true }],
        ["chain", "logs", "user's food"],
      ],
      caption: "Two sources of truth: the nutrition documents, and the user's own food log.",
    },
    flow: [
      "The user types a question in the app. The request carries a sign-in token, so the system knows whose food log to read.",
      "The API cleans up the question and reads the user's food log for the last 7 or 30 days from the database.",
      "The question is turned into an embedding, which is a list of numbers that represents its meaning. The system uses this to find the 4 to 6 most relevant pieces of the nutrition documents.",
      "LangChain builds one prompt. It contains the found passages, the user's own numbers, and an instruction saying: only use these facts, do not invent any numbers.",
      "The AI model writes the answer. Every number in it should come from the passages or from the user's log.",
      "The answer goes back with the source passages attached, so the app can show where each number came from.",
    ],
    config: [
      ["Loading the documents", "Nutrition files go into S3 with versioning turned on. When a file is added or changed, that triggers a Lambda. The Lambda splits the document into pieces of around 500 words with a small overlap, creates embeddings, and saves them to the search database together with the S3 version number."],
      ["Where the vectors live", "Either OpenSearch Serverless, or pgvector inside the Postgres database we already run. If the number of documents is small, pgvector is simpler because it is one less system to look after."],
      ["How the search works", "Two searches run together. One by meaning, using embeddings. One by exact words, like a normal keyword search. The results are combined. This is called hybrid search, and it is needed because food names must match exactly."],
      ["The instruction to the AI", "The system prompt says: use only the information provided, and if the information is not there, say you do not know. Do not estimate numbers."],
      ["Safety rules", "A guardrail blocks the model from giving medical advice. Any answer about weight loss or vitamin deficiency gets a fixed disclaimer added."],
      ["Running it", "FastAPI running on ECS Fargate behind a load balancer. Answers are streamed, so the first words appear quickly."],
      ["Logging", "For every answer we log the question, which document pieces were used, how many tokens it cost, and how long it took. Without this you cannot work out later why an answer was wrong."],
    ],
    decisions: [
      ["Why RAG and not fine-tuning?", "Nutrition data changes and has to be checkable. With RAG we update a document and the answer changes immediately, and we can show the source. Fine-tuning puts facts inside the model, where they cannot be updated cheaply or pointed at."],
      ["Why two libraries?", "LlamaIndex for loading and searching documents, LangChain for the steps of the call. Either could do both. We split them for speed of building. With a bigger team I would use one."],
      ["Why hybrid search?", "Searching by meaning alone returned brown rice when the user asked about basmati rice. They are close in meaning but different in nutrition. Keyword search fixes that."],
      ["The biggest risk", "A confident wrong number. That is why every figure must be traceable, and why the test set is mostly numeric questions with known answers."],
    ],
    numbers: [
      "A few thousand documents, so pgvector was a reasonable choice.",
      "4 to 6 passages sent to the model; pieces of about 500 words with a 50-word overlap.",
      "Answers are streamed so the user sees words immediately.",
    ],
  },

  {
    id: "water",
    bankRef: "Part 3, section 2",
    client: "Internal project",
    name: "AI Water Tracking App",
    oneLine:
      "An app for recording water intake, which sends reminders automatically and uses an AI model to explain weekly patterns in plain words.",
    problem:
      "Water tracking apps tell you that you drank 1.2 litres. They do not tell you that you drink much less on the days you train in the evening. The useful part is the pattern, not the number. An AI model is good at describing a pattern once the numbers are already worked out.",
    stack: "FastAPI · LangChain · Streamlit · PostgreSQL · EventBridge · SNS",
    diagram: {
      lanes: [
        { label: "Client", nodes: [
          { id: "ui", k: "client", t: "Streamlit dashboard" },
          { id: "mob", k: "client", t: "Activity source" },
        ] },
        { label: "API", nodes: [{ id: "api", k: "compute", t: "FastAPI", s: "ECS Fargate" }] },
        { label: "Reminders", nodes: [
          { id: "eb", k: "ops", t: "EventBridge rule", s: "runs on a timetable" },
          { id: "fn", k: "compute", t: "Reminder Lambda" },
        ] },
        { label: "Insights", nodes: [{ id: "chain", k: "ai", t: "LangChain" }, { id: "llm", k: "ai", t: "AI model" }] },
        { label: "Data", nodes: [
          { id: "db", k: "data", t: "Water log", s: "RDS Postgres" },
          { id: "sns", k: "ext", t: "SNS", s: "sends the message" },
        ] },
      ],
      edges: [
        ["ui", "api", "read / write"],
        ["mob", "api", "activity"],
        ["api", "db", "save"],
        ["eb", "fn", "every hour"],
        ["fn", "db", "who is behind?"],
        ["fn", "sns", "send reminder"],
        ["api", "chain", "weekly job"],
        ["chain", "llm"],
        ["chain", "db", "summary numbers"],
      ],
      caption: "SQL works out the numbers. The AI only describes them.",
    },
    flow: [
      "The user records water through the API. If they connected a fitness tracker, activity data arrives too.",
      "A scheduled rule in EventBridge runs a Lambda at set times of day.",
      "The Lambda runs one database query: which users are behind their target right now? It sends a reminder to each of them through SNS.",
      "Once a week, the API works out summary numbers in SQL: daily totals, weekly average, and the difference between training days and rest days.",
      "LangChain sends those summary numbers to the AI model and asks for a short explanation and one suggestion.",
      "The explanation is saved in the database. The dashboard reads the saved text and shows it next to the charts.",
    ],
    config: [
      ["Database design", "One table that only gets added to, holding user, time, amount and source. An index on user and time, so queries for one user over a date range are fast. All totals are worked out in SQL, never by pulling rows into Python and adding them up."],
      ["Reminders", "One scheduled rule per time band, not one per user. The Lambda does a single query and sends to everyone who needs it. One rule per user would hit AWS limits and be impossible to debug."],
      ["When insights are made", "Once a week on a schedule, then saved. Not generated when the page loads. Nobody needs a fresh AI call to see last week's pattern, and it would cost money on every page view."],
      ["What goes to the AI", "Only the summary numbers. Sending raw records would cost more, be slower, and make the model do arithmetic, which it is bad at."],
      ["About Streamlit", "Good for an internal dashboard or an early version. For a public product it would be replaced, because it keeps state on the server for each open page and does not spread across servers well."],
    ],
    decisions: [
      ["Why not let the AI add up the totals?", "Because AI models make arithmetic mistakes and SQL does not. The model's job is to describe the pattern, not to produce the number."],
      ["Why generate insights on a schedule?", "Cost and speed. A weekly pattern does not change minute to minute, so making it once and saving it is simply better."],
      ["Why Streamlit at all?", "It gave a working dashboard with charts in days instead of weeks. Say it is a prototype choice before the interviewer points it out."],
    ],
    numbers: [
      "Insights generated once a week and saved, not per page load.",
      "One scheduled rule per time band, with one database query per run.",
    ],
  },

  {
    id: "commudle",
    bankRef: "Part 3, section 3",
    client: "Commudle",
    name: "Automatic Code Analyzer",
    oneLine:
      "A tool that reads the code in a pull request and reports on it: what it does, what could be improved, and where there may be security problems.",
    problem:
      "Code review was slow, and senior developers were spending time on small repeated issues: missing documentation, obvious security mistakes, unused code. That time should go to design questions. The goal was not to replace the reviewer. It was to make sure the reviewer only sees things that need human judgement.",
    stack: "AI model · AST parsing · GitHub webhooks · S3 · Lambda or ECS",
    diagram: {
      lanes: [
        { label: "Trigger", nodes: [
          { id: "pr", k: "ext", t: "Pull request", s: "GitHub webhook" },
          { id: "man", k: "client", t: "Manual run", s: "whole repo" },
        ] },
        { label: "Prepare", nodes: [
          { id: "fetch", k: "compute", t: "Get changed files" },
          { id: "ast", k: "compute", t: "Split by function", s: "using an AST" },
        ] },
        { label: "Analyse", nodes: [
          { id: "exp", k: "ai", t: "Explain pass" },
          { id: "rev", k: "ai", t: "Review pass" },
          { id: "vul", k: "ai", t: "Security pass" },
        ] },
        { label: "Combine", nodes: [
          { id: "agg", k: "ai", t: "Merge and rank" },
          { id: "doc", k: "ai", t: "Write docs" },
        ] },
        { label: "Output", nodes: [
          { id: "cmt", k: "ext", t: "Comments on the PR" },
          { id: "store", k: "data", t: "Saved findings", s: "S3 / database" },
        ] },
      ],
      edges: [
        ["pr", "fetch", "changed files"],
        ["man", "fetch"],
        ["fetch", "ast"],
        ["ast", "exp"], ["ast", "rev"], ["ast", "vul"],
        ["exp", "agg"], ["rev", "agg"], ["vul", "agg"],
        ["agg", "cmt"], ["agg", "store"],
        ["agg", "doc", "", { dashed: true }],
      ],
      caption: "One pass per job. One prompt doing all three jobs did all three badly.",
    },
    flow: [
      "Someone opens a pull request. GitHub sends a webhook. Only the changed files are fetched, not the whole repository.",
      "The files are split at function and class boundaries using an AST, which is a structured view of the code produced by a parser. The imports and the class name are added to each piece so the model has context.",
      "Each piece is sent through three separate passes: explain, review, and security. Each pass has its own prompt and returns JSON.",
      "The findings are combined, duplicates are removed, and they are sorted by how serious they are and how confident the model was.",
      "Findings with high confidence are posted as comments on the exact line in the pull request. Everything else is saved so it can be looked at later.",
    ],
    config: [
      ["What gets looked at", "Only the changed files, by default. Scanning an entire repository is a separate job that someone starts by hand, because the cost grows with the amount of code."],
      ["How code is split", "At function boundaries using an AST, never by character count. Splitting by character count cuts functions in half, and a review of half a function is useless."],
      ["The passes", "One prompt per job. Each returns JSON with fixed fields: file, line, severity, confidence, description. JSON matters because you cannot sort prose by severity."],
      ["Which findings get posted", "Only those above a confidence level. The rest are visible in a dashboard. A tool that posts ten wrong comments gets switched off within a week."],
      ["Security scanning", "The AI pass runs alongside a normal security scanner, not instead of it. A scanner is fast and reliable on known patterns. The AI is better at spotting that a function trusts input it should not."],
      ["No duplicate comments", "Each finding has a key made of file, line and a hash of the finding. If that key already exists on the pull request, the comment is updated instead of a new one being added."],
    ],
    decisions: [
      ["Why separate passes?", "We tried one combined prompt first. The output was shallow on everything: it would mention a variable name and miss a real SQL injection. Separate prompts each doing one job gave much better results, at the cost of more calls."],
      ["Why AST splitting?", "Splitting by size cuts functions in half. Functions are the natural unit a reviewer thinks in."],
      ["Why only post high-confidence findings?", "Developer trust is the whole product. Ten wrong comments and the team mutes the tool, and then the two correct ones are lost as well."],
      ["What it does not do", "It does not block merges. A reviewer can ignore it. An advisory tool that is usually right is more useful than a blocking tool that is sometimes wrong."],
    ],
    numbers: [
      "Changed files only by default; whole-repository scans are manual.",
      "One prompt per job, each returning JSON.",
      "Comments posted only above a confidence threshold.",
    ],
  },

  {
    id: "kosh",
    bankRef: "Part 3, section 4",
    client: "Kosh",
    name: "Creditworthiness Chatbot",
    oneLine:
      "A chatbot that collects loan application details through conversation. Normal SQL rules calculate the score. The AI only collects information and explains the result.",
    problem:
      "People with little credit history are hard to score, and long forms make people give up halfway. A conversation collects the same information with fewer people dropping out. But the scoring itself must be exactly repeatable and explainable, because credit decisions are regulated and an AI-produced score cannot be defended to a regulator.",
    stack: "Amazon Bedrock (Claude, DeepSeek) · Lambda · RDS · Step Functions · KMS",
    diagram: {
      lanes: [
        { label: "Applicant", nodes: [{ id: "u", k: "client", t: "Applicant", s: "web / WhatsApp" }] },
        { label: "Conversation", nodes: [
          { id: "api", k: "compute", t: "Chat API", s: "Lambda + API Gateway" },
          { id: "br", k: "ai", t: "Bedrock", s: "Claude / DeepSeek" },
        ] },
        { label: "Collect", nodes: [
          { id: "ext", k: "ai", t: "Pull out fields", s: "fixed JSON shape" },
          { id: "val", k: "compute", t: "Check the values", s: "normal code" },
        ] },
        { label: "Score", nodes: [
          { id: "sql", k: "data", t: "SQL rules", s: "not the AI" },
          { id: "db", k: "data", t: "Applicant data", s: "encrypted with KMS" },
        ] },
        { label: "Result", nodes: [
          { id: "ins", k: "ai", t: "Explain the score", s: "AI, read only" },
          { id: "aud", k: "ops", t: "Audit log", s: "cannot be changed" },
        ] },
      ],
      edges: [
        ["u", "api", "message"],
        ["api", "br", "turn"],
        ["br", "ext", "fields"],
        ["ext", "val"],
        ["val", "db", "save"],
        ["db", "sql"],
        ["sql", "ins", "score"],
        ["ins", "u", "explanation"],
        ["sql", "aud", "", { dashed: true }],
      ],
      caption: "The AI collects and explains. It never decides. The score comes from SQL.",
    },
    flow: [
      "The applicant sends a message. Bedrock handles the conversation and asks for whatever is still missing.",
      "Each reply goes through an extraction step that pulls out fixed fields: income, existing loans, employment type, length of employment.",
      "Normal code then checks those values. Is the income inside a believable range? Is the format correct? The AI does not decide this.",
      "Checked values are saved in an encrypted database.",
      "SQL rules calculate the score. The rules have a version number.",
      "The score and the reasons behind it are given to the AI, which explains them in plain language.",
      "Everything is written to an audit log that cannot be edited: the inputs, the rule version, and the result.",
    ],
    config: [
      ["Model access", "Bedrock is used in the same region, with access enabled for each specific model. Calls go through a VPC endpoint, so the traffic never touches the public internet."],
      ["Which model for what", "Claude for the conversation and the explanation, where following instructions and writing well matter. DeepSeek considered for pulling out fields, which is a simple repeated job and the obvious place to use a cheaper model."],
      ["Pulling out fields", "The model must return a fixed JSON shape. Anything that does not match is rejected and the question is asked again, rather than being patched up."],
      ["Scoring", "Plain SQL with numbered versions of the rule set. The version used is stored with every decision, so any past decision can be reproduced exactly."],
      ["Protecting the data", "Encrypted using a KMS key we control, not the default one. TLS in transit. Personal data masked before anything is written to a log."],
      ["Audit log", "Append only. Inputs, rule version, score, time. This is what makes the system defensible to a regulator."],
    ],
    decisions: [
      ["Why not let the AI score?", "A credit decision must be repeatable and explainable. SQL rules give the same answer every time and can be shown to a regulator line by line. An AI score changes when the model changes and cannot be defended."],
      ["Why two models?", "Different jobs have different needs. Conversation needs a strong model. Pulling fields out of text is high volume and simple, so it is the obvious place to save money."],
      ["Why Bedrock?", "The data stays inside AWS, it uses the IAM and VPC controls we already have, and it avoids a separate contract and a separate network path for regulated data."],
      ["The risk worth naming", "Prompt injection, where the applicant writes instructions instead of answers. It is handled because the extraction output is treated as data, never as commands, and the scoring layer only reads checked numbers."],
    ],
    numbers: [
      "Bedrock reached through a VPC endpoint; model access enabled per model.",
      "Rule sets have versions, and the version is stored with every decision.",
      "KMS key controlled by us; personal data masked before logging.",
    ],
  },

  {
    id: "edf",
    bankRef: "Part 3, section 5",
    client: "EDF India",
    name: "Operations Analytics Dashboard",
    oneLine:
      "Sensor and operations data copied from servers inside the plant into S3, cleaned with Glue, queried with SQL in Athena, and shown in a dashboard.",
    problem:
      "Operational data sat on the machine vendor's servers inside the plant. It could only be read through the vendor's own software. Nobody could compare machines or compare this month with last month. The job was to get it into a data lake, make it queryable with SQL, and show it, without buying a new platform.",
    stack: "AWS DMS or DataSync · S3 · AWS Glue · Athena · QuickSight · Lake Formation",
    diagram: {
      lanes: [
        { label: "In the plant", nodes: [
          { id: "oem", k: "ext", t: "Vendor servers", s: "sensor + ops data" },
          { id: "dx", k: "ops", t: "Direct Connect / VPN", s: "private link" },
        ] },
        { label: "Land", nodes: [{ id: "raw", k: "data", t: "S3 raw zone", s: "exactly as it arrived" }] },
        { label: "Clean", nodes: [
          { id: "crawl", k: "compute", t: "Glue Crawler", s: "works out the shape" },
          { id: "etl", k: "compute", t: "Glue job", s: "clean and organise" },
        ] },
        { label: "Serve", nodes: [
          { id: "cur", k: "data", t: "S3 curated zone", s: "Parquet, by date" },
          { id: "cat", k: "ops", t: "Glue Data Catalog", s: "table definitions" },
        ] },
        { label: "Use", nodes: [
          { id: "ath", k: "data", t: "Athena", s: "SQL queries" },
          { id: "qs", k: "client", t: "QuickSight", s: "dashboard" },
        ] },
      ],
      edges: [
        ["oem", "dx"],
        ["dx", "raw", "on a schedule"],
        ["raw", "crawl"],
        ["crawl", "cat", "schema"],
        ["raw", "etl"],
        ["etl", "cur", "Parquet"],
        ["cur", "ath"],
        ["cat", "ath", "", { dashed: true }],
        ["ath", "qs"],
      ],
      caption: "The raw zone is never changed, so any mistake in cleaning can simply be run again.",
    },
    flow: [
      "Data is copied from the vendor servers over a private connection on a schedule. This is history, not a live control signal, so a schedule is enough.",
      "It lands in the S3 raw zone exactly as it arrived, and is never modified.",
      "A Glue Crawler looks at the raw files and works out the columns and types, registering them in the Data Catalog.",
      "A Glue job cleans the data, fixes the types, and writes it out as Parquet into a curated zone, organised by date.",
      "Athena runs SQL queries against the curated zone.",
      "QuickSight reads from Athena and shows the dashboard.",
    ],
    config: [
      ["Three areas", "Raw, curated, and a separate place for Athena to write its query results. Athena has to put results somewhere, and leaving them in a shared bucket creates a mess."],
      ["Organising by date", "Partition by date, and by site or machine if queries filter on those. This is the biggest thing you can do to control cost, because Athena charges by how much data each query reads."],
      ["File format", "Parquet with Snappy compression. Storing by column and compressing usually cuts the data read by around ten times compared with raw CSV or JSON."],
      ["Small files", "The Glue job combines small files into larger ones of around 128 MB. Thousands of tiny sensor files make queries slow even when the total data is small."],
      ["Schemas", "Crawl the raw zone on a schedule, because the format may change. Define the curated tables by hand, so a change shows up as a failed job instead of a dashboard quietly going wrong."],
      ["Who can see what", "Lake Formation controls access. Analysts can read curated tables but not the raw zone, with column-level control where anything is sensitive."],
      ["Cost limit", "Set a limit on the Athena workgroup so no single query can read more than a set amount of data. The expensive query is almost always an accident."],
    ],
    decisions: [
      ["Why batch and not streaming?", "The questions were about hours and days. Streaming would have cost more and been more work to run, for freshness nobody needed. If a decision depended on data from seconds ago, the answer would be different."],
      ["Why Athena and not a warehouse?", "Queries were occasional and the data was already in S3. Athena charges per query, which suits that. A warehouse makes sense when queries are constant enough to justify a cluster running all the time."],
      ["Why keep raw unchanged?", "Cleaning code has bugs. If raw is kept, a bad job is one afternoon of reprocessing. If raw was overwritten, the data is gone for good."],
      ["First thing to check on a slow setup", "Partitioning and file sizes. Nearly every slow and expensive Athena setup is one of those two."],
    ],
    numbers: [
      "Parquet with Snappy; partitioned by date and site.",
      "Files combined to around 128 MB each.",
      "A data-scanned limit set on the Athena workgroup.",
    ],
  },

  {
    id: "airworks-kb",
    bankRef: "Part 3, section 6",
    client: "Airworks",
    name: "Internal Knowledge Chatbot",
    oneLine:
      "A chatbot that answers employee questions from internal documents, and shows which document each answer came from.",
    problem:
      "The same questions reached a small internal team every week: policy, process, how do I do this. The documents existed but nobody could find them, because keyword search needs you to use the same words as the document.",
    stack: "Bedrock Knowledge Bases or LangChain + OpenSearch · S3 · Cognito · Lambda",
    diagram: {
      lanes: [
        { label: "Employee", nodes: [{ id: "emp", k: "client", t: "Employee", s: "Slack or web" }] },
        { label: "Sign-in", nodes: [
          { id: "auth", k: "ops", t: "SSO", s: "identity + groups" },
          { id: "api", k: "compute", t: "Chat API", s: "Lambda" },
        ] },
        { label: "Search", nodes: [
          { id: "kb", k: "ai", t: "Knowledge Base", s: "managed RAG" },
          { id: "vec", k: "data", t: "Vector index", s: "OpenSearch" },
        ] },
        { label: "Answer", nodes: [{ id: "llm", k: "ai", t: "Bedrock model" }] },
        { label: "Documents", nodes: [
          { id: "s3", k: "data", t: "Documents in S3", s: "tagged by department" },
          { id: "sync", k: "ops", t: "Update job", s: "scheduled" },
        ] },
      ],
      edges: [
        ["emp", "auth"],
        ["auth", "api", "groups"],
        ["api", "kb", "question + filter"],
        ["kb", "vec"],
        ["kb", "llm"],
        ["llm", "emp", "answer + source"],
        ["s3", "sync"],
        ["sync", "vec", "update index"],
      ],
      caption: "The person's groups become a filter on the search, so restricted documents are never fetched.",
    },
    flow: [
      "The employee asks a question in Slack or a web page. Single sign-on tells us who they are and which groups they belong to.",
      "The API turns those groups into a filter on the search. HR documents can only be found by people in the HR group.",
      "The search returns the most relevant passages from the allowed documents.",
      "The AI model answers using only those passages, and returns the document name and section.",
      "A scheduled job re-reads changed documents and updates the index, so answers stay current.",
    ],
    config: [
      ["Where documents live", "In S3, organised by department, with the department stored as metadata on each object. That metadata is what makes filtered search possible later."],
      ["Access control", "The filter is applied during the search, before the model sees anything. Filtering the answer afterwards is not access control, because the model has already read the content."],
      ["Keeping it current", "A scheduled job, plus an event-driven path for urgent updates. Out-of-date answers are the main way these tools lose trust."],
      ["Showing sources", "Every answer returns the document name and section. Without that, a wrong answer looks exactly like a right one."],
      ["When it is unsure", "If the search does not find anything good enough, the bot says it does not know and points to the team that owns the topic."],
      ["Feedback", "A thumbs up and thumbs down on each answer, saved together with which passages were used, so badly performing documents can be found."],
    ],
    decisions: [
      ["Why filter during search and not after?", "Because after means the model has already read the restricted content and could repeat it in different words. Access control has to happen before retrieval."],
      ["Why a managed service?", "For an internal tool, splitting, embedding and syncing are the same work everyone does and add no value. Build it yourself only when you need retrieval to behave in a special way."],
      ["Why saying 'I do not know' matters", "A confident wrong answer about leave policy creates a real HR problem. Declining is the safe default and keeps people trusting the tool."],
    ],
    numbers: [
      "Search filtered by group before the model is called.",
      "Document name and section returned with every answer.",
      "Scheduled updates plus an event-driven path for urgent changes.",
    ],
  },

  {
    id: "airworks-cost",
    bankRef: "Part 3, section 7",
    client: "Airworks",
    name: "Cutting AWS Cost by 30%",
    oneLine:
      "Found that containers were pulling images and files through a NAT Gateway and paying per GB for it. Added VPC endpoints, right-sized containers, and cut the bill by about 30%.",
    problem:
      "The bill was growing faster than usage and nobody could explain why. Everyone assumed the container platform was the cause. It turned out to be the network: traffic that never needed to leave AWS was being charged per GB as it passed through the NAT Gateway.",
    stack: "Cost Explorer · Cost and Usage Report + Athena · VPC Flow Logs · Compute Optimizer",
    diagram: {
      lanes: [
        { label: "Cost data", nodes: [
          { id: "cur", k: "data", t: "Cost & Usage Report", s: "detailed lines, in S3" },
          { id: "ce", k: "ops", t: "Cost Explorer", s: "first look" },
        ] },
        { label: "Network data", nodes: [{ id: "fl", k: "data", t: "VPC Flow Logs", s: "who talks to whom" }] },
        { label: "Analysis", nodes: [
          { id: "ath", k: "compute", t: "Athena queries", s: "on the billing data" },
          { id: "ins", k: "compute", t: "Logs Insights", s: "top destinations" },
        ] },
        { label: "Finding", nodes: [
          { id: "nat", k: "ext", t: "NAT used for AWS traffic", s: "S3 and ECR" },
          { id: "rs", k: "ops", t: "Oversized containers", s: "Compute Optimizer" },
        ] },
        { label: "Fix", nodes: [
          { id: "vpce", k: "compute", t: "VPC endpoints", s: "S3 + ECR + logs" },
          { id: "tag", k: "ops", t: "Tags and budgets", s: "stop it returning" },
        ] },
      ],
      edges: [
        ["ce", "ath", "where?"],
        ["cur", "ath"],
        ["fl", "ins"],
        ["ins", "nat", "destinations"],
        ["ath", "nat"],
        ["ath", "rs"],
        ["nat", "vpce", "endpoints"],
        ["rs", "tag"],
      ],
      caption: "The bill says where the money goes. The flow logs say why. You need both.",
    },
    flow: [
      "Start in Cost Explorer to see which services and accounts are growing. This narrows the search but does not explain anything.",
      "Query the Cost and Usage Report in Athena for the detailed lines. NAT Gateway data processing stood out, and it was the per-GB charge rather than the hourly one.",
      "Query VPC Flow Logs to see where that NAT traffic was going, grouped by destination and sorted by bytes.",
      "The pattern appears: containers in private subnets were pulling images from ECR and reading and writing S3, all through the NAT Gateway.",
      "Fix it by adding a gateway endpoint for S3, which is free, and interface endpoints for ECR API, ECR Docker and CloudWatch Logs.",
      "Separately, compare the CPU and memory containers asked for against what they actually used, and reduce the oversized ones.",
      "Make tagging compulsory, set per-team budgets, and turn on anomaly detection, so the saving does not disappear again.",
    ],
    config: [
      ["S3 gateway endpoint", "Free, and it is only an entry in the route table. There is almost no reason for a VPC with private subnets using S3 not to have one."],
      ["ECR interface endpoints", "You need both ecr.api and ecr.dkr, plus the S3 gateway endpoint, because the actual image layers are stored in S3. Adding only the ECR endpoints leaves most of the data still going through NAT."],
      ["CloudWatch Logs endpoint", "Containers log continuously. At volume this is a meaningful share of the NAT traffic."],
      ["Right-sizing", "Compare what each container asked for with what it actually used. Most task definitions are copied from another one and never checked."],
      ["Fargate Spot", "For work that can be interrupted and retried, such as batch jobs, this is a straightforward saving. Not for anything that must not be interrupted."],
      ["Keeping it fixed", "Tags required by policy, a budget with an alert for each team, and Cost Anomaly Detection so the next problem is caught in days rather than at the end of the quarter."],
    ],
    decisions: [
      ["Why look at flow logs and not just the bill?", "The bill said NAT was expensive. It could not say what was crossing it. The flow logs named the destinations, and that turned a number into a fix."],
      ["Why endpoints and not public subnets?", "Public subnets would also avoid NAT charges, and would put the containers on the internet. Endpoints keep them private and still remove the cost."],
      ["Why tagging matters most", "The technical fix took a day. Keeping spend attributable to a team is what stops it coming back, and that is a habit rather than a setting."],
      ["How to present this", "Lead with the cause, then the number. If you say 30% first, the interviewer immediately asks what the baseline was. If you explain the NAT mechanism first, they believe the 30%."],
    ],
    numbers: [
      "About 30% off the total AWS bill; the NAT fix was the largest single part.",
      "S3 gateway endpoint has no hourly charge. ECR needs api, dkr and the S3 endpoint.",
      "Right-sizing using Compute Optimizer; Fargate Spot for work that can be interrupted.",
    ],
  },

  {
    id: "wecredit",
    bankRef: "Part 3, section 8",
    client: "WeCredit",
    name: "Azure to AWS Migration",
    oneLine:
      "Led a move from Azure to AWS, including the planning across business and technical teams, data validation in SQL, and reports comparing before and after.",
    problem:
      "Moving between clouds is not only a technical decision. It is also commercial and organisational. The technical risk that mattered most was data integrity: a migration that quietly loses or duplicates rows is worse than one that fails loudly.",
    stack: "AWS DMS · SCT · DataSync · S3 · RDS · Route 53 · CloudWatch · QuickSight",
    diagram: {
      lanes: [
        { label: "Azure", nodes: [
          { id: "azsql", k: "ext", t: "Azure SQL / VMs" },
          { id: "azblob", k: "ext", t: "Blob storage", s: "files" },
        ] },
        { label: "Move", nodes: [
          { id: "dms", k: "compute", t: "AWS DMS", s: "full load + CDC" },
          { id: "ds", k: "compute", t: "DataSync", s: "files" },
        ] },
        { label: "AWS", nodes: [
          { id: "rds", k: "data", t: "Amazon RDS" },
          { id: "s3", k: "data", t: "Amazon S3" },
        ] },
        { label: "Check", nodes: [
          { id: "val", k: "ops", t: "SQL checks", s: "counts + totals" },
          { id: "bi", k: "client", t: "Business reports", s: "before vs after" },
        ] },
        { label: "Switch over", nodes: [
          { id: "r53", k: "ops", t: "Route 53", s: "shift traffic slowly" },
          { id: "back", k: "ops", t: "Rollback ready", s: "CDC still running" },
        ] },
      ],
      edges: [
        ["azsql", "dms"],
        ["azblob", "ds"],
        ["dms", "rds"],
        ["ds", "s3"],
        ["rds", "val"],
        ["s3", "val"],
        ["val", "bi"],
        ["val", "r53", "only when clean"],
        ["r53", "back", "", { dashed: true }],
      ],
      caption: "CDC keeps running during the switch, which is what makes going back possible.",
    },
    flow: [
      "Discovery first: list every system, map what talks to what, and agree how long each one can be offline.",
      "Convert the database schema where the engines differ, using SCT, and review by hand anything the tool flags.",
      "Run a DMS full load to copy the existing data, then leave CDC running so new changes keep flowing while the old system is still live.",
      "Move files separately with DataSync.",
      "Validate: row counts, totals of important numeric columns, and full reconciliation on financial tables.",
      "Build reports that compute the same business numbers on both systems for the same period, so the business signs off on numbers it recognises.",
      "Switch over by shifting DNS weights gradually, with CDC still running so rollback stays possible.",
      "Decommission the old system only after an agreed settling period.",
    ],
    config: [
      ["DMS", "Size the replication instance for the rate of change, not the size of the database. Run full load plus CDC. Turn on DMS validation so it compares rows itself."],
      ["Schema", "Use SCT to convert, then review everything it flags by hand. The automatic conversion is a starting point, not a finished result."],
      ["Validation queries", "Row counts per table. Sums of key numeric columns. Earliest and latest timestamps. Full row-by-row comparison on financial tables."],
      ["Network", "Private connectivity between the two clouds for the transfer. Never move production data over the public internet."],
      ["Switching over", "Shift a small share of traffic first using DNS weights. Lower the TTL days in advance, because a 24-hour TTL makes rollback slow exactly when you need it to be fast."],
      ["Rollback", "Write it down, agree the trigger in advance, and test it before the real cutover. A rollback plan you have never run is a document, not a plan."],
    ],
    decisions: [
      ["Why CDC and not one big copy?", "A single copy needs a downtime window as long as the copy takes. CDC lets the bulk happen while the old system serves customers, so the window becomes minutes."],
      ["Why business reports and not just row counts?", "Row counts prove the data arrived. They do not prove the business sees the same answer. Finance comparing the same revenue figure on both systems is what ends the discussion."],
      ["Why lower the TTL early?", "DNS answers are cached. If the cached value still says 24 hours at cutover, you cannot reverse quickly."],
      ["The part people underestimate", "Coordinating people. The technical work is manageable. Agreeing an acceptable downtime window with a business that does not want to stop is the harder half."],
    ],
    numbers: [
      "DMS full load plus CDC, with DMS validation turned on.",
      "DNS TTL lowered several days before cutover.",
      "A settling period before switching the old system off.",
    ],
  },

  {
    id: "competency",
    bankRef: "Part 3, section 9",
    client: "Partner organisation",
    name: "AWS SMB and Education Competencies",
    oneLine:
      "Coordinated the evidence, documentation and sign-offs needed for the company to be granted two AWS Partner competencies.",
    problem:
      "A competency is an audit. AWS asks for evidence: written customer outcomes, architectures that meet published criteria, customers willing to be named, and a number of staff with current certifications. The work is gathering proof across teams who did the work but never wrote it down.",
    stack: "AWS Partner Central · Well-Architected Reviews · case study documentation",
    diagram: {
      lanes: [
        { label: "What we have", nodes: [
          { id: "proj", k: "data", t: "Delivered projects", s: "the evidence" },
          { id: "cert", k: "ops", t: "Staff certifications" },
        ] },
        { label: "Prepare", nodes: [
          { id: "cs", k: "compute", t: "Case studies", s: "AWS template" },
          { id: "war", k: "compute", t: "Well-Architected Reviews" },
        ] },
        { label: "Approve", nodes: [
          { id: "int", k: "ops", t: "Internal review", s: "find the gaps" },
          { id: "cust", k: "ext", t: "Customer sign-off", s: "slowest step" },
        ] },
        { label: "Submit", nodes: [{ id: "pc", k: "ext", t: "Partner Central" }] },
        { label: "Audit", nodes: [
          { id: "aud", k: "ext", t: "AWS reviews it", s: "asks questions" },
          { id: "comp", k: "ops", t: "Competency granted" },
        ] },
      ],
      edges: [
        ["proj", "cs"],
        ["proj", "war"],
        ["cert", "pc", "", { dashed: true }],
        ["cs", "int"],
        ["war", "int"],
        ["int", "cust", "permission"],
        ["cust", "pc"],
        ["pc", "aud"],
        ["aud", "comp"],
      ],
      caption: "Customer sign-off is the slowest step, because it depends on people outside the company.",
    },
    flow: [
      "Read the published criteria first, and compare them against projects already delivered. This produces the gap list that drives everything else.",
      "Choose projects that actually meet the criteria, not the ones that sound most impressive.",
      "Write the case studies in the format AWS asks for: problem, architecture, outcome, and a measurable result.",
      "Run Well-Architected Reviews where the criteria require them, and fix what they find.",
      "Get customer permission to be named as a reference. This usually takes longest, because it goes through their marketing and legal teams.",
      "Check the number of certified staff, and that nobody's certification has expired.",
      "Submit through Partner Central, then answer the technical questions AWS sends back.",
    ],
    config: [
      ["Gap list", "A table of each requirement against the evidence, with an owner and a date. These submissions fail on coordination, not difficulty."],
      ["Case studies", "Each one needs a number. 'Improved performance' fails. 'Query time went from 40 seconds to 3 seconds' passes."],
      ["Certifications", "Track the expiry dates, not just the count. A submission can fail because somebody's certification lapsed last month."],
      ["Customer references", "Start these conversations first, because they are outside your control and set the overall timeline."],
      ["The audit", "Expect follow-up questions, and keep the engineers who did the work available to answer them."],
    ],
    decisions: [
      ["Why this belongs on a technical CV", "It shows something different from building: taking something to an external standard, across teams that do not report to you, to a deadline."],
      ["How to describe it without overclaiming", "Be exact about your role. Coordinating, documenting and aligning is real work. Do not let it sound like you personally built every project in the submission."],
    ],
    numbers: [
      "Two competencies: SMB and Education.",
      "Every case study needs a measurable result.",
      "Customer reference approval is the slowest step.",
    ],
  },
];
