from pydantic import BaseModel
from datetime import datetime
import hashlib


class Tickets_Schema(BaseModel):
    
    ticket_id: str = ""
    start: datetime = None
    end: datetime | None = None
    last_notif: datetime | None = None
    cn: str
    url: str
    resolve: bool = False
    message: str 
    occurance: int = 1
       

def create_ticket_id(issuer_keyid:str,url:str, issuer_dn:str):
    ticket_id_ = issuer_dn + issuer_keyid + url
    ticket_id = hashlib.sha1(ticket_id_.encode('utf-8')).hexdigest()

    return ticket_id

def set_ticket(issuer_keyid:str, issuer_dn:str, message:str, url:str):
    ticket_id = create_ticket_id(issuer_keyid=issuer_keyid,
                                 issuer_dn=issuer_dn,
                                 url = url)
    return Tickets_Schema(ticket_id=ticket_id,
              message=message,
              cn=issuer_dn.split("CN=")[1].split(",")[0],
              url=url,
              start=datetime.now())

# def set_ticket_from
def to_object_from_db(dict_) -> Tickets_Schema:
    
    if(dict_!= None):
        return Tickets_Schema(
            ticket_id=dict_["ticket_id"],
            message=dict_["message"],
            cn=dict_["cn"],
            url=dict_["url"],
            resolve=dict_["resolve"],
            occurance=dict_["occurance"],
            end= dict_["end"],
            start=dict_["start"],
            last_notif= dict_["last_notif"]
        )
    else:
        return None

def to_list_of_object_from_db(objcts) -> list:
    return[to_object_from_db(objct) for objct in objcts]