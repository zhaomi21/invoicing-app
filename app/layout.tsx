import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { geistSans } from './fonts'

export const metadata: Metadata = {
  title: "Invoicing App",
  description: "Create and manage invoices easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geistSans.className}>
      <body>{children}</body>
    </html>
  )
}
