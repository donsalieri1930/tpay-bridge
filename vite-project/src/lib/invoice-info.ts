import { useEffect, useState } from 'react'

import { getInvoiceInfo, HttpError, readUuid } from './api'
import type { InvoiceInfo } from '../types'

export function getAvailablePayers(invoice: InvoiceInfo | null) {
  if (!invoice) {
    return []
  }

  return [
    { id: 0 as const, name: invoice.payer0Name, email: invoice.payer0Email },
    { id: 1 as const, name: invoice.payer1Name, email: invoice.payer1Email },
  ].filter((payer) => {
    const name = typeof payer.name === 'string' ? payer.name.trim() : ''
    const email = typeof payer.email === 'string' ? payer.email.trim() : ''
    return Boolean(name && email)
  })
}

export function useInvoiceInfo(title: string) {
  const [invoice, setInvoice] = useState<InvoiceInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    document.title = title
  }, [title])

  useEffect(() => {
    const uuid = readUuid()
    if (!uuid) {
      setInvalid(true)
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadInvoice() {
      try {
        const response = await getInvoiceInfo(uuid)

        if (cancelled) {
          return
        }

        setInvoice(response)
        setLoading(false)
      } catch (error) {
        if (cancelled) {
          return
        }

        if (error instanceof HttpError && error.status === 404) {
          setInvalid(true)
        } else {
          setInvalid(true)
        }
        setLoading(false)
      }
    }

    loadInvoice()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    invoice,
    loading,
    invalid,
  }
}
