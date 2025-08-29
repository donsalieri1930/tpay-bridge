import asyncio
from time import time

import httpx

from models import TpayAccessToken
from settings import TPAY_CLIENT_ID, TPAY_SECRET, TPAY_TOKEN_URL, HTTPX_REQUEST_TIMEOUT


class TpayAccessTokenStorage:
    def __init__(self, skew = 60) -> None:
        self.skew = skew
        self._token: TpayAccessToken | None = None
        self._lock = asyncio.Lock()

    def is_expired(self):
        if self._token is None: return True
        expires_at = self._token.issued_at + self._token.expires_in
        return time() >= (expires_at - self.skew)

    @staticmethod
    async def _fetch_tpay_access_token() -> TpayAccessToken:
        async with httpx.AsyncClient(timeout=HTTPX_REQUEST_TIMEOUT) as client:
            response = await client.post(
                f'{TPAY_TOKEN_URL}/oauth/auth',
                data={
                    "client_id": TPAY_CLIENT_ID,
                    "client_secret": TPAY_SECRET,

                }
            )
            response.raise_for_status()
            return TpayAccessToken(**response.json())

    async def get_access_token(self) -> TpayAccessToken:
        if not self.is_expired():
            return self._token
        async with self._lock:
            if not self.is_expired():
                return self._token
            self._token = await self._fetch_tpay_access_token()
            return self._token
