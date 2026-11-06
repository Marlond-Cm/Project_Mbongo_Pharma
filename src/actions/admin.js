'use server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import {
  gardeSchema,
  suppressionGardeSchema,
  decisionPharmacieSchema,
} from '@/lib/validators'

const SLUG_VILLE = {
  BRAZZAVILLE: 'brazzaville',
  POINTE_NOIRE: 'pointe-noire',
}

async function verifierAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { erreur: 'Accès réservé aux administrateurs.' }
  }
  return { session }
}

function rafraichirGardes(pharmacie) {
  revalidatePath('/admin/gardes')
  revalidatePath('/pharmacies-de-garde')
  revalidatePath(`/pharmacies-de-garde/${SLUG_VILLE[pharmacie.ville]}`)
  revalidatePath(`/pharmacies/${pharmacie.slug}`)
  revalidatePath('/pharmacies')
}

export async function addDutyPeriod(_etat, formData) {
  const { erreur } = await verifierAdmin()
  if (erreur) return { erreur }

  const valide = gardeSchema.safeParse({
    pharmacieId: formData.get('pharmacieId'),
    dateDebut: formData.get('dateDebut'),
    dateFin: formData.get('dateFin'),
  })
  if (!valide.success) return { erreur: valide.error.issues[0].message }
  const { pharmacieId, dateDebut, dateFin } = valide.data

  const pharmacie = await prisma.pharmacie.findUnique({
    where: { id: pharmacieId },
    select: { id: true, slug: true, ville: true, nom: true, statut: true },
  })
  if (!pharmacie) return { erreur: 'Cette pharmacie n’existe pas.' }
  if (pharmacie.statut !== 'APPROUVEE') {
    return { erreur: 'Seule une pharmacie approuvée peut être de garde.' }
  }

  const chevauchement = await prisma.periodeGarde.findFirst({
    where: {
      pharmacieId,
      dateDebut: { lt: dateFin },
      dateFin: { gt: dateDebut },
    },
    select: { id: true },
  })
  if (chevauchement) {
    return {
      erreur: `${pharmacie.nom} a déjà une garde qui chevauche cette période.`,
    }
  }

  await prisma.periodeGarde.create({
    data: { pharmacieId, dateDebut, dateFin },
  })
  rafraichirGardes(pharmacie)
  return { succes: `Garde ajoutée pour ${pharmacie.nom}.` }
}

export async function deleteDutyPeriod(_etat, formData) {
  const { erreur } = await verifierAdmin()
  if (erreur) return { erreur }

  const valide = suppressionGardeSchema.safeParse({
    gardeId: formData.get('gardeId'),
  })
  if (!valide.success) return { erreur: valide.error.issues[0].message }

  const garde = await prisma.periodeGarde.findUnique({
    where: { id: valide.data.gardeId },
    select: {
      id: true,
      pharmacie: { select: { slug: true, ville: true } },
    },
  })
  if (!garde) return { erreur: 'Cette garde est introuvable (déjà supprimée ?).' }

  await prisma.periodeGarde.delete({ where: { id: garde.id } })
  rafraichirGardes(garde.pharmacie)
  return { succes: 'Garde supprimée.' }
}

function rafraichirValidation(pharmacie) {
  revalidatePath('/admin')
  revalidatePath('/admin/gardes')
  revalidatePath('/pharmacies')
  revalidatePath(`/pharmacies/${pharmacie.slug}`)
  revalidatePath(`/pharmacies-de-garde/${SLUG_VILLE[pharmacie.ville]}`)
}

async function decider(formData, nouveauStatut) {
  const { erreur } = await verifierAdmin()
  if (erreur) return { erreur }

  const valide = decisionPharmacieSchema.safeParse({
    pharmacieId: formData.get('pharmacieId'),
  })
  if (!valide.success) return { erreur: valide.error.issues[0].message }

  const pharmacie = await prisma.pharmacie.findUnique({
    where: { id: valide.data.pharmacieId },
    select: { id: true, nom: true, slug: true, ville: true },
  })
  if (!pharmacie) return { erreur: 'Cette pharmacie n’existe pas.' }

  const { count } = await prisma.pharmacie.updateMany({
    where: { id: pharmacie.id, statut: 'EN_ATTENTE' },
    data: { statut: nouveauStatut },
  })
  if (count === 0) {
    return { erreur: `${pharmacie.nom} n’est plus en attente : elle a déjà été traitée.` }
  }

  rafraichirValidation(pharmacie)
  return {
    succes:
      nouveauStatut === 'APPROUVEE'
        ? `${pharmacie.nom} a été approuvée.`
        : `${pharmacie.nom} a été refusée.`,
  }
}

export async function approvePharmacy(_etat, formData) {
  return decider(formData, 'APPROUVEE')
}

export async function rejectPharmacy(_etat, formData) {
  return decider(formData, 'REFUSEE')
}
