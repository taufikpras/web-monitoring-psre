
from src.db_schema.queue_schema import Queue_Schema
from src.db_schema.ticket_schema import Tickets_Schema
from src.core import queue_core, ticket_core
from src.util.crl_verifier import CRL_verifier
from src.util.ocsp_verifier import OCSP_verifier
import src.util.influx_handler as influx_handler
from src.util import telegram_util

from src import parameters
from celery import Celery


celery_app = Celery('tasks', broker=f'redis://:{parameters.REDIS_PASSWORD}@{parameters.REDIS_URL}:{parameters.REDIS_PORT}/0', backend=f'redis://:{parameters.REDIS_PASSWORD}@{parameters.REDIS_URL}:{parameters.REDIS_PORT}/0')

celery_app.conf['CELERY_ENABLE_UTC'] = False
celery_app.conf['timezone'] = parameters.TZ
celery_app.conf.result_expires = 60 * 3  # Expire results after 1 day (in seconds)
celery_app.conf.result_extended = True
@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Calls test('hello') every 10 seconds.
    sender.add_periodic_task(180.0, create_periodic_verification.s(), name='add every 180')

@celery_app.task()
def create_periodic_verification():
    crls_q = queue_core.create_crl_queues()
    ocsps_q = queue_core.create_ocsp_queues()
    for crl in crls_q:
        crl_verifier.delay(crl.__dict__)
    
    for ocsp in ocsps_q:
        ocsp_verifier.delay(ocsp.__dict__)

@celery_app.task()
def crl_verifier(queue: dict):
    verifier = CRL_verifier(queue)
    data = verifier.request_crl()
    verifier.verify_crl(data)
    verifier.get_crl_content(data)

    influx_handler.add_crl_metrics(verifier)
    ticket_core.log_ticket(verifier.result)

    return verifier.to_dict()

@celery_app.task()
def ocsp_verifier(queue: dict):
    verifier = OCSP_verifier(queue)
    data = verifier.request_ocsp()
    verifier.verify_ocsp(data)
    verifier.get_ocsp_content(data)
    
    influx_handler.add_ocsp_metrics(verifier)
    ticket_core.log_ticket(verifier.result)

    return verifier.to_dict()


@celery_app.task()
def send_notification(notif: dict):
    notif_obj = Tickets_Schema.model_validate(notif)
    # msg = telegram_util.send_ticket_notification(notif_obj)
    msg = ""
    ticket_core.update_last_notif(notif_obj)
    
    return msg
    
@celery_app.task()
def verifier_notification():
    notifs =  ticket_core.get_ticket_for_realtime_notif()
    
    if(notifs.__len__()>0):
        for notif in notifs:
            send_notification.delay(notif.model_dump())
    
    return notifs.__len__()

@celery_app.task()
def send_daily_report():
    report = influx_handler.query_report()
    telegram_util.send_daily_report(report)
    return "Daily report sent"

@celery_app.task()
def send_reguler_hello():
    telegram_util.send_hello()
    return "Hello sent"

@celery_app.task()
def send_ticket_report():
    tickets = ticket_core.get_ticket_for_reguler_report()
    telegram_util.send_ticket_report(tickets)
    return "Ticket report sent"
    
