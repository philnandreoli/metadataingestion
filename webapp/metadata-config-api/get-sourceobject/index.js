var sql = require("mssql");

module.exports = async function (context, req) {
  //connection string configuration for the SQL Database
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

  await sql
    .connect(config)
    .then((pool) => {
      return pool.request()
        .query(`SELECT  so.[SourceObjectId] as [SourceObject.id] 
    ,so.[SourceDatabaseId] as [SourceObject.SourceDatabase.id] 
    ,sd.[Name] as [SourceObject.SourceDatabase.Name] 
    ,sd.[Description] as [SourceObject.SourceDatabase.Description] 
    ,so.[Name] as [SourceObject.Name] 
    ,so.[Description] as [SourceObject.Description] 
    ,CASE 
        WHEN so.[LoadTypeId] = 1 THEN 'Full' 
        WHEN so.[LoadTypeId] = 2 THEN 'Incremental' 
        WHEN so.[LoadTypeId] = 3 THEN 'Append'  
    END as [SourceObject.LoadType] 
    ,so.[IsActive] as [SourceObject.IsActive] 
    ,so.[CreatedDate] as [SourceObject.CreatedDate] 
    ,so.[CreatedBy] as [SourceObject.CreatedBy] 
    ,so.[LastUpdatedDate] as [SourceObject.LastUpdatedDate] 
    ,so.[LastUpdatedBy] as [SourceObject.LastUpdatedBy] 
    ,so.[FileType] as [SourceObject.FileType] 
    ,so.[ColumnCount] as [SourceObject.ColumnCount] 
    ,so.[RawZoneFileName] as [SourceObject.RawZone.FileName] 
    ,so.[RawZoneDestination] as [SourceObject.RawZone.Destination] 
    ,so.[RawZoneFileType] as [SourceObject.RawZone.FileType] 
    ,so.[RawZoneContainerName] as [SourceObject.RawZone.ContainerName] 
FROM [dbo].[SourceObject] as so 
INNER JOIN [dbo].[SourceDatabase] as sd ON so.[SourceDatabaseId] = sd.[SourceDatabaseId] 
WHERE so.[IsActive] = 1 
FOR JSON PATH, ROOT('SourceObjects')`);
    })
    .then((result) => {
      var responseBody =
        result.recordset[0][Object.keys(result.recordset[0])[0]];

      context.res = {
        status: 200,
        body: JSON.parse(responseBody),
        headers: {
          "Content-Type": "application/json",
        },
      };

      context.done();
    })
    .catch((err) => {
      context.log.error("ERROR: ", err);
    });
};
