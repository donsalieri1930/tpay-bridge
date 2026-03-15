import { CircleAlert, LoaderCircle } from 'lucide-react'
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
  disabled,
  children,
}: {
  busy?: boolean
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      className="inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-ember-600 px-4 py-4 text-base font-semibold text-white transition hover:bg-ember-700 disabled:cursor-not-allowed disabled:bg-ember-300"
      disabled={busy || disabled}
      type="submit"
    >
      {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {busy ? 'Tworzenie transakcji' : children}
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

export function TextSkeleton({
  reserveText = 'M',
  className,
  skeletonClassName,
  wrapperClassName,
}: {
  reserveText?: string
  className: string
  skeletonClassName: string
  wrapperClassName?: string
}) {
  return (
    <div className={cn('relative inline-block', wrapperClassName)}>
      <div aria-hidden className={cn('block w-full invisible', className)}>
        {reserveText}
      </div>
      <SkeletonBlock className={`absolute inset-x-0 top-1/2 -translate-y-1/2 ${skeletonClassName}`} />
    </div>
  )
}

export function InvalidLinkCard() {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ember-50/85 text-ember-600 ring-1 ring-ember-100">
        <CircleAlert className="h-5 w-5" />
      </div>
      <h1 className="mt-5 text-[1.35rem] font-semibold tracking-tight text-ink">Nieprawidłowy link</h1>
      <p className="mt-3 text-sm leading-6 text-ink/68">
        Jeśli to błąd, skontaktuj się z{' '}
        <a
          className="font-medium text-ember-700 hover:text-ember-800"
          href="mailto:platnosci@wegielek.edu.pl"
        >
          pomocą techniczną
        </a>
        .
      </p>
    </div>
  )
}
