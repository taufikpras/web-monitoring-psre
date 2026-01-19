import requests
from timeit import default_timer as timer
from datetime import datetime, timedelta, timezone
from src.db_schema.verification_result_schema import CRL_Result_Schema

from src.db_schema.queue_schema import Queue_Schema
from src.util import cert_handler

import logging
import src.parameters as param
logger = logging.getLogger(param.LOGGER_NAME)

class CRL_verifier():

    result: CRL_Result_Schema

    content: dict = {}

    queue: Queue_Schema

    def __init__(self, queue_: dict):

        self.result = CRL_Result_Schema()
        self.queue = Queue_Schema.from_dict(queue_)
        self.result.issuer_dn = self.queue.issuer_dn
        self.result.issuer_keyid = self.queue.issuer_keyid
        self.result.url = self.queue.url
        self.content = {}
    
    def request_crl(self):
        logger.info(f"Start Check CRL Availibility : {self.queue.url}")
        ret_byte = None
        try:
            strtime = timer()
            logger.debug(f"start downloading : {self.queue.url}")
            response = requests.get(self.queue.url)

            logger.debug(response.status_code)

            if(response.status_code == 200):
                ret_byte = response.content
                return ret_byte
            else:
                self.result.message.append(f"Error status code {response.status_code}")
                logger.warning(f"status code {self.queue.url} : {response.status_code}")
        except Exception as err:
            # logger.error("Connection Error : "+input["url"],exc_info=True)
            logger.error(f"Connection Error : {self.queue.url}",exc_info=True)
            self.result.message.append("Unable to connect")
        finally:
            endtime = timer()
            self.result.response_time = endtime - strtime
            return ret_byte

    def verify_crl(self,crldata):

        crl = cert_handler.read_crl_from_content(crldata)

        if crl != None:
            self.result.availability = 1

            timeDiff = crl.next_update_utc - crl.last_update_utc

            now_tz = datetime.now().astimezone()

            next_update = crl.next_update_utc.astimezone()

            if(next_update > now_tz):
                self.result.validity = 1
            else:
                self.result.message.append("CRL Expired")
            
            if(timeDiff < timedelta(hours=72)):
                self.result.time_delta = 1
            else:
                self.result.message.append("CRL Validity too Long")
            
            if(self.queue.issuer_file_pem != ""):
                cert = cert_handler.read_cert_from_pem_str(self.queue.issuer_file_pem)
                if(crl.is_signature_valid(cert.public_key())):
                    self.result.signature = 1
                else:
                    self.result.message.append("CRL Signature Invalid")
        else:
            self.result.message.append("cannot load crl response data")
        
        
        
        if(self.result.availability == 1 and self.result.validity == 1 and self.result.signature == 1):
            self.result.overall = 1

    def get_crl_content(self, crldata):
        crl = cert_handler.read_crl_from_content(crldata)

        if crl != None:
            tzname = datetime.now(timezone.utc).astimezone().tzname()
            now_ = datetime.now().astimezone()
            last_update = crl.last_update_utc.astimezone()
            next_update = crl.next_update_utc.astimezone()
            time_delta = next_update - last_update
            self.content["crl_number"] = crl.extensions.get_extension_for_oid(cert_handler.CRL_NUMBER_OID).value.crl_number
            self.content["auth_key_id"] = crl.extensions.get_extension_for_oid(cert_handler.AUTHORITY_KEY_IDENTIFIER_OID).value.key_identifier.hex()
            self.content["last_update"] = last_update.strftime("%Y-%m-%d %H:%M:%S")
            self.content["next_update"] = next_update.strftime("%Y-%m-%d %H:%M:%S")
            self.content["time_diff"] = time_delta.seconds / 3600 
            self.content["time_now"] = now_.strftime("%Y-%m-%d %H:%M:%S")
            self.content["timezone"] = tzname

    def to_dict(self):
        return {
            "queue" : self.queue.__dict__,
            "result" : self.result.__dict__,
            "content" : self.content
        }
    
    def get_verification_result(self) -> dict:
        return self.result.get_dict_result()

    def get_ca_info(self) -> dict:
        return {
            "cn" : self.queue.issuer_cn,
            "dn" : self.queue.issuer_dn,
            "url" : self.queue.url
        }

    @classmethod
    def from_dict(cls,input:dict):
        queue = Queue_Schema.from_dict(input["queue"])

        obj = cls(queue)
        obj.result = CRL_Result_Schema.from_dict(input["result"])
        obj.content = input["content"]
