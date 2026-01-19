from pymongo.mongo_client import MongoClient
import src.parameters as param

import influxdb_client
from influxdb_client.client.write_api import SYNCHRONOUS

MONGO_URL = f"mongodb://{param.MONGO_USER}:{param.MONGO_PASS}@{param.MONGO_HOST}:{param.MONGO_PORT}/"

client = MongoClient(MONGO_URL)

db = client.monitoring


INFLUX_URL = param.INFLUX_URL
INFLUX_ADMIN_TOKEN = param.INFLUX_TOKEN
INFLUX_ORG = param.INFLUX_ORG
INFLUX_BUCKET = param.INFLUX_BUCKET

influx_client = influxdb_client.InfluxDBClient(
        url=INFLUX_URL,
        token=INFLUX_ADMIN_TOKEN,
        org=INFLUX_ORG)
