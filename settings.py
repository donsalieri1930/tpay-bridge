SANDBOX = False
CHARGEBACK_UPDATES_STATUS = True
HTTPX_REQUEST_TIMEOUT = 5.0
TPAY_TOKEN_URL = 'https://api.tpay.com'
TPAY_CERT_URL = 'https://secure.tpay.com/x509/notifications-jws.pem'
FRONTEND_URL = 'https://pay.wegielek.edu.pl'

if SANDBOX:
    TPAY_CERT_URL = 'https://secure.sandbox.tpay.com/x509/notifications-jws.pem'
    TPAY_TOKEN_URL = 'https://openapi.sandbox.tpay.com'

import os
import logging
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

DATABASE_URI = os.getenv('DATABASE_URI')
TPAY_CLIENT_ID = os.getenv('TPAY_CLIENT_ID')
TPAY_SECRET = os.getenv('TPAY_SECRET')

assert all([DATABASE_URI, TPAY_CLIENT_ID, TPAY_SECRET, ...])

logging.getLogger().setLevel(logging.INFO)