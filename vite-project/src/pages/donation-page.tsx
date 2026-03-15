import { useRef, useState } from 'react'

import { AppShell, Card } from '../components/app-shell'
import { InlineError, InvalidLinkCard, PayerButtons, PrimaryButton, SkeletonBlock, TextSkeleton } from '../components/common'
import { createDonationPayment, readUuid } from '../lib/api'
import { getAvailablePayers, useInvoiceInfo } from '../lib/invoice-info'
import { cn, normalizeAmountInput, parseDonationAmount } from '../lib/utils'
import type { PayerIndex } from '../types'

const presetAmounts = [10, 20, 50, 100]

export function DonationPage() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [payer, setPayer] = useState<PayerIndex>(0)
  const [amountInput, setAmountInput] = useState('20')
  const amountInputRef = useRef<HTMLInputElement | null>(null)
  const { invoice, loading, invalid } = useInvoiceInfo('Darowizna | Węgielek')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) {
      return
    }

    const amount = parseDonationAmount(amountInput)
    if (!amount || amount <= 0) {
      return
    }

    setBusy(true)
    setError('')

    try {
      const payment = await createDonationPayment(readUuid(), payer, amount)
      window.location.assign(payment.url)
    } catch {
      setError('Nie udało się utworzyć transakcji.')
      setBusy(false)
    }
  }

  const availablePayers = getAvailablePayers(invoice)

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
            <h1 className="text-[1.7rem] font-semibold tracking-tight text-ink">Wesprzyj Węgielek</h1>
            <p className="text-sm text-ink/60">Darowizna na cele statutowe stowarzyszenia.</p>
          </div>

          {loading ? (
            <TextSkeleton
              className="text-[1.05rem] font-medium text-ink/88"
              skeletonClassName="h-4 w-56 max-w-full"
              wrapperClassName="w-56 max-w-full"
            />
          ) : (
            <div className="text-[1.05rem] font-medium text-ink/88">{invoice!.payers}</div>
          )}

          <section className="space-y-3">
            <h2 className="text-sm font-semibold tracking-[0.01em] text-ink/75">Płacący</h2>
            {loading ? (
              <div className="grid gap-2">
                <SkeletonBlock className="h-[5.375rem] w-full rounded-[1.25rem]" />
                <SkeletonBlock className="h-[5.375rem] w-full rounded-[1.25rem]" />
              </div>
            ) : (
              <PayerButtons active={payer} onChange={setPayer} payers={availablePayers} />
            )}
          </section>

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
                    disabled={loading}
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
                {loading ? (
                  <>
                    <input
                      id="custom-amount"
                      className="w-full rounded-[1.25rem] border border-ember-100 bg-white/75 px-4 py-4 pr-12 text-base font-semibold text-ink outline-none"
                      disabled
                      inputMode="numeric"
                      value={amountInput}
                      readOnly
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-ink/50">
                      zł
                    </span>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </section>

          {loading ? (
            <PrimaryButton disabled>Przejdź do Tpay</PrimaryButton>
          ) : (
            <PrimaryButton busy={busy}>Przejdź do Tpay</PrimaryButton>
          )}

          {error ? <InlineError message={error} /> : null}
        </form>
      </Card>
    </AppShell>
  )
}
