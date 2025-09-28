// SEO configuration for SiteRecap
export const seoConfig = {
  defaultTitle: 'SiteRecap - AI-Powered Construction Daily Reports',
  titleTemplate: '%s | SiteRecap',
  defaultDescription: 'Transform construction site photos into professional daily reports with AI. Generate owner and contractor reports automatically from job site photos.',
  siteUrl: 'https://siterecap.com',
  defaultOpenGraphImage: 'https://siterecap.com/og-image.jpg',
  
  // Keywords for construction industry
  keywords: [
    'AI daily reports construction',
    'construction daily reporting software',
    'automated construction reports',
    'construction project management',
    'daily construction reports',
    'contractor daily reports',
    'construction photo analysis',
    'AI construction management',
    'construction site documentation',
    'construction progress reports',
    'daily site reports',
    'construction reporting app',
    'automated project reports',
    'construction site analytics',
    'AI powered construction tools'
  ],
  
  // Page-specific SEO data
  pages: {
    home: {
      title: 'SiteRecap - AI-Powered Construction Daily Reports',
      description: 'Transform construction site photos into professional daily reports with AI. Generate owner and contractor reports automatically from job site photos. Try free for 7 days.',
      keywords: ['AI daily reports construction', 'construction daily reporting software', 'automated construction reports']
    },
    pricing: {
      title: 'Pricing Plans - Construction Daily Report Software',
      description: 'Choose the perfect plan for your construction business. AI-powered daily reports starting at $99/month. 7-day free trial for new customers.',
      keywords: ['construction software pricing', 'daily report software cost', 'construction app pricing']
    },
    login: {
      title: 'Sign In - Construction Daily Reports',
      description: 'Access your SiteRecap account to generate AI-powered construction daily reports from job site photos.',
      keywords: ['construction software login', 'daily reports access', 'contractor portal']
    },
    dashboard: {
      title: 'Dashboard - Manage Construction Projects',
      description: 'Manage your construction projects and generate professional daily reports with AI-powered photo analysis.',
      keywords: ['construction project dashboard', 'daily reports management', 'construction project tracking']
    },
    demo: {
      title: 'Free Demo - AI Construction Daily Reports',
      description: 'Try SiteRecap for free! Upload construction photos and see how AI generates professional daily reports for owners and contractors.',
      keywords: ['construction software demo', 'free construction reports', 'AI construction demo']
    },
    faq: {
      title: 'FAQ - Construction Daily Report Software',
      description: 'Frequently asked questions about SiteRecap AI-powered construction daily reporting software. Get answers about features, pricing, and setup.',
      keywords: ['construction software FAQ', 'daily reports questions', 'construction app help']
    },
    terms: {
      title: 'Terms of Service - SiteRecap',
      description: 'Terms of Service for SiteRecap construction daily reporting software. Read our terms and conditions for using our AI-powered platform.',
      keywords: ['construction software terms', 'daily reports terms of service']
    },
    privacy: {
      title: 'Privacy Policy - SiteRecap',
      description: 'Privacy Policy for SiteRecap. Learn how we protect your construction project data and job site photos.',
      keywords: ['construction software privacy', 'data protection construction', 'site photo privacy']
    }
  }
}

// Generate page meta tags
export function generateMetaTags(pageKey, customData = {}) {
  const page = seoConfig.pages[pageKey] || seoConfig.pages.home
  const title = customData.title || page.title
  const description = customData.description || page.description
  const keywords = [...(page.keywords || []), ...seoConfig.keywords].join(', ')
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `${seoConfig.siteUrl}${pageKey === 'home' ? '' : `/${pageKey}`}`,
      siteName: 'SiteRecap',
      images: [
        {
          url: customData.image || seoConfig.defaultOpenGraphImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [customData.image || seoConfig.defaultOpenGraphImage],
      creator: '@siterecap',
      site: '@siterecap',
    },
    alternates: {
      canonical: `${seoConfig.siteUrl}${pageKey === 'home' ? '' : `/${pageKey}`}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}