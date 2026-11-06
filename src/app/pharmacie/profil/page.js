// Issue 12 : profil de la pharmacie connectée. Rendu : SSR.

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import ProfileForm from '@/components/forms/ProfileForm'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mon profil' }

const VILLES = { BRAZZAVILLE: 'Brazzaville', POINTE_NOIRE: 'Pointe-Noire' }

export default async function ProfilPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'PHARMACY') redirect('/connexion')

  const pharmacie = await prisma.pharmacie.findUnique({
    where: { utilisateurId: session.user.id },
    select: {
      nom: true,
      slug: true,
      statut: true,
      quartier: true,
      ville: true,
      adresse: true,
      horaires: true,
      telephone: true,
      whatsapp: true,
    },
  })

  if (!pharmacie) {
    return (
      <section>
        <h1 className={styles.titre}>Mon profil</h1>
        <p className={styles.alerte} role="alert">
          Aucune pharmacie n’est liée à ce compte. Contactez un administrateur.
        </p>
      </section>
    )
  }

  return (
    <section>
      <div className={styles.entete}>
        <div>
          <h1 className={styles.titre}>Mon profil</h1>
          <p className={styles.soustitre}>
            {pharmacie.nom} ({pharmacie.quartier}, {VILLES[pharmacie.ville]})
          </p>
        </div>
        {pharmacie.statut === 'APPROUVEE' && (
          <Link href={`/pharmacies/${pharmacie.slug}`} className={styles.lienFiche}>
            Voir ma fiche publique
          </Link>
        )}
      </div>

      {pharmacie.statut === 'EN_ATTENTE' && (
        <p className={styles.alerte} role="status">
          Votre inscription est en attente de validation. Vous pouvez déjà
          compléter votre profil.
        </p>
      )}
      {pharmacie.statut === 'REFUSEE' && (
        <p className={styles.alerte} role="status">
          Votre inscription a été refusée. Contactez un administrateur pour plus d’informations.
        </p>
      )}

      <ProfileForm pharmacie={pharmacie} />
      <p className={styles.note}>
        Le nom, le quartier et la ville ne se modifient pas ici : contactez un
        administrateur pour les changer.
      </p>
    </section>
  )
}
