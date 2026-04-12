import type { InvoiceInfo, PaymentRedirect, PayerIndex } from '../types'

export class HttpError extends Error {
  status: number

  constructor(status: number) {
    super(`HTTP ${status}`)
    this.status = status
  }
}

function buildUrl(path: string, params: Record<string, string>) {
  const url = new URL(path, window.location.origin)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  return url
}

async function fetchJson<T>(input: URL): Promise<T> {
  const response = await fetch(input)
  if (!response.ok) {
    throw new HttpError(response.status)
  }
  return response.json() as Promise<T>
}

export function readUuid() {
  return new URLSearchParams(window.location.search).get('uuid') ?? ''
}

export function getInvoiceInfo(uuid: string) {
  return fetchJson<InvoiceInfo>(buildUrl('/api/info', { uuid }))
}

export function createInvoicePayment(uuid: string, payer: PayerIndex) {
  return fetchJson<PaymentRedirect>(
    buildUrl('/api/create', { uuid, payer: String(payer) }),
  )
}

export function createDonationPayment(
  uuid: string,
  payer: PayerIndex,
  amount: number,
) {
  return fetchJson<PaymentRedirect>(
    buildUrl('/api/create-donation', {
      uuid,
      payer: String(payer),
      amount: String(amount),
    }),
  )
}
