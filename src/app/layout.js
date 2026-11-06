import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Mbongo Pharma — Pharmacie de garde et stocks au Congo',
  description: 'Trouvez rapidement vos médicaments disponibles et les pharmacies de garde à Brazzaville et Pointe-Noire.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} app-body`}>
        <Navbar />
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <p>© 2026 Mbongo Pharma — Brazzaville & Pointe-Noire (République du Congo)</p>
        </footer>
      </body>
    </html>
  )
}
