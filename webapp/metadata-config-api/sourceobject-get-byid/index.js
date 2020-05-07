module.exports = async function (context, req, config) {
  try {
    //if a value is returned from the CosmosDB Binding then return id, sourceDatabaseName,
    if (config) {
      context.res.status(200).json({
        id: config.id,
        sourceDatabaseName: config.sourceDatabaseName,
        sourceObjectName: config.sourceObjectName,
        description: config.description,
        loadType: config.loadType,
        fileType: config.fileType,
        columnCount: config.columnCount,
        rawZone: config.rawZone,
        delimiterConfiguration: config.delimiterConfiguration,
      });
    } else {
      context.res.status(404);
      context.log.error(
        `GET /sourcedatabase/${context.bindingData.sourceDatabaseName}/${context.bindingData.id}  ERROR: Record Not Found`
      );
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
