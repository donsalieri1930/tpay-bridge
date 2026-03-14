import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { AppShell, Card } from '../components/app-shell'
import { InlineError, PayerButtons, PrimaryButton, SkeletonBlock } from '../components/common'
import { createInvoicePayment, getInvoiceInfo, HttpError, readUuid } from '../lib/api'
import type { InvoiceInfo, PayerIndex } from '../types'

export function InvoicePage() {
  const [invoice, setInvoice] = useState<InvoiceInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [invalid, setInvalid] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [payer, setPayer] = useState<PayerIndex>(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const uuid = readUuid()
    if (!uuid) {
      setInvalid(true)
      setLoading(false)
      return
    }

    getInvoiceInfo(uuid)
      .then((response) => {
        setInvoice(response)
        setLoading(false)
      })
      .catch((error) => {
        if (error instanceof HttpError && error.status === 404) {
          setInvalid(true)
        } else {
          setLoadError(true)
        }
        setLoading(false)
      })
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!invoice || invoice.paid || busy) {
      return
    }

    setBusy(true)
    setError('')

    try {
      const payment = await createInvoicePayment(readUuid(), payer)
      window.location.assign(payment.url)
    } catch {
      setError('Nie udało się rozpocząć płatności. Spróbuj ponownie.')
      setBusy(false)
    }
  }

  async function handleCopyInvoiceId() {
    const text = invoice?.invoiceID ?? ''
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  const availablePayers = invoice
    ? [
        { id: 0 as const, name: invoice.payer0Name, email: invoice.payer0Email },
        { id: 1 as const, name: invoice.payer1Name, email: invoice.payer1Email },
      ].filter((payer) => {
        const name = typeof payer.name === 'string' ? payer.name.trim() : ''
        const email = typeof payer.email === 'string' ? payer.email.trim() : ''
        return Boolean(name && email)
      })
    : []

  if (loading) {
    return (
      <AppShell>
        <Card>
          <div className="min-h-[30rem] space-y-7">
            <div className="space-y-3">
              <SkeletonBlock className="h-8 w-56" />
              <SkeletonBlock className="h-5 w-32" />
              <SkeletonBlock className="h-11 w-40" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SkeletonBlock className="h-14 w-full" />
              <SkeletonBlock className="h-14 w-full" />
              <SkeletonBlock className="h-14 w-full" />
            </div>
            <div className="space-y-3">
              <SkeletonBlock className="h-4 w-16" />
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
            </div>
            <SkeletonBlock className="h-14 w-full" />
          </div>
        </Card>
      </AppShell>
    )
  }

  if (invalid || !invoice) {
    if (loadError) {
      return (
        <AppShell>
          <div className="py-12 text-center text-sm text-ink/68">
            Nie udało się wczytać płatności.
          </div>
        </AppShell>
      )
    }
    return (
      <AppShell>
        <div className="py-12 text-center text-sm text-ink/68">
          Ten link jest nieprawidłowy.
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <Card>
        <form className="space-y-7" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <h1 className="text-[1.55rem] font-semibold tracking-tight text-ink">
              Płatność rachunku
            </h1>
            <div className="flex items-center gap-2">
              <div className="font-mono text-sm text-ink/72">{invoice.invoiceID}</div>
              <button
                aria-label="Kopiuj numer rachunku"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ember-100 bg-white/70 text-ink/72 transition hover:border-ember-300 hover:bg-white"
                onClick={handleCopyInvoiceId}
                title={copied ? 'Skopiowano' : 'Kopiuj numer rachunku'}
                type="button"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="rounded-[1.35rem] bg-ember-50/55 px-4 py-2">
            <div className="flex items-start justify-between gap-4 border-b border-ember-100/80 py-3">
              <div className="text-sm text-ink/58">Dotyczy</div>
              <div className="text-right text-sm font-medium text-ink/88">{invoice.invoiceName}</div>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-ember-100/80 py-3">
              <div className="text-sm text-ink/58">Okres rozliczeniowy</div>
              <div className="min-w-0 text-right text-sm font-medium text-ink/88">{invoice.billingMonth}</div>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <div className="text-sm text-ink/58">Status</div>
              <div
                className={
                  invoice.paid
                    ? 'min-w-0 text-right text-sm font-medium text-emerald-700'
                    : 'min-w-0 text-right text-sm font-medium text-ink/60'
                }
              >
                {invoice.paid ? 'Opłacony' : 'Nieopłacony'}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-semibold tracking-[0.01em] text-ink/75">Kwota</div>
            <div className="text-[2.15rem] font-semibold tracking-tight text-ink">
              {invoice.amount} zł
            </div>
          </div>

          {!invoice.paid && availablePayers.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold tracking-[0.01em] text-ink/75">Płacący</h2>
              <PayerButtons
                active={payer}
                onChange={setPayer}
                payers={availablePayers}
              />
            </section>
          ) : null}

          {!invoice.paid && availablePayers.length === 0 ? (
            <div className="text-sm text-ink/60">
              Brak danych płacącego. Nie można rozpocząć płatności.
            </div>
          ) : null}

          {error ? <InlineError message={error} /> : null}

          {!invoice.paid && availablePayers.length > 0 ? (
            <PrimaryButton busy={busy}>Przejdź do Tpay</PrimaryButton>
          ) : invoice.paid ? (
            <div className="text-center text-sm text-ink/60">
              Nie jest wymagane żadne działanie.
            </div>
          ) : null}
        </form>
      </Card>
    </AppShell>
  )
}
