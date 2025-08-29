from pathlib import Path

import httpx
from jwcrypto.jwk import JWK
from jwcrypto.jws import JWS

from settings import HTTPX_REQUEST_TIMEOUT, BASE_DIR


async def fetch_jwk_remote(url: str) -> JWK:
    """
    Fetch a PEM certificate from the internet and construct a JWK.
    """
    async with httpx.AsyncClient(timeout=HTTPX_REQUEST_TIMEOUT) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        pem = resp.content
    return JWK.from_pem(pem)


def read_jwk_local(pem_file='test.pem', pem_dir='test') -> JWK:
    """
    Read a PEM certificate from a local file and construct a JWK.
    """
    pem_path = BASE_DIR / pem_dir / pem_file
    pem = Path(pem_path).read_bytes()
    return JWK.from_pem(pem)


def verify_detached_jws(header: str, body: bytes, key: JWK) -> None:
    """
    Verify a JWS with detached payload. Raises on validation failure.
    :param header: X-JWS-Signature header
    :param body: Request raw body
    :param key: JWS certificate
    """
    obj = JWS()
    obj.deserialize(header)
    obj.verify(key, detached_payload=body)
