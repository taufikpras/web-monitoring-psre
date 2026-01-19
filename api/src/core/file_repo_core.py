# from src.db_schema.file_repo_schema import Cert_Schema as file_schema
from src.db_schema.database import db
from src.db_schema.file_repo_schema import File_Repo_Schema, to_list_of_object_from_db, to_object_from_db
import src.util.file_handler as file_handler
from bson import ObjectId
import logging
import src.parameters as param
logger = logging.getLogger(param.LOGGER_NAME)

COLLECTION_NAME = "cert"

def get_all() -> list[File_Repo_Schema]:
    collection = db[COLLECTION_NAME]
    result = to_list_of_object_from_db(collection.find())
    return result

def get_one(id:str):
    collection = db[COLLECTION_NAME]
    result = to_object_from_db(collection.find_one({"_id":ObjectId(id)}))
    return result

def find_file(input: File_Repo_Schema) -> File_Repo_Schema:
    collection = db[COLLECTION_NAME]
    result = to_object_from_db(collection.find_one({"dn":input.dn, "keyid":input.keyid}))
    return result

def delete_all():
    collection = db[COLLECTION_NAME]
    return str(collection.delete_many({}))

def delete_one(dn:str, keyid:str):
    collection = db[COLLECTION_NAME]
    return str(collection.find_one_and_delete({"dn":dn, "keyid":keyid}))

def find_file_from_file_id(file_id:str) -> File_Repo_Schema:
    collection = db[COLLECTION_NAME]
    result = to_object_from_db(collection.find_one({"subject_file_id":file_id}))
    return result

def update(input: File_Repo_Schema):
    collection = db[COLLECTION_NAME]
    # db_schema = convert_to_schema(input)
    res = collection.find_one_and_update({"dn":input.dn, "keyid":input.keyid}, {"$set": dict(input)},return_document=True)
    return to_object_from_db(res)

def insert_one(input:File_Repo_Schema) -> File_Repo_Schema:
    collection = db[COLLECTION_NAME]
    # db_schema = convert_to_schema(input)

    existing = find_file(input)
    res = input
    if(existing == None):
        id = collection.insert_one(dict(input)).inserted_id
    else:
        res = update(existing)
    return res


def insert_from_file(file_path:str) -> list[File_Repo_Schema]:
    files = file_handler.handle_upload(file_path)
    
    for file in files:
        res = insert_one(file)
    return files
