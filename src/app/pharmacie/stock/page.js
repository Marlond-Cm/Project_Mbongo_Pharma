// Issue 8 : gestion du stock de la pharmacie connectée. Rendu : SSR.

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import StockForm from '@/components/forms/StockForm'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mon stock' }

export default async function StockPage() {
  // 3e niveau de protection : on revérifie ici, sans dépendre du layout.
  const session = await auth()
  if (!session?.user || session.user.role !== 'PHARMACY') redirect('/connexion')

  const pharmacie = await prisma.pharmacie.findUnique({
    where: { utilisateurId: session.user.id },
    select: { id: true, nom: true, slug: true, statut: true },
  })

  if (!pharmacie) {
    return (
      <section>
        <h1 className={styles.titre}>Mon stock</h1>
        <p className={styles.alerte} role="alert">
          Aucune pharmacie n’est liée à ce compte. Contactez un administrateur.
        </p>
      </section>
    )
  }

  if (pharmacie.statut !== 'APPROUVEE') {
    return (
      <section>
        <h1 className={styles.titre}>Mon stock</h1>
        <p className={styles.alerte} role="status">
          {pharmacie.statut === 'EN_ATTENTE'
            ? 'Votre inscription est en attente de validation par un administrateur. Vous pourrez gérer votre stock dès qu’elle sera approuvée.'
            : 'Votre inscription a été refusée. Contactez un administrateur pour plus d’informations.'}
        </p>
      </section>
    )
  }

  const items = await prisma.stockItem.findMany({
    where: { pharmacieId: pharmacie.id },
    select: {
      id: true,
      statut: true,
      modifieLe: true,
      medicament: { select: { nom: true } },
    },
    orderBy: { medicament: { nom: 'asc' } },
  })

  return (
    <section>
      <div className={styles.entete}>
        <div>
          <h1 className={styles.titre}>Mon stock</h1>
          <p className={styles.soustitre}>{pharmacie.nom}</p>
        </div>
        <Link href={`/pharmacies/${pharmacie.slug}`} className={styles.lienFiche}>
          Voir ma fiche publique
        </Link>
      </div>
      <StockForm items={items} />
    </section>
  )
}
