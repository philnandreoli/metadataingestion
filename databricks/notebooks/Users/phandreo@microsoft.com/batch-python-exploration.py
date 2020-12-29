# Databricks notebook source
# MAGIC %md
# MAGIC This will run for a specific time period

# COMMAND ----------

# Parameters that will be passed into the notebook leveraging ADF
dbutils.widgets.text("enqueuedDateTimeBegin", "", "Enqueued Date Time Begin Time")
dbutils.widgets.text("enqueuedDateTimeEnd", "", "Enqueued Date Time End Time")
dbutils.widgets.text("explorationPath", "", "Exploration Path")
dbutils.widgets.text("mergeJoin", "", "Join for the Merge Statement")
dbutils.widgets.text("sqlStatement", "", "SQL Statement for Raw Telemetry")
dbutils.widgets.text("partitionByColumn", "", "Column to Partition Data By")
dbutils.widgets.text("explorationTableDuplicates", "", "Exploration Table Duplicates")
dbutils.widgets.text("explorationTable", "", "Exploration Table")

# COMMAND ----------

# This function is used to determine if the path in exploration exists.  If it does then return true, else return false
def file_exists(path):
  try:
    dbutils.fs.ls(path)
    return True
  except Exception as e:
    if 'java.io.FileNotFoundException' in str(e):
      return False
    else:
      raise

# COMMAND ----------

# This will execute the query that is passed into the notebook under the variable sqlStatement and store it into iotData dataframe
from pyspark.sql.functions import to_timestamp

startTime = dbutils.widgets.get("enqueuedDateTimeBegin")
endTime = dbutils.widgets.get("enqueuedDateTimeEnd")
explorationPath = dbutils.widgets.get("explorationPath")
sqlQuery = dbutils.widgets.get("sqlStatement")
explorationTable = dbutils.widgets.get("explorationTable")
partitionedByColumn = dbutils.widgets.get("partitionByColumn")
explorationDuplicatesTable = dbutils.widgets.get("explorationTableDuplicates")

print(sqlQuery)

iotData = spark.sql(sqlQuery % (startTime, endTime))

# COMMAND ----------

# This will create the objects in the exploration zone
from delta.tables import *

#####################################################################
# Check to see if the location in the exploration zone exists, if it does exists then just merge the data
# else append the data and then create the spark sql table
#####################################################################
if file_exists(explorationPath):
  print("Object already exists and doing a merge")
  
  deltaTable = DeltaTable.forPath(spark, explorationPath)
  deltaTable.alias("t").merge(
    iotData.alias("s"),
    dbutils.widgets.get("mergeJoin")) \
    .whenMatchedUpdateAll() \
    .whenNotMatchedInsertAll() \
    .execute()
  
else: 
  print("First time creating the object")
  
  iotData \
  .write \
  .format("delta") \
  .partitionBy(partitionedByColumn) \
  .mode("overwrite") \
  .save(explorationPath)
  
  createTableSql = "CREATE TABLE %s USING DELTA LOCATION '%s'" % (explorationTable, explorationPath)
  dropTableSql = "DROP TABLE IF EXISTS %s" % (explorationTable) 
  
  spark.sql(dropTableSql)
  spark.sql(createTableSql)

# COMMAND ----------

createDuplicatesTableSql = "CREATE TABLE %s AS SELECT sensor, deviceId,  enqueuedTime, timestamp FROM %s GROUP BY sensor, deviceId,  enqueuedTime, timestamp HAVING count(*) > 1" % (explorationDuplicatesTable, explorationTable)
deleteDuplicatesTableSql = "DELETE FROM %s a WHERE EXISTS (SELECT * FROM %s z WHERE a.sensor = z.sensor and a.deviceId = z.deviceId and a.enqueuedTime = z.enqueuedTime and a.timestamp = z.timestamp)" % (explorationTable, explorationDuplicatesTable)
dropDuplicatesTableSql = "DROP TABLE IF EXISTS %s" % (explorationDuplicatesTable)

spark.sql(createDuplicatesTableSql)

spark.sql(deleteDuplicatesTableSql)

spark.sql(dropDuplicatesTableSql) 