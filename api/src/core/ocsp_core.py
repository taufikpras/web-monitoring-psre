from src.db_schema.ca_schema import CA_Schema
from src.db_schema.ocsp_schema import OCSP_Schema, to_object_from_db, to_list_of_object_from_db
from src.db_schema.database import db
from bson import ObjectId
from src.db_schema.file_repo_schema import File_Repo_Schema
import src.util.net_handler as net_handler
import src.util.file_handler as file_handler
import logging
import src.parameters as param
logger = logging.getLogger(param.LOGGER_NAME)

COLLECTION_NAME = "ocsp"

def get_all():
    collection = db[COLLECTION_NAME]
    results = to_list_of_object_from_db(collection.find())

    return results

# def get_one(id:str):
#     collection = db[COLLECTION_NAME]
#     result = individual(collection.find_one({"_id":ObjectId(id)}))
#     ca_data = ca_core.get_one(result["ca_id"])
#     result["cn"] = ca_data["cn"]
#     result["dn"] = ca_data["dn"]

#     return result

def insert_one(input:OCSP_Schema):
    collection = db[COLLECTION_NAME]
    input.url = net_handler.check_url(input.url)
    existing = find_url(input)
    
    if(existing == None):
        res = collection.insert_one(dict(input))
        input._id = ObjectId(res.inserted_id)
        
    return input

def edit_one(input:OCSP_Schema):
    collection = db[COLLECTION_NAME]
    input.url = net_handler.check_url(input.url)
    res = collection.find_one_and_update({"issuer_dn":input.issuer_dn, "issuer_keyid":input.issuer_keyid}, {"$set": dict(input)},return_document=True)
    return to_object_from_db(res)

def delete_one(id:str):
    collection = db[COLLECTION_NAME]
    return str(collection.find_one_and_delete({"_id": ObjectId(id)}))

def delete_all():
    collection = db[COLLECTION_NAME]
    return str(collection.delete_many({}))

def delete_by_issuer_dn_keyid(dn:str, keyid:str):
    collection = db[COLLECTION_NAME]
    return str(collection.find_one_and_delete({"issuer_dn": dn, "issuer_keyid": keyid}))

def find_url(input: OCSP_Schema):
    collection = db[COLLECTION_NAME]
    url = net_handler.check_url(input.url)
    result = to_object_from_db(collection.find_one({"issuer_dn":input.issuer_dn, "url":url}))
    return result

def find_by_ca(input: CA_Schema) -> list[OCSP_Schema]:
    collection = db[COLLECTION_NAME]
    results = to_list_of_object_from_db(collection.find({"issuer_dn":input.dn, "issuer_keyid":input.keyid}))
    return results

def insert_from_cert(input_file: File_Repo_Schema):
    ocsps = file_handler.parse_ocsp_from_file(input_file)

    if ocsps is not None:
        for ocsp in ocsps:
            logger.debug(ocsp.model_dump())
            ocsp = insert_one(ocsp)
    
    return ocsps