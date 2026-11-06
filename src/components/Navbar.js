import Link from 'next/link'
import { auth } from '../../auth'
import Navigation from '@/components/Navigation'

export default async function Navbar() {
  const session = await auth()

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand-link">
          <div className="brand-mark">
            💊
          </div>
          <div>
            <span className="brand-name">Mbongo Pharma</span>
            <span className="brand-region">Congo</span>
          </div>
        </Link>
        <Navigation isAuthenticated={Boolean(session?.user)} />
      </div>
    </header>
  )
}
