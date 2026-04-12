from typing import Any

import httpx
from sqlalchemy.ext.asyncio import AsyncConnection

from db import query_and_cast, execute_sql_from_file
from models import Invoice, InvoicePayer, TpayAccessToken
from settings import TPAY_TOKEN_URL, HTTPX_REQUEST_TIMEOUT, FRONTEND_URL, DONATION_DESCRIPTION


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
            invoice.payer_0_email.strip()
        )
    return InvoicePayer(
        invoice.payer_1_last_name + ' ' + invoice.payer_1_name,
        invoice.payer_1_email.strip()
    )


async def create_tpay_transaction(
        token: TpayAccessToken,
        invoice: Invoice,
        payer: int | bool,
        uuid: str,
        is_donation: bool = False,
        # Custom ammount should be passed only for donations. For
        # invoice payments ammount must be determined by the invoice.
        amount: str | None = None
) -> Any:
    payer_return_url = (
        f'{FRONTEND_URL}/donate?uuid={uuid}'
        if is_donation
        else f'{FRONTEND_URL}/?uuid={uuid}'
    )

    payload = {
        'amount': amount or str(invoice.amount),
        'description': DONATION_DESCRIPTION if is_donation else f'{invoice.invoice_name}, {invoice.billing_month}',
        'payer': get_invoice_payer(invoice, payer)._asdict(),
        'hiddenDescription': f'donation {invoice.invoice_id}' if is_donation else invoice.invoice_id,
        'callbacks': {
            'payerUrls': {
                'success': payer_return_url,
                'error': payer_return_url,
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
