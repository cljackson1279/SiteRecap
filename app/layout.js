import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { generateMetaTags } from '@/lib/seo'

export const metadata = {
  ...generateMetaTags('home'),
  metadataBase: new URL('https://siterecap.com'),
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification
  },
  category: 'construction software',
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}