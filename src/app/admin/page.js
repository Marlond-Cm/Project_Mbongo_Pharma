// Issue 11 : pharmacies en attente de validation. Rendu : SSR.

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import ValidationButtons from '@/components/forms/ValidationButtons'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Pharmacies en attente' }

const VILLES = { BRAZZAVILLE: 'Brazzaville', POINTE_NOIRE: 'Pointe-Noire' }

const formatDate = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeZone: 'Africa/Brazzaville',
})

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/connexion')

  const pharmacies = await prisma.pharmacie.findMany({
    where: { statut: 'EN_ATTENTE' },
    select: {
      id: true,
      nom: true,
      adresse: true,
      quartier: true,
      ville: true,
      telephone: true,
      whatsapp: true,
      horaires: true,
      creeLe: true,
      utilisateur: { select: { email: true } },
    },
    orderBy: { creeLe: 'asc' }, // les plus anciennes demandes d'abord
  })

  return (
    <section>
      <h1 className={styles.titre}>Pharmacies en attente</h1>
      <p className={styles.soustitre}>
        {pharmacies.length === 0
          ? 'Aucune demande à traiter.'
          : `${pharmacies.length} demande${pharmacies.length > 1 ? 's' : ''} à traiter. Une pharmacie approuvée apparaît tout de suite sur le site public.`}
      </p>

      {pharmacies.length > 0 && (
        <ul className={styles.liste}>
          {pharmacies.map((p) => (
            <li key={p.id} className={styles.carte}>
              <div>
                <h2 className={styles.nom}>{p.nom}</h2>
                <p className={styles.date}>
                  Inscrite le {formatDate.format(p.creeLe)}
                </p>
              </div>

              <dl className={styles.details}>
                <div>
                  <dt>Adresse</dt>
                  <dd>
                    {p.adresse}, {p.quartier}, {VILLES[p.ville]}
                  </dd>
                </div>
                <div>
                  <dt>Téléphone</dt>
                  <dd>{p.telephone}</dd>
                </div>
                <div>
                  <dt>WhatsApp</dt>
                  <dd>{p.whatsapp || 'Non renseigné'}</dd>
                </div>
                <div>
                  <dt>Horaires</dt>
                  <dd>{p.horaires || 'Non renseignés'}</dd>
                </div>
                <div>
                  <dt>Compte</dt>
                  <dd>{p.utilisateur.email}</dd>
                </div>
              </dl>

              <ValidationButtons pharmacieId={p.id} nom={p.nom} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
