import requests
import hashlib

def check_url(url:str):
    if url.find("http://") != -1 or url.find("https://") != -1:
        return url
    else:
        return "https://"+url
    
def download_and_hash(url:str):
    response = requests.get(url)
    if(response.status_code == 200):
        return hashlib.sha256(response.content).hexdigest()
    return None
