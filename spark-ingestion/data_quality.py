from pyspark.sql import SparkSession
from pyddq.core import Check
from pyddq.reporters import MarkdownReporter, ConsoleReporter

import findspark
findspark.init()


rawZoneContainerName = "raw"
explorationContainerName = "exploration"
rawZoneBlobStorageAccountName = "mtcchidatalake001d.blob.core.windows.net"
explorationZoneBlobStorageAccountName = "mtcchidatalake001d.blob.core.windows.net"

rawZoneAdlsPath = 'wasbs://' + rawZoneContainerName + \
    '@' + rawZoneBlobStorageAccountName + '/'
explorationZoneAdlsPath = 'wasbs://' + explorationContainerName + \
    '@' + rawZoneBlobStorageAccountName + '/'

rawZoneInputPath = rawZoneAdlsPath + \
    'WorldWideImporters/orders/2020/04/07/*.parquet'
exporationZoneOutputPath = explorationZoneAdlsPath + \
    'deta-lake/WorldWideImporters/orders'

# Configure the Session that will connect python to spark and configure logging for spark delta store configuration
spark = SparkSession \
    .builder \
    .master("local[*]") \
    .enableHiveSupport() \
    .config("spark.driver.bindAddress", "127.0.0.1") \
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
    .config("spark.delta.logStore.class", "org.apache.spark.sql.delta.storage.AzureLogStore") \
    .getOrCreate()



test = spark.read.format("delta").load(exporationZoneOutputPath)

test.dtypes
    
    


Check(test) \
    .hasNumRowsGreaterThan(0) \
    .hasUniqueKey("OrderID") \
    .isNeverNull("CustomerID") \
    .run()

