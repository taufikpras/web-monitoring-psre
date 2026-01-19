from pydantic import BaseModel
from datetime import datetime
from pydantic import Field
from bson import ObjectId 
from typing import Optional

class CA_Schema(BaseModel):
    cn: str 
    dn: str
    keyid: str
    updated: datetime = datetime.now()
    
def to_object_from_db(input:dict) -> CA_Schema:
    if(input != None):
        return CA_Schema(
            id = str(input["_id"]),
            cn = str(input["cn"]),
            dn = str(input["dn"]),
            keyid = str(input["keyid"]),
        )
    else:
        return None
    
def to_list_of_object_from_db(inputs:list[dict]) -> list[CA_Schema]:
    return[to_object_from_db(input) for input in inputs]
