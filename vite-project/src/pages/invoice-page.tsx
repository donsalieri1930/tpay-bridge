import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { AppShell, Card } from '../components/app-shell'
import { InlineError, InvalidLinkCard, PayerButtons, PrimaryButton, SkeletonBlock, TextSkeleton } from '../components/common'
import { createInvoicePayment, readUuid } from '../lib/api'
import { getAvailablePayers, useInvoiceInfo } from '../lib/invoice-info'
import type { PayerIndex } from '../types'

export function InvoicePage() {
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [payer, setPayer] = useState<PayerIndex>(0)
  const { invoice, loading, invalid } = useInvoiceInfo('Rachunek | Węgielek')

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
      setError('Nie udało się utworzyć transakcji.')
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

  const availablePayers = getAvailablePayers(invoice)

  if (!loading && (invalid || !invoice)) {
    return (
      <AppShell>
        <InvalidLinkCard />
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
              {loading ? (
                <>
                  <TextSkeleton
                    className="font-mono text-sm text-ink/72"
                    skeletonClassName="h-4"
                    wrapperClassName="w-36"
                  />
                  <button
                    aria-label="Kopiuj numer rachunku"
                    className="invisible inline-flex h-8 w-8 items-center justify-center rounded-full border border-ember-100 bg-white/70 text-ink/40"
                    disabled
                    type="button"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="font-mono text-sm text-ink/72">{invoice!.invoiceID}</div>
                  <button
                    aria-label="Kopiuj numer rachunku"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ember-100 bg-white/70 text-ink/72 transition hover:border-ember-300 hover:bg-white"
                    onClick={handleCopyInvoiceId}
                    title={copied ? 'Skopiowano' : 'Kopiuj numer rachunku'}
                    type="button"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="rounded-[1.35rem] bg-ember-50/55 px-4 py-2">
            <div className="flex items-start justify-between gap-4 border-b border-ember-100/80 py-3">
              <div className="text-sm text-ink/58">Dotyczy</div>
              {loading ? (
                <TextSkeleton
                  className="text-right text-sm font-medium text-ink/88"
                  skeletonClassName="h-4 w-32"
                  wrapperClassName="w-32"
                />
              ) : (
                <div className="text-right text-sm font-medium text-ink/88">{invoice!.invoiceName}</div>
              )}
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-ember-100/80 py-3">
              <div className="text-sm text-ink/58">Okres rozliczeniowy</div>
              {loading ? (
                <TextSkeleton
                  className="min-w-0 text-right text-sm font-medium text-ink/88"
                  skeletonClassName="h-4 w-28"
                  wrapperClassName="w-28"
                />
              ) : (
                <div className="min-w-0 text-right text-sm font-medium text-ink/88">{invoice!.billingMonth}</div>
              )}
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <div className="text-sm text-ink/58">Status</div>
              {loading ? (
                <TextSkeleton
                  className="min-w-0 text-right text-sm font-medium text-ink/60"
                  skeletonClassName="h-4 w-24"
                  wrapperClassName="w-24"
                />
              ) : (
                <div
                  className={
                    invoice!.paid
                      ? 'min-w-0 text-right text-sm font-medium text-emerald-700'
                      : 'min-w-0 text-right text-sm font-medium text-ink/60'
                  }
                >
                  {invoice!.paid ? 'Opłacony' : 'Nieopłacony'}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-semibold tracking-[0.01em] text-ink/75">Kwota</div>
            {loading ? (
              <TextSkeleton
                className="text-[2.15rem] font-semibold tracking-tight text-ink"
                skeletonClassName="h-6"
                wrapperClassName="w-28"
              />
            ) : (
              <div className="text-[2.15rem] font-semibold tracking-tight text-ink">
                {invoice!.amount} zł
              </div>
            )}
          </div>

          {loading ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold tracking-[0.01em] text-ink/75">Płacący</h2>
              <div className="grid gap-2">
                <SkeletonBlock className="h-[5.375rem] w-full rounded-[1.25rem]" />
                <SkeletonBlock className="h-[5.375rem] w-full rounded-[1.25rem]" />
              </div>
            </section>
          ) : !invoice!.paid ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold tracking-[0.01em] text-ink/75">Płacący</h2>
              <PayerButtons active={payer} onChange={setPayer} payers={availablePayers} />
            </section>
          ) : null}

          {loading ? (
            <PrimaryButton disabled>Przejdź do Tpay</PrimaryButton>
          ) : !invoice!.paid ? (
            <PrimaryButton busy={busy}>Przejdź do Tpay</PrimaryButton>
          ) : invoice!.paid ? (
            <div className="text-center text-sm text-ink/60">
              Nie jest wymagane żadne działanie.
            </div>
          ) : null}

          {error ? <InlineError message={error} /> : null}
        </form>
      </Card>
    </AppShell>
  )
}
