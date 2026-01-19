import logging
from logging.handlers import TimedRotatingFileHandler
from src import parameters
import traceback
import sys
import os

def log_exceptions(type, value, tb):
    for line in traceback.TracebackException(type, value, tb).format(chain=True):
        logging.exception(line)
    logging.exception(value)

    sys.__excepthook__(type, value, tb) # calls default excepthook

# setup loggers
def setup_loggers():
    # logging.config.fileConfig('src/logging.conf', disable_existing_loggers=False)
    # create logger
    logger = logging.getLogger(parameters.LOGGER_NAME)

    # set logging level
    logger.setLevel(logging.DEBUG)

    # create rotating file handler and set level to debug
    log_path = './../logs/'
    log_file = os.path.join(log_path, 'app.log')


    if(os.path.isfile(log_file) == False):
        os.makedirs(log_path)
    handler = TimedRotatingFileHandler(log_file,when='D')
    handler.setLevel(logging.DEBUG)

    # create formatter
    formatter = logging.Formatter('%(name)s - %(asctime)s - %(levelname)s - [%(filename)s:%(funcName)s:%(lineno)d] - %(message)s')
    # formatter = logging.Formatter("{'name':%(name)s,'time':%(asctime)s,'severity':%(levelname)s,'file':%(filename)s:%(funcName)s:%(lineno)d,'messages':%(message)s}")
    # add formatter to rotating file handler
    handler.setFormatter(formatter)

    # # add ch to logger
    logger.addHandler(handler)

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    stream_handler.setLevel(logging.DEBUG)
    logger.addHandler(stream_handler)

    sys.excepthook = log_exceptions