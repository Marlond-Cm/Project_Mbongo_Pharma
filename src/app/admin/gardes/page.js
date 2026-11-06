import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import DutyForm from '@/components/forms/DutyForm'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Gardes' }

export default async function GardesPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/connexion')

  const maintenant = new Date()

  const [pharmacies, gardesBrutes] = await Promise.all([
    prisma.pharmacie.findMany({
      where: { statut: 'APPROUVEE' },
      select: { id: true, nom: true, quartier: true, ville: true },
      orderBy: [{ ville: 'asc' }, { nom: 'asc' }],
    }),

    prisma.periodeGarde.findMany({
      where: { dateFin: { gte: maintenant } },
      select: {
        id: true,
        dateDebut: true,
        dateFin: true,
        pharmacie: { select: { nom: true, quartier: true, ville: true } },
      },
      orderBy: { dateDebut: 'asc' },
    }),
  ])
  
  const gardes = gardesBrutes.map((garde) => ({
    ...garde,
    enCours: garde.dateDebut <= maintenant && garde.dateFin >= maintenant,
  }))

  return (
    <section>
      <h1 className={styles.titre}>Gardes</h1>
      <p className={styles.soustitre}>
        Les heures saisies sont celles de Brazzaville (UTC+1).
      </p>
      <DutyForm pharmacies={pharmacies} gardes={gardes} />
    </section>
  )
}
