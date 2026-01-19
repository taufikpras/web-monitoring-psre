from fastapi import APIRouter, File, UploadFile
# import src.util.scheduler as sch
# from src.model.input import Input
# import src.core.input_core as core
import os
import zipfile
# from pathlib import Path
import shutil
import aiofiles
from src.parameters import TEMP
import json
import logging
import src.core.file_repo_core as file_core 

str_name = "file"
router = APIRouter(prefix="/api",tags=[str_name],)
logger = logging.getLogger("monitoring_psre")

@router.get("/list_file")
async def get_all_files():
    try:
        return file_core.get_all()
    except Exception as e:
        logger.error(f"Error getting files: {e}")
        return {"status": "error", "message": str(e)}

@router.delete("/delete_file")
async def delete_file(dn:str, keyid:str):
    try:
        return file_core.delete_one(dn, keyid)
    except Exception as e:
        logger.error(f"Error deleting file {dn}/{keyid}: {e}")
        return {"status": "error", "message": str(e)}

@router.delete("/delete_all")
async def delete_all():
    try:
        return file_core.delete_all()
    except Exception as e:
        logger.error(f"Error deleting all files: {e}")
        return {"status": "error", "message": str(e)}