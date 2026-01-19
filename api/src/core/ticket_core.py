from src.db_schema.queue_schema import Queue_Schema
from src.db_schema.verification_result_schema import Result_Schema
from src.db_schema.ticket_schema import to_object_from_db, to_list_of_object_from_db, Tickets_Schema, create_ticket_id, set_ticket
from src.db_schema.database import db
from bson import ObjectId
from datetime import datetime, timedelta

import logging
import src.parameters as param
logger = logging.getLogger(param.LOGGER_NAME)

COLLECTION_NAME = "tickets"
MIN_OCCURANCE = 5

def get_all_active():
    collection = db[COLLECTION_NAME]
    result = to_list_of_object_from_db(collection.find({"resolve":False}))
    return result

def find_active_tickets(result:Result_Schema) -> Tickets_Schema:
    collection = db[COLLECTION_NAME]
    ticket_id = create_ticket_id(issuer_keyid=result.issuer_keyid, issuer_dn=result.issuer_dn, url=result.url)
    result = to_object_from_db(collection.find_one({"ticket_id":ticket_id, "resolve":False}))
    return result

def find_active_tickets_by_uid(ticket_id:str) -> Tickets_Schema:
    collection = db[COLLECTION_NAME]
    # ticket_id = create_ticket_id(issuer_keyid=result.issuer_keyid, issuer_dn=result.issuer_dn, url=result.url)
    result = to_object_from_db(collection.find_one({"ticket_id":ticket_id, "resolve":False}))
    return result

def insert_one_from_result(result:Result_Schema) -> Tickets_Schema:
    collection = db[COLLECTION_NAME]
    exist = find_active_tickets(result)
    ticket_id = create_ticket_id(issuer_keyid=result.issuer_keyid, issuer_dn=result.issuer_dn, url=result.url)
    if(exist == None):
        input = set_ticket(issuer_dn=result.issuer_dn,
                               issuer_keyid=result.issuer_keyid,
                               url=result.url,
                               message=",".join(result.message))
        collection.insert_one(dict(input))
        res = input
    else:
        res = exist
    return res

def find_ticket_by_last_notif(input:Tickets_Schema) -> Tickets_Schema:
    collection = db[COLLECTION_NAME]    
    result = to_object_from_db(collection.find_one({"ticket_id":input.ticket_id,"last_notif":input.last_notif}))
    return result


def delete_one(ticket_id:str):
    collection = db[COLLECTION_NAME]
    return str(collection.find_one_and_delete({"ticket_id":ticket_id, "resolve":False}))

def update(input:Tickets_Schema):
    collection = db[COLLECTION_NAME]
    res = collection.find_one_and_update({"ticket_id":input.ticket_id, "resolve":input.resolve}, {"$set": dict(input)},return_document=True)
    return to_object_from_db(res)



def set_resolve(result_:Result_Schema) -> Tickets_Schema:
    collection = db[COLLECTION_NAME]
    ticket_id = create_ticket_id(issuer_keyid=result_.issuer_keyid, issuer_dn=result_.issuer_dn, url=result_.url)
    result = collection.find_one({"ticket_id":ticket_id, "resolve":False})

    if(result != None):
        result["resolve"] = True
        result["last_notif"] = None
        result["end"] = datetime.now()

        if(result["occurance"] < MIN_OCCURANCE):
            res = delete_one(ticket_id)
            res = to_object_from_db(result)
        else:
            res = collection.find_one_and_update({"ticket_id":ticket_id, "resolve":False}, {"$set": result},return_document=True)
            res = to_object_from_db(res)
    else:
        res = None
    return res

def log_ticket(result:Result_Schema)-> Tickets_Schema:
    active = find_active_tickets(result)
    ret = None
    if(result.overall == 0):
        if(active == None):
            logger.info(f'Tickets created : {result.issuer_dn}')
            ret = insert_one_from_result(result)
        else:
            logger.info(f'Update Occurance : {result.issuer_dn}')
            active.occurance = active.occurance + 1
            ret = update(active)
    else:
        if active != None:
            logger.info(f'Tickets resolved : {result.issuer_dn}')
            ret = set_resolve(result)
    return ret

def get_ticket_for_realtime_notif()->list[Tickets_Schema]:
    collection = db[COLLECTION_NAME]

    time_ = datetime.now() - timedelta(hours=7*24)
    new_notif = {"$and":[{"last_notif":None},{"occurance":{"$gte":MIN_OCCURANCE}}]}
    old_notif = {"$and":[{'last_notif': {"$lte": time_}},{"resolve":False}]}
    # params = {"$or":[old_notif, new_notif]}
    params = new_notif

    result = collection.find(params)
    return to_list_of_object_from_db(result)

def get_ticket_for_reguler_report():
    collection = db[COLLECTION_NAME]

    time_ = datetime.now().astimezone() - timedelta(hours=24)
    params1 = {"$or":[{'start': {"$gte": time_}},{"resolve":False}]}
    params2 = {"occurance":{"$gt":MIN_OCCURANCE}}
    params = {"$and":[params1, params2]}

    result = collection.find(params)
    return to_list_of_object_from_db(result)

def update_last_notif(input:Tickets_Schema) -> Tickets_Schema:
    collection = db[COLLECTION_NAME]
    result = find_ticket_by_last_notif(input)
    input.last_notif = datetime.now()
    logger.debug(input.model_dump())
    res = collection.find_one_and_update({"ticket_id":input.ticket_id, "last_notif":result.last_notif}, {"$set": dict(input)},return_document=True)
    
    return to_object_from_db(res)

def delete_old_closed_tickets(days: int = 90):
    collection = db[COLLECTION_NAME]
    threshold_date = datetime.now() - timedelta(days=days)
    result = collection.delete_many({
        "resolve": True,
        "end": {"$lte": threshold_date}
    })
    logger.info(f"Deleted {result.deleted_count} tickets older than {days} days.")
    return result.deleted_count






