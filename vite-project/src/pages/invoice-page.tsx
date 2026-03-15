import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { AppShell, Card } from '../components/app-shell'
import { InlineError, InvalidLinkCard, PayerButtons, PrimaryButton, SkeletonBlock, TextSkeleton } from '../components/common'
import { createInvoicePayment, readUuid } from '../lib/api'
import { getAvailablePayers, useInvoiceInfo } from '../lib/invoice-info'
import type { PayerIndex } from '../types'

const fieldSkeletonWrapperClassName = 'block w-44 max-w-full'

export function InvoicePage() {
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [payer, setPayer] = useState<PayerIndex>(0)
  const { invoice, loading, invalid } = useInvoiceInfo('Rachunek | Żar')

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

  const availablePayers = getAvailablePayers(invoice)

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
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-[1.55rem] font-semibold tracking-tight text-ink">
              Status rachunku
            </h1>
            <div className="flex shrink-0 items-center justify-end">
              {loading ? (
                <TextSkeleton
                  className="text-sm font-semibold text-ink/60"
                  skeletonClassName="h-5 rounded-full"
                  wrapperClassName="w-24"
                />
              ) : (
                <div
                  className={
                    invoice!.paid
                      ? 'inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200'
                      : 'inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200'
                  }
                >
                  {invoice!.paid ? 'Opłacony' : 'Nieopłacony'}
                </div>
              )}
            </div>
          </div>

          <section className="space-y-5">
            <div className="space-y-1.5">
              <div className="text-sm font-semibold tracking-[0.01em] text-ink/75">Dotyczy</div>
              {loading ? (
                <TextSkeleton
                  className="text-[1.1rem] text-ink/88"
                  skeletonClassName="h-5 w-full"
                  wrapperClassName={fieldSkeletonWrapperClassName}
                />
              ) : (
                <div className="text-[1.1rem] text-ink/88">{invoice!.invoiceName}</div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm font-semibold tracking-[0.01em] text-ink/75">Okres rozliczeniowy</div>
              {loading ? (
                <TextSkeleton
                  className="text-[1.1rem] text-ink/88"
                  skeletonClassName="h-5 w-full"
                  wrapperClassName={fieldSkeletonWrapperClassName}
                />
              ) : (
                <div className="text-[1.1rem] text-ink/88">{invoice!.billingMonth}</div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm font-semibold tracking-[0.01em] text-ink/75">Numer rachunku</div>
              {loading ? (
                <div className="min-w-0">
                  <div className="inline-flex max-w-full items-baseline gap-2">
                    <div className="relative min-w-0 break-all text-[1.1rem] text-ink/72 w-44 max-w-full">
                      <div aria-hidden className="invisible">
                        00/0000/0000
                      </div>
                      <SkeletonBlock className="absolute inset-x-0 top-1/2 h-5 w-full -translate-y-1/2 rounded-md" />
                    </div>
                    <button
                      aria-hidden
                      className="invisible inline-flex h-7 w-7 shrink-0 translate-y-[1px] items-center justify-center rounded-full border border-ember-100 bg-white/70 text-ink/72"
                      tabIndex={-1}
                      type="button"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="min-w-0">
                  <div className="inline-flex max-w-full items-baseline gap-2">
                    <div className="min-w-0 break-all text-[1.1rem] text-ink/72">
                      {invoice!.invoiceID}
                    </div>
                    <button
                      aria-label="Kopiuj numer rachunku"
                      className="inline-flex h-7 w-7 shrink-0 translate-y-[1px] items-center justify-center rounded-full border border-ember-100 bg-white/70 text-ink/72 transition hover:border-ember-300 hover:bg-white"
                      onClick={handleCopyInvoiceId}
                      title={copied ? 'Skopiowano' : 'Kopiuj numer rachunku'}
                      type="button"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="space-y-1.5">
            <div className="text-sm font-semibold tracking-[0.01em] text-ink/75">Kwota</div>
            {loading ? (
            <TextSkeleton
              className="text-[2.15rem] font-semibold tracking-tight text-ink"
              skeletonClassName="h-6"
              wrapperClassName={fieldSkeletonWrapperClassName}
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
                <SkeletonBlock className="h-[5.5rem] w-full rounded-[1.25rem]" />
                <SkeletonBlock className="h-[5.5rem] w-full rounded-[1.25rem]" />
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
              Rachunek jest już opłacony.
            </div>
          ) : null}

          {error ? <InlineError message={error} /> : null}
        </form>
      </Card>
    </AppShell>
  )
}
