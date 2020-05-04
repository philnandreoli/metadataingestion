// @ts-check
const env = require("dotenv").config();

const cosmosConfig = {
  endpoint: process.env.COSMOS_URI,
  key: process.env.COSMOS_KEY,
  databaseId: process.env.COSMOS_DB,
  containerId: process.env.COSMOS_CONTAINER,
  partitionKey: { kind: "Hash", paths: ["/sourceDatabaseName"] },
};

module.exports = cosmosConfig;
