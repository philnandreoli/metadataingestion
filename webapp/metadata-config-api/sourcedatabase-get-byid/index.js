//Application Insights Setup
const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context, req, config) {
  try {
    //if a value is returned from the CosmosDB Binding then return id, sourceDatabaseName,
    if (config) {
      context.res.status(200).json({
        id: config.id,
        sourceDatabaseName: config.sourceDatabaseName,
        description: config.description,
      });
    } else {
      context.res.status(404);
    }
  } catch (error) {
    context.res.status(500).json({
      error,
    });
    context.log.error(
      `GET /sourcedatabase/${context.bindingData.sourceDatabaseName}/${context.bindingData.id}  ERROR: `,
      error
    );
  }
  context.done();
};
