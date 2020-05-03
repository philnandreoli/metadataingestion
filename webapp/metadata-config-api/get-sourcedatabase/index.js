const sql = require("mssql");
const appInsights = require("applicationinsights");
const sqlConfig = require('../configs/sqlConfig')

module.exports = async function (context, req) {
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
      return pool.request().query(
        `SELECT  [SourceDatabaseId] AS [SourceDatabase.id]
          , [Name] AS [SourceDatabase.Name]
          , [Description] AS [SourceDatabase.Description]
          , [IsActive] AS [SourceDatabase.IsActive]
          , [CreatedDate] as [SourceDatabase.CreatedDate]
          , [CreatedBy] as [SourceDatabase.CreatedBy]
          , [LastUpdatedDate] AS [SourceDatabase.LastUpdatedDate]
          , [LastUpdatedBy] AS [SourceDatabase.LastUpdatedBy]
          FROM [dbo].[SourceDatabase]
          WHERE [IsActive] = 1
          FOR JSON PATH, ROOT('SourceDatabases')`
      );
    })
    .then((result) => {
      var responseBody =
        result.recordset[0][Object.keys(result.recordset[0])[0]];

      if (responseBody) {
        context.res = {
          status: 200,
          body: JSON.parse(responseBody),
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
