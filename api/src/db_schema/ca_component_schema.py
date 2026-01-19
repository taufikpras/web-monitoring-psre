from src.db_schema.ca_schema import CA_Schema
from src.db_schema.crl_schema import CRL_Schema
from src.db_schema.ocsp_schema import OCSP_Schema

class CA_Component_Schema():
    ca: CA_Schema
    crls: list[CRL_Schema]
    ocsps: list[OCSP_Schema]

    def __init__(self) -> None:
        self.ca = None
        crls = []
        ocsps = []

    def model_dump(self):
        return {
            "ca":self.ca.model_dump(),
            "crls":[crl.model_dump() for crl in self.crls],
            "ocsps":[ocsp.model_dump() for ocsp in self.ocsps]
        }