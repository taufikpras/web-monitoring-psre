import os
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.x509.base import Certificate, CertificateRevocationList
from cryptography.x509.oid import NameOID

from cryptography.hazmat.primitives import serialization

import logging
import src.parameters as param
logger = logging.getLogger(param.LOGGER_NAME)

from src.exception.cert_exception import EncodingException

CRL_NUMBER_OID = x509.oid.ExtensionOID.CRL_NUMBER
AUTHORITY_KEY_IDENTIFIER_OID = x509.ExtensionOID.AUTHORITY_KEY_IDENTIFIER

def read_file_input(path, res:list):
    # res = []
    for path_ in os.listdir(path):
        # check if current path is a file
        if os.path.isfile(os.path.join(path, path_)):
            res.append(os.path.join(path, path_))
        else:
            read_file_input(os.path.join(path, path_), res)
    return res

def check_is_certificate(path):
    returnval = False
    try:
        with open(path, 'rb') as cert_file:  # try open file in text mode
            certdata = cert_file.read()
        returnval = x509.load_pem_x509_certificate(certdata, default_backend())
        returnval = True
    except:  # if fail then file is non-text (binary)
        logger.debug("Not in PEM")
    
    try:
        with open(path, 'rb') as cert_file:    
            certdata = cert_file.read()
        returnval = x509.load_der_x509_certificate(certdata, default_backend())
        returnval = True
    except:
        logger.debug("Not in DER")
        
    return returnval

def read_cert_from_file(path) -> Certificate | None:
    returnval = None
    
    try:
        with open(path, 'rb') as cert_file:  # try open file in text mode
            certdata = cert_file.read()
        returnval = x509.load_pem_x509_certificate(certdata, default_backend())

    except:  # if fail then file is non-text (binary)
        logger.debug(f"{path} : Not in PEM")
    
    try:
        with open(path, 'rb') as cert_file:    
            certdata = cert_file.read()
        returnval = x509.load_der_x509_certificate(certdata, default_backend())

    except:
        logger.debug(f"{path} : Not in DER")
        
    if returnval == None:
        raise EncodingException("Encoding Format Unknown")
        
    return returnval

def read_cert_from_pem_str(pem: str) -> Certificate | None:
    try:
        returnval = x509.load_pem_x509_certificate(str.encode(pem), default_backend())
        return returnval
    except Exception as e:
        logger.error("Encoding Error not in PEM",exc_info=True)
        raise EncodingException("Encoding Error not in PEM")
        return None
    return None

def read_crl_from_content(crldata) -> CertificateRevocationList | None:
    crl = None
    try:
        crl = x509.load_pem_x509_crl(crldata, default_backend())
    except:
        logger.debug("CRL not in pem")

    try:
        crl = x509.load_der_x509_crl(crldata, default_backend())
    except:
        logger.debug("CRL not in der")
    
    return crl
        

def get_issuer_cn(cert: Certificate):
    cn = cert.issuer.get_attributes_for_oid(NameOID.COMMON_NAME)[0].value
    return cn

def get_subject_cn(cert: Certificate):
    cn = cert.subject.get_attributes_for_oid(NameOID.COMMON_NAME)[0].value
    return cn

def get_subject_dn(cert: Certificate):
    dn = cert.subject.rfc4514_string()
    return dn

def get_issuer_dn(cert: Certificate):
    dn = cert.issuer.rfc4514_string()
    return dn

def get_authorithy_key_identifier(cert: Certificate):
    # retur self.userWrapper.extensions.get_extension_for_oid(x509.ExtensionOID.AUTHORITY_KEY_IDENTIFIER).value.key_identifier.hex()
    authorityKeyId = cert.extensions.get_extension_for_class(x509.AuthorityKeyIdentifier).value.key_identifier.hex()
    return str(authorityKeyId)
    
def get_subject_key_identifier(cert: Certificate):
    subjectKeyID = cert.extensions.get_extension_for_oid(x509.ExtensionOID.SUBJECT_KEY_IDENTIFIER).value.digest.hex()
    return str(subjectKeyID)

def get_is_ca(cert: Certificate):
    val = cert.extensions.get_extension_for_oid(x509.ExtensionOID.BASIC_CONSTRAINTS).value.ca
    return val

def get_crls(cert: Certificate) -> list[str]:
    urls = []
    try:
        crldps = cert.extensions.get_extension_for_oid(x509.ExtensionOID.CRL_DISTRIBUTION_POINTS).value
        for crldp in crldps:
            full_name = crldp.full_name
            for url in full_name:
                urls.append(url.value)
    except x509.ExtensionNotFound:
        logger.warning(f"{get_subject_dn(cert)} : CRL DP Extension not found")
    
    return urls

def get_ocsps(cert: Certificate) -> list[str]:
    ocsp = []
    try:
        if (len(cert.extensions.get_extension_for_oid(
                x509.ExtensionOID.AUTHORITY_INFORMATION_ACCESS).value) > 0):
            # ocspList = self.x509wrapper.extensions.get_extension_for_oid(x509.ExtensionOID.AUTHORITY_INFORMATION_ACCESS).value[1].access_location.value
            ocspList = cert.extensions.get_extension_for_oid(
                x509.ExtensionOID.AUTHORITY_INFORMATION_ACCESS).value
            for i in ocspList:
                if (i.access_method.dotted_string == "1.3.6.1.5.5.7.48.1"):
                    ocsp.append(i.access_location.value)
    except x509.ExtensionNotFound:
        return ocsp
    
    return ocsp

def serialize_cert(cert:Certificate):
    pem = cert.public_bytes(encoding=serialization.Encoding.PEM)
    return pem


