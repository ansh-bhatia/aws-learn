// AWS services data — one module per category under ./categories/
// To add or expand a topic, edit that category's file; nothing here needs to change.
// Each topic has: id, title, shortDesc, visuals (component names), content (markdown string).

import foundations from "./categories/foundations.js";
import compute from "./categories/compute.js";
import storage from "./categories/storage.js";
import database from "./categories/database.js";
import networking from "./categories/networking.js";
import security from "./categories/security.js";
import monitoring from "./categories/monitoring.js";
import messaging from "./categories/messaging.js";
import devtools from "./categories/devtools.js";
import aiMl from "./categories/ai-ml.js";
import genaiOnAws from "./categories/genai-on-aws.js";
import analytics from "./categories/analytics.js";
import globalInfra from "./categories/global-infra.js";
import projects from "./categories/projects.js";
import migrationBilling from "./categories/migration-billing.js";
import projectsLabs from "./categories/projects-labs.js";

// Sidebar / dashboard order
export const awsCategories = [
  foundations,
  compute,
  storage,
  database,
  networking,
  security,
  monitoring,
  messaging,
  devtools,
  aiMl,
  genaiOnAws,
  analytics,
  globalInfra,
  projects,
  migrationBilling,
  projectsLabs,
];

// Flat lookup map for quick access by topic id
export const topicMap = {};
awsCategories.forEach((cat) => {
  cat.topics.forEach((topic) => {
    topicMap[topic.id] = { ...topic, categoryId: cat.id, categoryLabel: cat.label, categoryColor: cat.color };
  });
});
