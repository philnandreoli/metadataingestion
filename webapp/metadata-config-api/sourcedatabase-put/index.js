const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require("../configs/cosmosConfig");
const dbContext = require("../contexts/cosmosDatabaseContext");

//Application Insights Setup
const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context, req) {
  var updateSourceDatabase = context.req.body;
  const lastUpdatedDate = new Date();

  try {
    //create the connection to CosmosDB
    const { endpoint, key, databaseId, containerId } = config;
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container(containerId);
    await dbContext.create(client, databaseId, containerId);

    const { resource: originalSourceDatabase } = await container
      .item(updateSourceDatabase["id"], context.bindingData.sourceDatabaseName)
      .read();

    originalSourceDatabase.description = updateSourceDatabase.description;
    originalSourceDatabase.lastUpdatedBy = "phandreo";
    originalSourceDatabase.lastUpdatedDate = lastUpdatedDate.toISOString();

    const { resource: replaced } = await container
      .item(updateSourceDatabase["id"], context.bindingData.sourceDatabaseName)
      .replace(originalSourceDatabase);

    context.res.status(202).json(context.req.body);
  } catch (error) {
    context.res.status(404);
    context.log.error(
      `PUT /sourcedatabase/${context.bindingData.sourceDatabaseName}  ERROR: `,
      error
    );
  }
};
