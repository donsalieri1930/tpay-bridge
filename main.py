import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import PlainTextResponse

from db import ConnectionDep
from settings import CHARGEBACK_UPDATES_STATUS, TPAY_CERT_URL
from signature import verify_detached_jws, fetch_jwk_remote
from storage import TpayAccessTokenStorage
from tpay import create_tpay_transaction, get_invoice, update_invoice_status

app = FastAPI()
tpay_token = TpayAccessTokenStorage()


@app.get("/info")
async def root(uuid: str, connection: ConnectionDep):
    invoice = await get_invoice(connection, uuid)
    if not invoice:
        raise HTTPException(404)
    return invoice.public_dict


@app.get('/create')
async def create(uuid: str, payer: int, connection: ConnectionDep):
    invoice = await get_invoice(connection, uuid)
    if not invoice:
        raise HTTPException(404)
    if invoice.paid:
        raise HTTPException(409)
    token = await tpay_token.get_access_token()
    result = await create_tpay_transaction(token, invoice, payer, uuid)
    logging.info(
        'created invoiceID=%s uuid=%s payer=%d title=%s',
        invoice.invoice_id, uuid, payer, result['title']
    )
    return {'url': result['transactionPaymentUrl']}


@app.post('/callback')
async def callback(request: Request, connection: ConnectionDep):
        body = await request.body()
        key = await fetch_jwk_remote(TPAY_CERT_URL)
        verify_detached_jws(
            request.headers['X-JWS-Signature'],
            body,
            key
        ) # raises on invalid signature
        form = await request.form()
        tr_id = form['tr_id']
        tr_status = form['tr_status']
        tr_crc = form['tr_crc']

        match tr_status:
            case 'TRUE':
                boolean_status = True
            case 'CHARGEBACK':
                # Warning, If an invoice was paid multiple times, manual
                # chargeback will set invoice status to unpaid.
                boolean_status = not CHARGEBACK_UPDATES_STATUS
            case _:
                boolean_status = False

        await update_invoice_status(connection, tr_crc, boolean_status, tr_id)
        logging.info(
            'callback invoiceID=%s title=%s status=%s',
            tr_crc, tr_id, tr_status
        )
        return PlainTextResponse('TRUE')


@app.get('/token-test')
@app.head('/token-test')
async def token_test():
    token = await tpay_token.get_access_token()
    return token.access_token[0]
