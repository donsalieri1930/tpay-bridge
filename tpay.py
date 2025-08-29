from typing import Any

import httpx
from sqlalchemy.ext.asyncio import AsyncConnection

from db import query_and_cast, execute_sql_from_file
from models import Invoice, InvoicePayer, TpayAccessToken
from settings import TPAY_TOKEN_URL, HTTPX_REQUEST_TIMEOUT, FRONTEND_URL


async def get_invoice(connection: AsyncConnection, uuid: str) -> Invoice | None:
    rows = await query_and_cast(
        connection,
        'invoice.sql',
        Invoice,
        {'uuid': uuid}
    )
    return rows[0] if rows else None


def get_invoice_payer(invoice: Invoice, payer: int | bool) -> InvoicePayer:
    if not payer:
        return InvoicePayer(
            invoice.payer_0_last_name + ' ' + invoice.payer_0_name,
            invoice.payer_0_email
        )
    return InvoicePayer(
        invoice.payer_1_last_name + ' ' + invoice.payer_1_name,
        invoice.payer_1_email
    )


async def create_tpay_transaction(
        token: TpayAccessToken,
        invoice: Invoice,
        payer: int | bool) -> Any:

    payload = {
        'amount': str(invoice.amount),
        'description': f'{invoice.invoice_name}, {invoice.billing_month}',
        'payer': get_invoice_payer(invoice, payer)._asdict(),
        'hiddenDescription': invoice.invoice_id,
        'callbacks': {
            'payerUrls': {
                'success': FRONTEND_URL + '/success/',
                'error': FRONTEND_URL + '/error/'
            }
        }
    }
    async with httpx.AsyncClient(timeout=HTTPX_REQUEST_TIMEOUT) as client:
        response = await client.post(
            f'{TPAY_TOKEN_URL}/transactions',
            json=payload,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {token.access_token}'
            }
        )
        response.raise_for_status()
        return response.json()


async def update_invoice_status(connection: AsyncConnection, invoice_id: str, paid: bool, tr_id: str | None = None) -> None:
    await execute_sql_from_file(
        connection,
        'status.sql',
        {
            'invoice_id': invoice_id,
            'paid': int(paid),
            'tr_id': tr_id
        }
    )
