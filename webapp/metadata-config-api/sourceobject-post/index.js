//Cosmos DB Connection Configuration
const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require("../configs/cosmosConfig");
const dbContext = require("../contexts/cosmosDatabaseContext");

//Application Insights Setup
const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context, req) {
  //Only accept content-type of application/json and the only attribute should be sourceDatabaseName
  if (req.headers["content-type"] == "application/json" && req.body) {
    //create a variable for the date and time of when the record was inserted
    const createDate = new Date();
    try {
        
      sourceObject = req.body;

      sourceObject.sourceDatabaseName = context.bindingData.sourceDatabaseName;
      if (!sourceObject.description) {
          sourceObject.description = "";
      }
      if (!sourceObject.delimiterConfiguration) {
          sourceObject.delimiterConfiguration = {}
      }
      sourceObject.type = "SourceObject";
      sourceObject.createdBy = "phandreo";
      sourceObject.createdDate = createDate.toISOString();
      sourceObject.lastUpdatedBy = "phandreo";

      //create the connection to CosmosDB
      const { endpoint, key, databaseId, containerId } = config;
      const client = new CosmosClient({ endpoint, key });
      const database = client.database(databaseId);
      const container = database.container(containerId);
      await dbContext.create(client, databaseId, containerId);

      //create the new sourceobject document in the container
      const { resource: createdItem } = await container.items.create(
        sourceObject
      );

      //return the source database objects without the change tracking information
      context.res
        .status(200)
        .json({
            id: sourceObject.id,
            sourceDatabaseName: sourceObject.sourceDatabaseName,
            description: sourceObject.description,
            sourceObjectName: sourceObject.sourceObjectName,
            loadType: sourceObject.loadType,
            fileType: sourceObject.fileType,
            columnCount: sourceObject.columnCount,
            rawZone: sourceObject.rawZone,
            delimiterConfiguration: sourceObject.delimiterConfiguration
        });
    } catch (error) {
      context
        .res
        .status(500)
        .json({error});
      context.log.error(
        `GET /sourceobject/${context.bindingData.sourceDatabaseName}  ERROR: `,
        error
      );
    }

    context.done()
  }
};
