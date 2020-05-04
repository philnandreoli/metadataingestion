const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require("../configs/cosmosConfig");
const dbContext = require("../contexts/cosmosDatabaseContext");

//Application Insights Setup
const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context, req) {
  const querySpec =
    "SELECT c.id, c.sourceDatabaseName, c.description, c.sourceObjects, c.isActive FROM c";

  try {
    //create the connection to CosmosDB
    const { endpoint, key, databaseId, containerId } = config;
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container(containerId);
    await dbContext.create(client, databaseId, containerId);

    const { resources: items } = await container.items
      .query(querySpec)
      .fetchAll();

    context.res.status(200).json(items);
  } catch (error) {
    context.res = {
      status: 500,
      body: error,
      headers: {
        "Content-Type": "application/json",
      },
    };
    context.log.error("GET /sourcedatabase  ERROR: ", error);
  }
};
