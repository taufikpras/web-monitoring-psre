import os

def check_param(env_name:str, default):
    if(os.environ.get(env_name) == None):    
        os.environ[env_name] = default
    
    return os.environ.get(env_name)

LOGGER_NAME = check_param("LOGGER","monitoring_psre")
    
TEMP = check_param("TEMP","/app/tmp/")
INPUT_PATH = check_param("INPUT_PATH","/app/input/")
DATA_PATH = check_param("DATA_PATH","/app/data/")

MONGO_HOST = check_param("MONGO_HOST","mongo")
MONGO_USER = check_param("MONGO_USER","root")
MONGO_PASS = check_param("MONGO_PASS","1234qweR")
MONGO_PORT = check_param("MONGO_PORT","27017")

INFLUX_URL = check_param("INFLUX_URL","")
INFLUX_TOKEN = check_param("INFLUX_TOKEN","")
INFLUX_ORG = check_param("INFLUX_ORG","")
INFLUX_BUCKET = check_param("INFLUX_BUCKET","")

CELERY_ENABLE_UTC = check_param("CELERY_ENABLE_UTC","False")
TZ = check_param("TZ","Asia/Jakarta")
REDIS_URL = check_param("REDIS_URL","redis")
REDIS_PORT = check_param("REDIS_PORT","6379")
REDIS_TOKEN = check_param("REDIS_TOKEN","")
REDIS_PASSWORD = check_param("REDIS_PASSWORD","")

TELEGRAM_BOT_TOKEN = check_param("TELEGRAM_BOT_TOKEN","")
TELEGRAM_CHAT_ID = check_param("TELEGRAM_CHAT_ID","")
NODE_NAME = check_param("NODE_NAME","")
SEND_NOTIF = check_param("SEND_NOTIF","1")
TIME_INTERVAL = int(check_param("TIME_INTERVAL","300"))

# read from file
API_VERSION = "0.0.1"
for vfile in ["/api/version.txt", "/api/versions", "api/version.txt", "api/versions", "version.txt", "versions"]:
    if os.path.exists(vfile):
        with open(vfile, "r") as f:
            API_VERSION = f.read().strip()
            break