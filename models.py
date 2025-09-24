from decimal import Decimal
from typing import NamedTuple

from utils import mask_last_word, mask_first_word, mask_email


class Invoice(NamedTuple):
    payers: str
    invoice_name: str
    amount: Decimal
    invoice_id: str
    billing_month: str
    payer_0_email: str
    payer_1_email: str
    payer_0_name: str
    payer_1_name: str
    paid: int
    payer_0_last_name: str
    payer_1_last_name: str

    @property
    def public_dict(self):
        """
        Return a public (censored) version as a dictionary.
        """
        return {
            'payers': mask_last_word(self.payers.upper()),
            'invoiceName': mask_first_word(self.invoice_name.upper()),
            'amount': str(self.amount).replace('.', ','),
            'invoiceID': self.invoice_id,
            'billingMonth': self.billing_month,
            'payer0Email': mask_email(self.payer_0_email),
            'payer1Email': mask_email(self.payer_1_email),
            'payer0Name': self.payer_0_name,
            'payer1Name': self.payer_1_name,
            'paid': bool(self.paid),
        }


class InvoicePayer(NamedTuple):
    name: str
    email: str


class TpayAccessToken(NamedTuple):
    issued_at: int
    scope: str
    token_type: str
    expires_in: int
    client_id: str
    access_token: str
