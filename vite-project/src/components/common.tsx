import { LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../lib/utils'

export function PayerButtons({
  active,
  onChange,
  payers,
}: {
  active: 0 | 1
  onChange: (value: 0 | 1) => void
  payers: Array<{ id: 0 | 1; name: string; email: string }>
}) {
  return (
    <div className="grid gap-2">
      {payers.map((payer) => (
        <button
          className={cn(
            'rounded-[1.25rem] border px-4 py-4 text-left transition',
            active === payer.id
              ? 'border-ember-400 bg-ember-50/80 shadow-sm'
              : 'border-ember-100 bg-white/70 hover:border-ember-300',
          )}
          key={payer.id}
          onClick={() => onChange(payer.id)}
          type="button"
        >
          <div className="text-[1.05rem] font-semibold text-ink/90">{payer.name}</div>
          <div className="mt-1 text-[0.95rem] text-ink/52">{payer.email}</div>
        </button>
      ))}
    </div>
  )
}

export function PrimaryButton({
  busy,
  children,
}: {
  busy?: boolean
  children: ReactNode
}) {
  return (
    <button
      className="inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-ember-600 px-4 py-4 text-base font-semibold text-white transition hover:bg-ember-700 disabled:cursor-not-allowed disabled:bg-ember-300"
      disabled={busy}
      type="submit"
    >
      {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {busy ? 'Rejestrowanie transkacji' : children}
    </button>
  )
}

export function InlineError({
  message,
}: {
  message: string
}) {
  return (
    <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {message}
    </div>
  )
}

export function SkeletonBlock({
  className,
}: {
  className: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-gradient-to-r from-ember-100/75 via-white/85 to-ember-100/75 bg-[length:200%_100%] motion-safe:animate-[shimmer_2.4s_linear_infinite]',
        className,
      )}
    >
      &nbsp;
    </div>
  )
}
