export type InvoiceInfo = {
  payers: string
  invoiceName: string
  amount: string
  invoiceID: string
  billingMonth: string
  payer0Email: string
  payer1Email: string
  payer0Name: string
  payer1Name: string
  paid: boolean
}

export type PaymentRedirect = {
  url: string
}

export type PayerIndex = 0 | 1
