'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

const LIENS = {
  PHARMACY: [
    { href: '/pharmacie/stock', libelle: 'Mon stock' },
    { href: '/pharmacie/profil', libelle: 'Mon profil' },
  ],
  ADMIN: [
    { href: '/admin', libelle: 'Pharmacies en attente' },
    { href: '/admin/gardes', libelle: 'Gardes' },
  ],
}

export default function Sidebar({ role }) {
  const pathname = usePathname()
  const liens = LIENS[role] ?? []

  return (
    <nav className={styles.menu} aria-label="Menu de l’espace connecté">
      <ul className={styles.liste}>
        {liens.map(({ href, libelle }) => {
          const actif = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                className={actif ? `${styles.lien} ${styles.actif}` : styles.lien}
                aria-current={actif ? 'page' : undefined}
              >
                {libelle}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
