from fastapi import APIRouter
from src.db_schema.queue_schema import Queue_Schema
from src.db_schema.ticket_schema import Tickets_Schema, set_ticket
from src.db_schema.verification_result_schema import Result_Schema, CRL_Result_Schema
from src.core import ticket_core
import src.util.telegram_util as telegram_util

str_name = "test"
router = APIRouter(prefix="/api/"+str_name,tags=[str_name],)

@router.get("/")
async def get():
    obj = Queue_Schema()
    obj.name = "crl"
    obj.issuer_dn = "cn=a,c=id"
    obj.issuer_cn = "a"
    obj.url = "crl.a.id"
    obj.issuer_keyid = "asda223sdsfn"

    obj2 = Queue_Schema.from_dict(obj.__dict__)
    return obj2.__dict__

@router.get("/test_result_schema")
async def test_result_schema():
    res_sch = CRL_Result_Schema()

    res_sch.issuer_dn = "CN=Test CA - G1,O=Test,C=ID"
    res_sch.issuer_keyid = "AFJAK3RHHGT9S02492U0JJK"
    res_sch.url = "va.test.id/crl"
    res_sch.message.append("Availibility error")
    
    return res_sch.get_dict_result()

@router.get("/test_fail_result")
async def test_fail_result():
    res_sch = Result_Schema()

    res_sch.issuer_dn = "CN=Test CA - G1,O=Test,C=ID"
    res_sch.issuer_keyid = "AFJAK3RHHGT9S02492U0JJK"
    res_sch.url = "va.test.id/crl"
    res_sch.message.append("Availibility error")
    tick = ticket_core.log_ticket(res_sch)

    return tick.model_dump()

@router.get("/test_resolve")
async def test_resolve():
    res_sch = Result_Schema()

    res_sch.issuer_dn = "CN=Test CA - G1,O=Test,C=ID"
    res_sch.issuer_keyid = "AFJAK3RHHGT9S02492U0JJK"
    res_sch.url = "va.test.id/crl"
    res_sch.message.append("Availibility error")
    res_sch.overall = 1

    tick = ticket_core.log_ticket(res_sch)
    return tick.model_dump()

@router.get("/test_schema_ticket")
async def test_schema_ticket():
    ticket_ = set_ticket(issuer_keyid="AFJAK3RHHGT9S02492U0JJK",issuer_dn="CN=Test CA - G1,O=Test,C=ID",message="Availibility error",url="va.test.id/crl")
    dict_ = ticket_.model_dump()
    ticket_1 = Tickets_Schema.model_validate(dict_)
    return ticket_1.model_dump()

@router.get("/send_notification")
async def send_notification():
    notifs =  ticket_core.get_ticket_for_realtime_notif()
    res = {}
    res["before"] = notifs
    res["message"] = []
    res["after"] = []
    if(notifs.__len__()>0):
        for notif in notifs:
            res["message"].append(telegram_util.send_ticket_notification(notif))
            notif = ticket_core.update_last_notif(notif)
            res["after"] = notif.model_dump()
    
    return res
    
