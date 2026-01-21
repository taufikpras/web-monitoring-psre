from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from src.route.input_route import router as input_router
from src.route.test_route import router as test_router
from src.route.verfier_route import router as verfier_router
from src.route.data_route import router as data_router
from src.route.report_route import router as report_router
from src.route.file_route import router as file_router
from src.route.stat_route import router as stat_router
from src.route.ticket_route import router as ticket_router
from src.route.user_route import router as user_router
import src.core.ticket_core as ticket_core
import src.logging as logging_
from src import parameters as params
import src.celery as celery
from fastapi_utils.tasks import repeat_every
import logging


logging_.setup_loggers()

logger = logging.getLogger(params.LOGGER_NAME)
# logger.info(f"influx url: {params.INFLUX_URL}")
# logger.info(f"influx token: {params.INFLUX_TOKEN}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(input_router)
app.include_router(data_router)
app.include_router(verfier_router)
app.include_router(report_router)
app.include_router(test_router)
app.include_router(file_router)
app.include_router(stat_router)
app.include_router(ticket_router)
app.include_router(user_router)
app.version = params.API_VERSION
app.title = "API Monitoring PSRE"

@repeat_every(seconds=params.TIME_INTERVAL)  # 1 hour
async def repeated_task():
    logger.info("Executing verification task")
    celery.create_periodic_verification()
    logger.info("Done executing verification task")
    
    logger.info("Send Notfication Task")
    num = celery.verifier_notification()
    logger.info(f"{num} Notifications found")
    logger.info("Done Sending Notfication Task")

@repeat_every(seconds=60 * 60)  # 24 hours
async def periodic_report():
    now = datetime.now().astimezone()
    if now.hour == 8:
        logger.info("Generating Daily Report at 08:00 AM")
        celery.send_daily_report()
        celery.send_ticket_report()
        ticket_core.delete_old_closed_tickets(90)  # Clean up old tickets (90 days)


@app.on_event("startup")
async def startup_event():
    await repeated_task()
    await periodic_report()

