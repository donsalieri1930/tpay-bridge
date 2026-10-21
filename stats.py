from datetime import date

import httpx
from fastapi import APIRouter

from db import ConnectionDep, execute_sql_from_file
from settings import HTTPX_REQUEST_TIMEOUT, STATS_START

router = APIRouter(prefix='/stats')


def badge(label: str, message: str):
    # Shields.io reads this JSON to render a README badge.
    return dict(schemaVersion=1, label=label, message=message, color='blue', cacheSeconds=3600)


@router.get('/volume')
async def payment_volume_badge(connection: ConnectionDep):
    result = await execute_sql_from_file(
        connection, 'volume.sql', {'start_month': STATS_START.strftime('%Y-%m')}
    )
    total = int(result.scalar_one())
    message = f'{total:,.0f} PLN'
    # Add an approximate USD value using the latest published NBP rate.
    try:
        async with httpx.AsyncClient(timeout=HTTPX_REQUEST_TIMEOUT) as client:
            response = await client.get('https://api.nbp.pl/api/exchangerates/rates/a/usd/?format=json')
            response.raise_for_status()
            rate = response.json()['rates'][0]['mid']
        message += f' / {int(total / rate):,} USD'
    except httpx.HTTPError:
        # Keep the PLN badge available if the exchange-rate request fails.
        pass
    return badge('payment volume', message)


@router.get('/days')
async def production_badge():
    # Service age comes from the configured deployment date, not the database.
    days = (date.today() - STATS_START).days
    return badge('days in production', str(days))
