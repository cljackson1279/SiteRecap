import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { generateMetaTags } from '@/lib/seo'
import { organizationSchema, softwareApplicationSchema, generateStructuredData } from '@/lib/structured-data'

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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="canonical" href="https://siterecap.com" />
        <meta name="theme-color" content="#168995" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateStructuredData(organizationSchema)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateStructuredData(softwareApplicationSchema)}
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}