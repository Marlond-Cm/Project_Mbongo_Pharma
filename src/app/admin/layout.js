import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import PrivateHeader from '@/components/layout/PrivateHeader'
import Sidebar from '@/components/layout/Sidebar'
import styles from '../pharmacie/layout.module.css'

export const metadata = {
  title: 'Administration',
  robots: { index: false },
}

export default async function AdminLayout({ children }) {
  const session = await auth()

  if (!session?.user) redirect('/connexion')
  if (session.user.role !== 'ADMIN') redirect('/')

  return (
    <>
      <PrivateHeader nom={session.user.name} />
      <div className={styles.cadre}>
        <aside className={styles.lateral}>
          <Sidebar role="ADMIN" />
        </aside>
        <main className={styles.contenu} id="contenu">
          {children}
        </main>
      </div>
    </>
  )
}
