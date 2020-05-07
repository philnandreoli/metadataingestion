const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require("../configs/cosmosConfig");
const dbContext = require("../contexts/cosmosDatabaseContext");

//Application Insights Setup
const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;

//this will delete not just the source database but also the source objects as well. 
module.exports = async function (context, req) {
  try {
    const id = context.bindingData.id;
    const sourceDatabaseName = context.bindingData.sourceDatabaseName;

    const { endpoint, key, databaseId, containerId } = config;
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container(containerId);
    await dbContext.create(client, databaseId, containerId);

    const { resource: result } = await container
      .item(id, sourceDatabaseName)
      .delete();

    context.res.status(204);
  } catch (error) {
    context.res.status(404);
    context.log.error(`DELETE /sourceobject/${sourceDatabaseName}/${id}  ERROR: `, error);
  }
};
