from src.util.crl_verifier import CRL_verifier
from src.util.ocsp_verifier import OCSP_verifier
from src.db_schema.database import influx_client, INFLUX_BUCKET, INFLUX_ORG
from influxdb_client import Point
from influxdb_client.client.write_api import SYNCHRONOUS
from src.db_schema.metrics_schema import Metrics_Schema
import logging
import src.parameters as param

logger = logging.getLogger(param.LOGGER_NAME)
def test_insert_influx():
    try:
        write_api = influx_client.write_api(write_options=SYNCHRONOUS)
        p = Point("test")

        p.tag("name","test")
        p.field("availibility",1)
        
        str_return = write_api.write(bucket=INFLUX_BUCKET, record=p)

        return str_return
    except Exception as e:
        raise e

def insert_influx(input:Metrics_Schema):

    try:
        write_api = influx_client.write_api(write_options=SYNCHRONOUS)
        p = Point(input.point)

        for key, val in input.tags.items():
            p.tag(key,val)

        for key, val in input.fields.items():
            p.field(key,val)
        
        write_api.write(bucket=INFLUX_BUCKET, record=p)
    except Exception as e:
        raise e
    
def query_report():
    list_part = ["crl", "ocsp"]
    results = {}

    for part in list_part:
        results[part] = {}
    
        query_crl = f'from(bucket: "{INFLUX_BUCKET}")\
                |> range(start: -24h)\
                |> filter(fn:(r) => r._field == "overall")\
                |> filter(fn:(r) => r._measurement == "{part}")\
                |> aggregateWindow(every: 24h, fn: mean, createEmpty: false)\
                |> yield(name: "mean")'
        
        query2 = f'from(bucket: "{INFLUX_BUCKET}")\
                |> range(start: -24h)\
                |> filter(fn: (r) => r["_measurement"] == "{part}")\
                |> filter(fn: (r) => r["_field"] == "overall")\
                |> keep(columns: ["_field","cn", "_value"])\
                |> mean()'
    
        try:
            query_api = influx_client.query_api()
            result = query_api.query(org=INFLUX_ORG, query=query2)

            logger.info(result)
            
            for table in result:
                for record in table.records:
                    results[part][record["cn"]] =  float(record.get_value()) * 100

        except Exception as e:
            logger.error(e)        

    return results



def add_crl_metrics(crl_:CRL_verifier):
    metrics = Metrics_Schema(crl_.queue.name)
    metrics.fields = crl_.get_verification_result()
    metrics.tags = crl_.get_ca_info()

    insert_influx(metrics)

def add_ocsp_metrics(ocsp:OCSP_verifier):
    metrics = Metrics_Schema(ocsp.queue.name)
    metrics.fields = ocsp.get_verification_result()
    metrics.tags = ocsp.get_ca_info()

    insert_influx(metrics)