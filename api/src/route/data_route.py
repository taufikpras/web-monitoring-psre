from fastapi import APIRouter
from src.core import ca_core, crl_core, ocsp_core, file_repo_core
from src.db_schema.ca_schema import CA_Schema
from src.util import influx_handler

str_name = "data"
router = APIRouter(prefix="/api/"+str_name,tags=[str_name],)

@router.get("/")
async def get(search_dn:str=None):
    if(search_dn != None):
        cas = ca_core.search_ca_by_dn(search_dn)
    else :
        cas = None
    list_cas = ca_core.get_all_ca_and_component(cas)
    dict_ = {}
    i=0
    for ca in list_cas:
        i+=1
        dict_[i] = ca
    return dict_

@router.delete("/")
async def delete(dn:str=None, keyid:str=None):
    if(dn != None and keyid != None):
        crl_core.delete_by_issuer_dn_keyid(dn, keyid)
        ocsp_core.delete_by_issuer_dn_keyid(dn, keyid)
        ca_core.delete_by_dn_keyid(dn, keyid)
    else :
        ca_core.delete_all()
        file_repo_core.delete_all()
        crl_core.delete_all()
        ocsp_core.delete_all()
    

@router.get("/ca")
async def get(search_dn:str=None):
    if(search_dn != None):
        cas = ca_core.search_ca_by_dn(search_dn)
    else :
        cas = ca_core.get_all()
    
    dict_ = {}
    i=0
    for ca in cas:
        i+=1
        dict_[i] = ca
    return dict_

@router.get("/report_24h")
async def report_24h():
    report = influx_handler.query_report()
    return report

