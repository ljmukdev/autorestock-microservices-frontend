import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { ConfigProvider } from '@/providers/ConfigProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AutoRestock - Master Application',
  description: 'AutoRestock Master Frontend Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ConfigProvider>
      </body>
    </html>
  )
}
