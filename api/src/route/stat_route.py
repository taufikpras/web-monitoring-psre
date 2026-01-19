from fastapi import APIRouter, File, UploadFile
# import src.util.scheduler as sch
# from src.model.input import Input
# import src.core.input_core as core
import os
import zipfile
# from pathlib import Path
import shutil
import aiofiles
from src.parameters import TEMP, API_VERSION
import json
import logging
import src.core.file_repo_core as file_core 

str_name = "stat"
router = APIRouter(prefix="/api",tags=[str_name],)
logger = logging.getLogger("monitoring_psre")

import src.core.ca_core as ca_core
import src.core.crl_core as crl_core
import src.core.ocsp_core as ocsp_core
import src.core.ticket_core as ticket_core

@router.get("/stat")
async def get_stat():
    try:
        total_ca = len(ca_core.get_all())
        total_crl = len(crl_core.get_all())
        total_ocsp = len(ocsp_core.get_all())
        total_files = len(file_core.get_all())
        total_tickets = len(ticket_core.get_all_active())
        
        return {
            "total_ca": total_ca,
            "total_crl": total_crl,
            "total_ocsp": total_ocsp,
            "total_files": total_files,
            "total_tickets": total_tickets
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return {"status": "error", "message": str(e)}

@router.get("/version")
async def get_version():
    return {"version": API_VERSION}