// Structured Data (JSON-LD) schemas for SiteRecap SEO

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SiteRecap",
  "url": "https://siterecap.com",
  "logo": "https://siterecap.com/siterecap-logo.png",
  "sameAs": [
    "https://twitter.com/siterecap",
    "https://linkedin.com/company/siterecap"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-SITE-CAP",
    "contactType": "customer service",
    "email": "support@siterecap.com"
  }
}

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SiteRecap",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "Construction Management Software",
  "operatingSystem": "Web Browser, iOS, Android",
  "description": "AI-powered construction daily reporting software that transforms job site photos into professional reports for owners and contractors.",
  "url": "https://siterecap.com",
  "author": {
    "@type": "Organization",
    "name": "SiteRecap"
  },
  "offers": {
    "@type": "Offer",
    "price": "99",
    "priceCurrency": "USD",
    "priceValidUntil": "2025-12-31",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "SiteRecap"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  },
  "features": [
    "AI-powered photo analysis",
    "Automated daily reports",
    "Owner and contractor formats",
    "Construction site documentation",
    "Project management tools",
    "Email delivery and PDF export"
  ]
}

export const pricingSchema = (plans) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "SiteRecap Construction Daily Reports",
  "description": "AI-powered construction daily reporting software with multiple pricing plans",
  "brand": {
    "@type": "Brand",
    "name": "SiteRecap"
  },
  "offers": plans.map(plan => ({
    "@type": "Offer",
    "name": plan.name,
    "price": plan.monthlyPrice,
    "priceCurrency": "USD",
    "priceValidUntil": "2025-12-31",
    "availability": "https://schema.org/InStock",
    "description": `${plan.description} - Up to ${plan.projects} active projects`,
    "seller": {
      "@type": "Organization",
      "name": "SiteRecap"
    }
  }))
})

export const breadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
})

export const faqSchema = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
})

export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Construction Daily Reporting",
  "provider": {
    "@type": "Organization",
    "name": "SiteRecap"
  },
  "areaServed": "Worldwide",
  "description": "AI-powered construction daily reporting service that transforms job site photos into professional reports",
  "offers": {
    "@type": "Offer",
    "price": "99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}

// Helper function to generate JSON-LD script tag
export function generateStructuredData(schema) {
  return {
    __html: JSON.stringify(schema, null, 2)
  }
}