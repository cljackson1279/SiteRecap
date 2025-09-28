import { generateMetaTags } from '@/lib/seo'

export const metadata = generateMetaTags('demo')

export default function DemoLayout({ children }) {
  return children
}