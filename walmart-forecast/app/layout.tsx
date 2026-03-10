import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Walsaler.ai — Retail Sales Intelligence',
  description: 'Ensemble ML forecasting powered by Random Forest & Gradient Boosting',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        {/* Athletics font via cdnfonts */}
        <link href="https://fonts.cdnfonts.com/css/athletics" rel="stylesheet" />
        {/* Editorial New via cdnfonts */}
        <link href="https://fonts.cdnfonts.com/css/pp-editorial-new" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
