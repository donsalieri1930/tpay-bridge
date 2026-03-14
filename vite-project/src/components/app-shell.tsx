import type { ReactNode } from 'react'

import logoUrl from '../logo.svg'

export function AppShell({
  children,
}: {
  children: ReactNode
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8 sm:max-w-xl sm:px-5 sm:py-10">
      <header className="mb-6 flex items-center justify-center">
        <img alt="Węgielek" className="h-9 w-auto sm:h-10" src={logoUrl} />
      </header>
      <div className="flex-1">
        {children}
      </div>
      <footer className="mt-5 flex justify-center px-1 text-xs text-ink/55">
        <a className="font-medium text-ember-700/90 hover:text-ember-700" href="mailto:platnosci@wegielek.edu.pl">
          platnosci@wegielek.edu.pl
        </a>
      </footer>
    </main>
  )
}

export function Card({
  children,
}: {
  children: ReactNode
}) {
  return (
    <section className="rounded-[2rem] border border-white/85 bg-white/88 p-6 shadow-float backdrop-blur sm:p-7">
      {children}
    </section>
  )
}

export function FieldBlock({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-ink/58">{label}</div>
      <div className="text-sm font-medium text-ink/88">{value}</div>
    </div>
  )
}
