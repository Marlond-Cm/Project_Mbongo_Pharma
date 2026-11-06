'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import BoutonDeconnexion from '@/components/BoutonDeconnexion'

export default function Navigation({ isAuthenticated }) {
  const [isOpen, setIsOpen] = useState(false)
  const closeMenu = () => setIsOpen(false)

  return (
    <div className="navigation-wrap">
      <button
        type="button"
        className="menu-toggle"
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={isOpen}
        aria-controls="main-navigation"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </button>
      <nav
        id="main-navigation"
        className={`site-navigation${isOpen ? ' is-open' : ''}`}
        aria-label="Navigation principale"
      >
        <Link href="/" className="navigation-link" onClick={closeMenu}>Recherche</Link>
        {isAuthenticated ? (
          <div className="navigation-account">
            <Link href="/pharmacie/stock" className="navigation-link navigation-space" onClick={closeMenu}>
              Mon Espace
            </Link>
            <div onClick={closeMenu}>
              <BoutonDeconnexion />
            </div>
          </div>
        ) : (
          <div className="navigation-account">
            <Link href="/connexion" className="navigation-link" onClick={closeMenu}>Connexion</Link>
            <Link href="/inscription" className="navigation-link navigation-signup" onClick={closeMenu}>
              Inscrire ma pharmacie
            </Link>
          </div>
        )}
      </nav>
    </div>
  )
}