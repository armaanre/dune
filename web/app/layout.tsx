import './globals.css'
import type { Metadata } from 'next'
import DarkModeToggle from '@/components/DarkModeToggle'

export const metadata: Metadata = {
  title: 'Custom Form Builder',
  description: 'Build forms, collect responses, view live analytics',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="mx-auto max-w-6xl p-6">
          <header className="flex items-center justify-between py-4">
            <a href="/" className="text-xl font-semibold hover:underline">Custom Form Builder</a>
            <DarkModeToggle />
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
