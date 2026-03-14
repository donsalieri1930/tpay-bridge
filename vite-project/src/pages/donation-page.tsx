import { useEffect, useRef, useState } from 'react'

import { AppShell, Card } from '../components/app-shell'
import { InlineError, PayerButtons, PrimaryButton, SkeletonBlock } from '../components/common'
import { createDonationPayment, getInvoiceInfo, HttpError, readUuid } from '../lib/api'
import { cn, normalizeAmountInput, parseDonationAmount } from '../lib/utils'
import type { InvoiceInfo, PayerIndex } from '../types'

const presetAmounts = [10, 20, 50, 100]

export function DonationPage() {
  const [invoice, setInvoice] = useState<InvoiceInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [invalid, setInvalid] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [payer, setPayer] = useState<PayerIndex>(0)
  const [amountInput, setAmountInput] = useState('20')
  const amountInputRef = useRef<HTMLInputElement | null>(null)

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
    if (busy) {
      return
    }

    const amount = parseDonationAmount(amountInput)
    if (!amount || amount <= 0 || availablePayers.length === 0) {
      return
    }

    setBusy(true)
    setError('')

    try {
      const payment = await createDonationPayment(readUuid(), payer, amount)
      window.location.assign(payment.url)
    } catch {
      setError('Nie udało się rozpocząć darowizny. Spróbuj ponownie.')
      setBusy(false)
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

  function moveCaretToEnd() {
    const input = amountInputRef.current
    if (!input) {
      return
    }
    const end = input.value.length
    window.requestAnimationFrame(() => {
      input.setSelectionRange(end, end)
    })
  }

  if (loading) {
    return (
      <AppShell>
        <Card>
          <div className="min-h-[30rem] space-y-7">
            <div className="space-y-3">
              <SkeletonBlock className="h-8 w-36" />
              <SkeletonBlock className="h-5 w-60" />
            </div>
            <SkeletonBlock className="h-14 w-full" />
            <div className="space-y-3">
              <SkeletonBlock className="h-4 w-16" />
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
            </div>
            <div className="space-y-3">
              <SkeletonBlock className="h-4 w-14" />
              <div className="grid grid-cols-4 gap-2">
                <SkeletonBlock className="h-12 w-full" />
                <SkeletonBlock className="h-12 w-full" />
                <SkeletonBlock className="h-12 w-full" />
                <SkeletonBlock className="h-12 w-full" />
              </div>
              <SkeletonBlock className="h-14 w-full" />
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
            Nie udało się wczytać darowizny.
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
            <h1 className="text-[1.7rem] font-semibold tracking-tight text-ink">Wesprzyj Węgielek</h1>
            <p className="text-sm text-ink/60">Darowizna na cele statutowe stowarzyszenia.</p>
          </div>

          <div className="text-[1.05rem] font-medium text-ink/88">{invoice.payers}</div>

          {availablePayers.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold tracking-[0.01em] text-ink/75">Płacący</h2>
            <PayerButtons
              active={payer}
              onChange={setPayer}
              payers={availablePayers}
            />
          </section>
          ) : (
          <div className="text-sm text-ink/60">
            Brak danych płacącego. Nie można rozpocząć darowizny.
          </div>
          )}

          <section className="space-y-3">
            <h2 className="text-sm font-semibold tracking-[0.01em] text-ink/75">Kwota</h2>
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((amount) => {
                const active = parseDonationAmount(amountInput) === amount
                return (
                  <button
                    className={cn(
                      'rounded-[1.15rem] border px-0 py-3.5 text-sm font-semibold transition',
                      active
                        ? 'border-ember-400 bg-ember-50/80 text-ink shadow-sm'
                        : 'border-ember-100 bg-white/70 text-ink hover:border-ember-300',
                    )}
                    key={amount}
                    onClick={() => setAmountInput(String(amount))}
                    type="button"
                  >
                    {amount} zł
                  </button>
                )
              })}
            </div>
            <div className="pt-1">
              <div className="relative">
                <input
                  id="custom-amount"
                  ref={amountInputRef}
                  className="w-full rounded-[1.25rem] border border-ember-100 bg-white/75 px-4 py-4 pr-12 text-base font-semibold text-ink outline-none transition focus:border-ember-500 focus:ring-4 focus:ring-ember-100"
                  inputMode="numeric"
                  min="1"
                  max="9999"
                  maxLength={4}
                  onClick={moveCaretToEnd}
                  onChange={(event) => setAmountInput(normalizeAmountInput(event.target.value))}
                  onFocus={moveCaretToEnd}
                  placeholder="Inna kwota do 9999 zł"
                  value={amountInput}
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-ink/50">
                  zł
                </span>
              </div>
            </div>
          </section>

          {error ? <InlineError message={error} /> : null}

          {availablePayers.length > 0 ? (
            <PrimaryButton busy={busy}>Przejdź do Tpay</PrimaryButton>
          ) : null}
        </form>
      </Card>
    </AppShell>
  )
}
