import { Navigate, Route, Routes } from 'react-router-dom'

import { DonationPage } from './pages/donation-page'
import { InvoicePage } from './pages/invoice-page'

export function App() {
  return (
    <Routes>
      <Route element={<InvoicePage />} path="/" />
      <Route element={<DonationPage />} path="/darowizna" />
      <Route element={<Navigate replace to="/" />} path="/success" />
      <Route element={<Navigate replace to="/" />} path="/error" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
