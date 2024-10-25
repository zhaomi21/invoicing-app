import { Pangolin } from 'next/font/google'
import './globals.css'

const pangolin = Pangolin({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pangolin',
  display: 'swap',
})

export const metadata = {
  title: 'Invoicing App',
  description: 'Create and manage invoices easily',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${pangolin.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}
