import './globals.css'

export const metadata = {
  title: 'SiteRecap',
  description: 'Transform job site photos into professional daily reports using AI',
  icons: {
    icon: '/favicon.ico',
    apple: '/siterecap-icon.png',
  },
  openGraph: {
    title: 'SiteRecap - AI-Powered Construction Reports',
    description: 'Transform job site photos into professional daily reports using AI',
    images: ['/siterecap-icon.png'],
  },
  twitter: {
    card: 'summary',
    title: 'SiteRecap',
    description: 'Transform job site photos into professional daily reports using AI',
    images: ['/siterecap-icon.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/siterecap-icon.png" />
        <meta name="theme-color" content="#168995" />
      </head>
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}