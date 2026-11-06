'use server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import {
  ajoutStockSchema,
  modifStatutSchema,
  retraitStockSchema,
} from '@/lib/validators'

function normalize(texte) {
  return texte
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('fr')
        .trim()
        .replace(/\s+/g, ' ');
}

async function pharmacieConnectee() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'PHARMACY') {
    return { erreur: 'Accès réservé aux comptes pharmacie.' }
  }
  const pharmacie = await prisma.pharmacie.findUnique({
    where: { utilisateurId: session.user.id },
  })
  if (!pharmacie) {
    return { erreur: 'Aucune pharmacie n’est liée à ce compte.' }
  }
  if (pharmacie.statut !== 'APPROUVEE') {
    return {
      erreur:
        'Votre pharmacie doit être approuvée par un administrateur avant de gérer son stock.',
    }
  }
  return { pharmacie }
}

function rafraichir(pharmacie) {
  revalidatePath(`/pharmacies/${pharmacie.slug}`) // fiche publique
  revalidatePath('/pharmacies') // liste
  revalidatePath('/pharmacie/stock') // espace pharmacie
}

function majusculeInitiale(texte) {
  return texte.charAt(0).toUpperCase() + texte.slice(1)
}

export async function addStockItem(_etat, formData) {
  const { pharmacie, erreur } = await pharmacieConnectee()
  if (erreur) return { erreur }

  const valide = ajoutStockSchema.safeParse({
    nomMedicament: formData.get('nomMedicament'),
    statut: formData.get('statut'),
  })
  if (!valide.success) return { erreur: valide.error.issues[0].message }
  const { nomMedicament, statut } = valide.data

  // « paracetamol » et « Paracétamol » désignent le même médicament.
  const nomRecherche = normalize(nomMedicament)
  let medicament = await prisma.medicament.findFirst({ where: { nomRecherche } })
  if (!medicament) {
    try {
      medicament = await prisma.medicament.create({
        data: { nom: majusculeInitiale(nomMedicament), nomRecherche },
      })
    } catch (e) {
      // Une autre pharmacie vient de le créer au même instant (nom unique).
      if (e.code !== 'P2002') throw e
      medicament = await prisma.medicament.findFirst({ where: { nomRecherche } })
    }
  }

  const dejaPresent = await prisma.stockItem.findUnique({
    where: {
      pharmacieId_medicamentId: {
        pharmacieId: pharmacie.id,
        medicamentId: medicament.id,
      },
    },
  })
  if (dejaPresent) {
    return {
      erreur: `« ${medicament.nom} » est déjà dans votre stock. Modifiez son statut dans la liste.`,
    }
  }

  await prisma.stockItem.create({
    data: { pharmacieId: pharmacie.id, medicamentId: medicament.id, statut },
  })
  rafraichir(pharmacie)
  return { succes: `« ${medicament.nom} » a été ajouté à votre stock.` }
}

export async function updateStockStatus(_etat, formData) {
  const { pharmacie, erreur } = await pharmacieConnectee()
  if (erreur) return { erreur }

  const valide = modifStatutSchema.safeParse({
    stockItemId: formData.get('stockItemId'),
    statut: formData.get('statut'),
  })
  if (!valide.success) return { erreur: valide.error.issues[0].message }

  // Le filtre pharmacieId garantit que la ligne appartient à l'utilisateur.
  const { count } = await prisma.stockItem.updateMany({
    where: { id: valide.data.stockItemId, pharmacieId: pharmacie.id },
    data: { statut: valide.data.statut },
  })
  if (count === 0) return { erreur: 'Cette ligne de stock est introuvable.' }

  rafraichir(pharmacie)
  return { succes: 'Statut mis à jour.' }
}

export async function removeStockItem(_etat, formData) {
  const { pharmacie, erreur } = await pharmacieConnectee()
  if (erreur) return { erreur }

  const valide = retraitStockSchema.safeParse({
    stockItemId: formData.get('stockItemId'),
  })
  if (!valide.success) return { erreur: valide.error.issues[0].message }

  const { count } = await prisma.stockItem.deleteMany({
    where: { id: valide.data.stockItemId, pharmacieId: pharmacie.id },
  })
  if (count === 0) return { erreur: 'Cette ligne de stock est introuvable.' }

  rafraichir(pharmacie)
  return { succes: 'Médicament retiré de votre stock.' }
}
