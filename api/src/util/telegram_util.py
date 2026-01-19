
import requests
import os
import datetime
from src.db_schema.ticket_schema import Tickets_Schema

import logging
import src.parameters as param
logger = logging.getLogger(param.LOGGER_NAME)


# def regular_report(dict):

def send_message(header:str, message:str=""):
    telegram_bot_token = param.TELEGRAM_BOT_TOKEN
    telegram_chat_id = param.TELEGRAM_CHAT_ID
    node_name = param.NODE_NAME
    send_notif = int(param.SEND_NOTIF)

    TOKEN = telegram_bot_token
    chat_id = telegram_chat_id
    current_date_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    message =  f"{current_date_time} - {node_name} - {header} \n{message}"
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage?chat_id={chat_id}&text={message}"

    # logger.debug(url)
    result = url
    if(send_notif == 1):
        result = requests.get(url).json()
    else:
        logger.info(f'SENDING NOTIFICATION\n\n {message}')
    # logging.info(result)

    return result

def send_reguler_report(report_input:dict):
    logger.debug(report_input)
    msg = ""
    current_date_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    start_date_time = (datetime.datetime.now() - datetime.timedelta(hours=24)).strftime("%Y-%m-%d %H:%M:%S")
    msg += f'Start Time: {start_date_time}\n'
    msg += f'End Time: {current_date_time}\n'
    for key in report_input.keys():
        msg += f'{key.upper()} \n'

        logger.debug(report_input[key])
        for ca_name, value in report_input[key].items():
            value_ = round(int(value), 2)
        
            if(value_ < 100 and value_ >= 50):
                msg += f'\U0000203C {ca_name} : {value_}% \n'
            elif(value_ < 50):
                msg += f'\U0001F525 {ca_name} : {value_}% \n'
            else:
                msg += f'\U00002705 {ca_name} : {value_}% \n'
                
        
        msg += "\n"
    
    send_message("Reguler Report", msg)
    return msg

def send_ticket_notification(ticket:Tickets_Schema):
    msg = ""
    result = ""
    if(ticket.resolve):
        msg += f'\U00002705 {ticket.message} \n'
        msg += f'Created : {ticket.start.strftime("%Y-%m-%d %H:%M:%S")} \n'
        msg += f'Resolved : {ticket.end.strftime("%Y-%m-%d %H:%M:%S")}\n'
        msg += f'CN : {ticket.cn}\n'
        msg += f'URL : {ticket.url}\n'
        result = send_message("Ticket Resolve", msg)
    else:
        msg += f'\U0001F525 {ticket.message} \n'
        msg += f'Created : {ticket.start.strftime("%Y-%m-%d %H:%M:%S")}\n'
        msg += f'CN : {ticket.cn}\n'
        msg += f'URL : {ticket.url}\n'
        result = send_message("Ticket Notifications", msg)
    
    logger.debug(result)

    return result

def send_daily_report(report_input:dict):
    logger.debug(report_input)
    msg = ""
    current_date_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    start_date_time = (datetime.datetime.now() - datetime.timedelta(hours=24)).strftime("%Y-%m-%d %H:%M:%S")
    msg += f'Daily Report \n'
    msg += f'Start Time: {start_date_time}\n'
    msg += f'End Time: {current_date_time}\n\n'
    for key in report_input.keys():
        msg += f'{key.upper()} \n'

        logger.debug(report_input[key])
        for ca_name, value in report_input[key].items():
            value_ = round(int(value), 2)
        
            if(value_ < 100 and value_ >= 50):
                msg += f'\U0000203C {ca_name} : {value_}% \n'
            elif(value_ < 50):
                msg += f'\U0001F525 {ca_name} : {value_}% \n'
            else:
                msg += f'\U00002705 {ca_name} : {value_}% \n'
                
        
        msg += "\n"
    
    send_message("Daily Report", msg)
    return msg

def send_ticket_report(ticket_list:list[Tickets_Schema]):
    msg = ""
    msg += f'Ticket Report Last 24 Hours \n\n'
    for ticket in ticket_list:
        if(ticket.resolve):
            msg += f'\U00002705 {ticket.message} \n'
            msg += f'Created : {ticket.start.strftime("%Y-%m-%d %H:%M:%S")} \n'
            msg += f'Resolved : {ticket.end.strftime("%Y-%m-%d %H:%M:%S")}\n'
            msg += f'CN : {ticket.cn}\n'
            msg += f'URL : {ticket.url}\n\n'
        else:
            msg += f'\U0001F525 {ticket.message} \n'
            msg += f'Created : {ticket.start.strftime("%Y-%m-%d %H:%M:%S")}\n'
            msg += f'CN : {ticket.cn}\n'
            msg += f'URL : {ticket.url}\n\n'
    
    result = send_message("Ticket Report", msg)
    logger.debug(result)
    return result

def send_hello():
    msg = "Hello from Monitoring PSRE \U0001F4AA"
    result = send_message("Regular Hello", msg)
    logger.debug(result)
    return result