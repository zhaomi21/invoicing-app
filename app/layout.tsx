import { Pangolin } from 'next/font/google'
import './globals.css'
import Head from 'next/head'

const pangolin = Pangolin({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pangolin',
  display: 'swap',
})

export const metadata = {
  title: 'Track Invoicing',
  description: 'Create and manage invoices with ease',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${pangolin.variable}`}>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>
      <body>{children}</body>
    </html>
  )
}
