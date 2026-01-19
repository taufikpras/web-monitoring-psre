from pydantic import BaseModel
from datetime import datetime

class File_Repo_Schema(BaseModel):
    subject_file_id: str
    issuer_file_id:str
    cn: str 
    dn: str
    issuerdn: str
    issuercn:str
    isca: bool
    blob: str
    keyid: str
    updated: datetime = datetime.now()
    
def to_object_from_db(input:dict) -> File_Repo_Schema:
    if(input != None):
        return File_Repo_Schema(
            id = str(input["_id"]),
            cn = str(input["cn"]),
            dn = str(input["dn"]),
            issuerdn = str(input["issuerdn"]),
            issuercn = str(input["issuercn"]),
            subject_file_id = str(input["subject_file_id"]),
            issuer_file_id = str(input["issuer_file_id"]),
            keyid = str(input["keyid"]),
            isca = str(input["isca"]),
            blob = str(input["blob"])
        )
    else:
        return None
    
def to_list_of_object_from_db(inputs:list[dict]) -> list[File_Repo_Schema]:
    return[to_object_from_db(input) for input in inputs]