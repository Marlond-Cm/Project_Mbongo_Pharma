'use server'

// Issue 12 : mise à jour du profil de la pharmacie connectée.
// Champs modifiables : adresse, horaires, téléphone, WhatsApp.
// Le nom, le quartier, la ville, le slug et le statut ne se changent pas ici.

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { profilSchema } from '@/lib/validators'

// À remplacer par lib/constants.js quand Grasty l'aura créé.
const SLUG_VILLE = {
  BRAZZAVILLE: 'brazzaville',
  POINTE_NOIRE: 'pointe-noire',
}

export async function updateProfile(_etat, formData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'PHARMACY') {
    return { erreur: 'Accès réservé aux comptes pharmacie.' }
  }

  // On renvoie aussi les valeurs saisies : React vide le formulaire après
  // chaque action, le composant s'en sert pour ne pas faire retaper l'utilisateur.
  const saisie = {
    adresse: formData.get('adresse') ?? '',
    horaires: formData.get('horaires') ?? '',
    telephone: formData.get('telephone') ?? '',
    whatsapp: formData.get('whatsapp') ?? '',
  }

  const valide = profilSchema.safeParse(saisie)
  if (!valide.success) {
    return { erreur: valide.error.issues[0].message, valeurs: saisie }
  }

  // La pharmacie est retrouvée par le compte connecté, jamais par un id du formulaire.
  const pharmacie = await prisma.pharmacie.findUnique({
    where: { utilisateurId: session.user.id },
    select: { id: true, slug: true, ville: true, statut: true },
  })
  if (!pharmacie) {
    return { erreur: 'Aucune pharmacie n’est liée à ce compte.', valeurs: saisie }
  }

  await prisma.pharmacie.update({
    where: { id: pharmacie.id },
    data: valide.data,
  })

  // Le téléphone et les horaires apparaissent sur la fiche, la liste et la page de garde.
  revalidatePath('/pharmacie/profil')
  revalidatePath(`/pharmacies/${pharmacie.slug}`)
  revalidatePath('/pharmacies')
  revalidatePath(`/pharmacies-de-garde/${SLUG_VILLE[pharmacie.ville]}`)

  return {
    succes:
      pharmacie.statut === 'APPROUVEE'
        ? 'Profil enregistré. Votre fiche publique est à jour.'
        : 'Profil enregistré.',
    valeurs: {
      adresse: valide.data.adresse,
      horaires: valide.data.horaires ?? '',
      telephone: valide.data.telephone,
      whatsapp: valide.data.whatsapp ?? '',
    },
  }
}
