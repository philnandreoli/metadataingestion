var sql = require("mssql");
var appInsights = require("applicationinsights");

module.exports = async function (context, req) {
  var config = {
    user: process.env.DBUser,
    password: process.env.Password,
    server: process.env.MetaConfigDBServer,
    database: process.env.MetaConfigDB,
    connectionTimeout: 60000,
    options: {
      encrypt: true,
    },
  };

  //Configure Application Insights to capture the information needed
  appInsights
    .setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(false)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
    .start();

  //Capture the errors on connection
  await sql.on("error", (err) => {
    context.log.error("ERROR: ", err);
    context.res = {
      status: 500,
      body:
        "The Database Server is down, please try again in a few minutes!  Sorry for any inconvenience this may have caused.",
    };
  });

  await sql
    .connect(config)
    .then((pool) => {
      return pool
        .request()
        .input("SourceObjectId", sql.Int, context.bindingData.id)
        .query(
          `UPDATE [dbo].[SourceObject]
           SET [IsActive] = 0,
               [LastUpdatedBy] = 'phandreo',
               [LastUpdatedDate] = GETUTCDATE()
           WHERE [IsActive] = 1 and [SourceObjectId] = @SourceObjectId`
        );
    })
    .then((result) => {
      //if responseBoxy has a value in it, then a record was found, else it is empty and should return a 404 error
      if (result.rowsAffected[0] > 0) {
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        };
      } else {
        context.res = {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
      context.done();
    })
    .catch((err) => {
      context.log.error("ERROR: ", err);
      context.res = {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: err,
      };
    });
};
