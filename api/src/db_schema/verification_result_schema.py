
class Result_Schema():
    overall: int = 0
    availability: int = 0
    response_time: int = 0
    message: list[str] = []

    issuer_dn: str = ""
    issuer_keyid: str = ""
    url:str = ""

    def __init__(self) -> None:
        self.overall = 0
        self.availability = 0
        self.response_time = 0
        self.message = []

        self.issuer_dn: str = ""
        self.issuer_keyid: str = ""
        self.url:str = ""

    @classmethod
    def from_dict(cls,input:dict):
        obj = cls()
        for key, value in input.items():
            setattr(obj, key, value)
        return obj
    
    def get_dict_result(self):
        res = self.__dict__
        result = {}

        for key, value in res.items(): 
            if isinstance(value, int) or isinstance(value, float):
                
                result[key] = value
        
        return result

class CRL_Result_Schema(Result_Schema):
    validity: int = 0
    signature: int = 0
    time_delta: int = 0 

    def __init__(self) -> None:
        super().__init__()
        self.validity = 0
        self.signature = 0
        self.time_delta = 0 

class OCSP_Result_Schema(Result_Schema):
    verification: int = 0

    def __init__(self) -> None:
        super().__init__()
        self.verification = 0


