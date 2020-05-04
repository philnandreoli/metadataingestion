const cosmosConfig = require("../configs/cosmosConfig");
const CosmosClient = require("@azure/cosmos").CosmosClient;

async function create(client, databaseId, containerId) {
  const partitionKey = cosmosConfig.partitionKey;

  const { database } = await client.databases.createIfNotExists({
    id: databaseId,
  });


  const { container } = await client
    .database(databaseId)
    .containers.createIfNotExists(
      { id: containerId, partitionKey },
      { offerThroughput: 400 }
    );

}

module.exports = { create };
