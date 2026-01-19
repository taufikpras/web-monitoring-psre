import json

class Queue_Schema():
    name:str
    url: str
    issuer_keyid: str
    issuer_dn: str
    issuer_cn: str
    user_file_pem: str=""
    issuer_file_pem: str=""
    hash=""
    
    # def __init__(self, name:str,
    #              url:str,
    #              issuer_keyid:str,
    #              issuer_dn:str) :
    #     self.name = name
    #     self.url = url
    #     self.issuer_dn = issuer_dn
    #     self.issuer_keyid = issuer_keyid

    @classmethod
    def from_dict(cls,input:dict):
        obj = cls()
        for key, value in input.items():
            setattr(obj, key, value)
        return obj

    def toJson(self):
        return json.dumps(
            self,
            default=lambda o: o.__dict__, 
            sort_keys=True,
            indent=4)
    