from fastapi import APIRouter
import src.core.ca_core as core
from src.db_schema.ca_schema import CA

str_name = "ca"
router = APIRouter(
    prefix="/api/" + str_name,
    tags=[str_name]
)

@router.get("/")
async def get(id: str = None):
    if id is not None:
        ret = core.get_one(id)
    else:
        ret = core.get_all()
    return ret

@router.get("/get_all_verbose")
async def get_all_verbose():
    ret = core.get_all_ca_and_component()
    return ret

@router.post("/")
async def insert_one(input: CA):
    return core.insert_one(input)

@router.put("/")
async def update_one(id: str, input: CA):
    return core.edit_one(id, input)

@router.delete("/")
async def delete_one(id: str):
    return core.delete_one(id)