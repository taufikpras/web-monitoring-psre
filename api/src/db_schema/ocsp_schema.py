from pydantic import BaseModel
from datetime import datetime

class OCSP_Schema(BaseModel):
    updated: datetime = datetime.now()
    url: str
    issuer_keyid: str
    issuer_dn: str
    user_file_id: str
    issuer_file_id: str
    
def to_object_from_db(input:dict) -> OCSP_Schema:
    if(input != None):
        return OCSP_Schema(
            id = str(input["_id"]),
            url = str(input["url"]),
            issuer_dn = str(input["issuer_dn"]),
            issuer_keyid = str(input["issuer_keyid"]),
            issuer_file_id = str(input["issuer_file_id"]),
            user_file_id = str(input["user_file_id"]),
        )
    else:
        return None
    
def to_list_of_object_from_db(inputs:list[dict]) -> list[OCSP_Schema]:
    return[to_object_from_db(input) for input in inputs]