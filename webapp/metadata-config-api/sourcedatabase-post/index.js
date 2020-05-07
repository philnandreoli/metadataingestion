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

      sourceDatabase = req.body;

      //Check to see if the user supplied the description element to the post, if they did not then add the empty property to the JSON
      if (!sourceDatabase["description"]) {
        sourceDatabase["description"] = "";
      }

      //Add a type because SourceDatabase and SourceObject will be stored in the same partition key
      sourceDatabase["type"] = "SourceDatabase";
      //Add the change tracking to the object to understand who is making changes
      sourceDatabase["createdBy"] = "phandreo";
      sourceDatabase["createdDate"] = createDate.toISOString();
      sourceDatabase["lastUpdatedBy"] = "phandreo";
      sourceDatabase["lastUpdatedDate"] = createDate.toISOString();

      //create the connection to CosmosDB
      const { endpoint, key, databaseId, containerId } = config;
      const client = new CosmosClient({ endpoint, key });
      const database = client.database(databaseId);
      const container = database.container(containerId);
      await dbContext.create(client, databaseId, containerId);

      //create the new source database object in the container
      const { resource: createdItem } = await container.items.create(
        sourceDatabase
      );

      //return the source database objects without the change tracking information
      context.res = {
        status: 200,
        body: {
          id: sourceDatabase["id"],
          sourceDatabaseName: sourceDatabase["sourceDatabaseName"],
          description: sourceDatabase["description"],
        },
        headers: {
          "Content-Type": "application/json",
        },
      };
    } catch (error) {
      context.res = {
        status: 500,
        body: error,
        headers: {
          "Content-Type": "application/json",
        },
      };
      context.log.error(
        `GET /sourcedatabase/${context.bindingData.sourceDatabaseName}  ERROR: `,
        error
      );
    }
  }
};
