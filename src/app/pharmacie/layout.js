// Espace pharmacie (rôle PHARMACY). 2e niveau de protection, après proxy.js.
// Ce layout appelle auth() : tout ce qui est dessous est donc rendu à la demande (SSR).

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import PrivateHeader from '@/components/layout/PrivateHeader'
import Sidebar from '@/components/layout/Sidebar'
import styles from './layout.module.css'

export const metadata = {
  title: 'Espace pharmacie',
  robots: { index: false },
}

export default async function PharmacieLayout({ children }) {
  const session = await auth()

  if (!session?.user) redirect('/connexion')
  if (session.user.role !== 'PHARMACY') redirect('/')

  return (
    <>
      <PrivateHeader nom={session.user.name} />
      <div className={styles.cadre}>
        <aside className={styles.lateral}>
          <Sidebar role="PHARMACY" />
        </aside>
        <main className={styles.contenu} id="contenu">
          {children}
        </main>
      </div>
    </>
  )
}
