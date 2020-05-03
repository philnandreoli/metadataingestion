var sql = require("mssql");
const appInsights = require("applicationinsights");
const sqlConfig = require('../configs/sqlConfig')


appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context, req) {

  context.log.information(`DELETE /sourceobject/${context.bindingData.id} was requested`);
  
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
    .connect(sqlConfig)
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
        
        context.log.information(`${context.bindingData.id} was marked inactive and HTTP Response with status 200 was sent back to the client`);
        
        context.res = {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        };

      } else {
        context.log.information(`${context.bindingData.id} was not found and HTTP Response with status 404 was sent back to the client`);
        
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
