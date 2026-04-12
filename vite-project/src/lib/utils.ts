export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function normalizeAmountInput(value: string) {
  return value.replace(/[^\d]/g, '')
}

export function parseDonationAmount(value: string) {
  const amount = Number.parseInt(normalizeAmountInput(value), 10)
  if (!Number.isFinite(amount)) {
    return null
  }
  if (amount < 1 || amount > 9999) {
    return null
  }
  return amount
}
