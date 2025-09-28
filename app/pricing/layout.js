import { generateMetaTags } from '@/lib/seo'
import { pricingSchema, generateStructuredData } from '@/lib/structured-data'

export const metadata = generateMetaTags('pricing')

export default function PricingLayout({ children }) {
  const plans = [
    { name: 'Starter', monthlyPrice: 149, description: 'Perfect for small contractors', projects: 2 },
    { name: 'Pro', monthlyPrice: 299, description: 'Ideal for growing businesses', projects: 10 },
    { name: 'Business', monthlyPrice: 599, description: 'Built for large operations', projects: 25 }
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredData(pricingSchema(plans))}
      />
      {children}
    </>
  )
}