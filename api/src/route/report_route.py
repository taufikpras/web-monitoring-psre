import src.celery as celery
from fastapi import APIRouter
from src.util import influx_handler
from src.core import ticket_core

str_name = "report"
router = APIRouter(prefix="/api/"+str_name,tags=[str_name],)

@router.get("/show_va_report_24h")
async def show_report_24h():
    report = influx_handler.query_report()
    return report

@router.get("/send_va_report_24h")
async def send_report_24h():
    status = celery.send_daily_report()
    return status

@router.get("/show_last_ticket_24h")
async def show_report_24h():
    report = ticket_core.get_ticket_for_reguler_report()
    return report

@router.get("/send_last_ticket_24h")
async def send_report_24h():
    status = celery.send_ticket_report()
    return status

