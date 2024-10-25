import { Pangolin } from 'next/font/google'
import './globals.css'
import Head from 'next/head'
import { Metadata } from 'next'

const pangolin = Pangolin({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pangolin',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Simple invoicing for Canadians',
  description: 'Create and manage invoices with ease',
  icons: {
    icon: [
      { url: '/favicon.png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      // Add more sizes as needed
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${pangolin.variable}`}>
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </Head>
      <body>{children}</body>
    </html>
  )
}
