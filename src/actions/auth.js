'use server'

import * as bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { signIn, signOut } from '../../auth'
import { prisma } from '@/lib/prisma'

const VILLES = ['BRAZZAVILLE', 'POINTE_NOIRE']

function lireTexte(formData, nom) {
  return String(formData.get(nom) ?? '').trim()
}

function echec(erreur, valeurs) {
  return { erreur, valeurs }
}

function creerSlug(texte) {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function creerSlugUnique(base) {
  let slug = base
  let numero = 1
  while (await prisma.pharmacie.findUnique({ where: { slug } })) {
    numero += 1
    slug = `${base}-${numero}`
  }
  return slug
}

async function ouvrirSession(email, motDePasse) {
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { email },
    select: { role: true },
  })
  const destination = utilisateur?.role === 'ADMIN' ? '/admin' : '/pharmacie/stock'

  await signIn('credentials', {
    email,
    password: motDePasse,
    redirectTo: destination,
  })
}

export async function connecter(_etat, formData) {
  const email = lireTexte(formData, 'email').toLowerCase()
  const motDePasse = String(formData.get('motDePasse') ?? '')

  if (!email || !motDePasse) {
    return echec('Renseignez votre email et votre mot de passe.', { email })
  }

  try {
    await ouvrirSession(email, motDePasse)
  } catch (erreur) {
    if (erreur instanceof AuthError) {
      return echec('Email ou mot de passe incorrect.', { email })
    }
    console.error('Erreur de connexion:', erreur)
    return echec('Une erreur technique est survenue.', { email })
  }
}

export async function inscrire(_etat, formData) {
  const valeurs = {
    nomPharmacie: lireTexte(formData, 'nomPharmacie'),
    ville: lireTexte(formData, 'ville'),
    quartier: lireTexte(formData, 'quartier'),
    adresse: lireTexte(formData, 'adresse'),
    telephone: lireTexte(formData, 'telephone').replace(/\s+/g, ''),
    email: lireTexte(formData, 'email').toLowerCase(),
  }
  const motDePasse = String(formData.get('motDePasse') ?? '')
  const confirmation = String(formData.get('confirmation') ?? '')

  if (!valeurs.nomPharmacie || !valeurs.quartier || !valeurs.adresse || !valeurs.telephone || !valeurs.email) {
    return echec('Tous les champs sont obligatoires.', valeurs)
  }
  if (!VILLES.includes(valeurs.ville)) {
    return echec('Choisissez une ville.', valeurs)
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeurs.email)) {
    return echec('Adresse email invalide.', valeurs)
  }
  if (!/^\+?[0-9]{8,15}$/.test(valeurs.telephone)) {
    return echec('Numéro de téléphone invalide.', valeurs)
  }
  if (motDePasse.length < 8) {
    return echec('Le mot de passe doit contenir au moins 8 caractères.', valeurs)
  }
  if (motDePasse !== confirmation) {
    return echec('Les deux mots de passe ne correspondent pas.', valeurs)
  }

  const existant = await prisma.utilisateur.findUnique({
    where: { email: valeurs.email },
  })
  if (existant) {
    return echec('Un compte existe déjà avec cet email.', valeurs)
  }

  const motDePasseHache = await bcrypt.hash(motDePasse, 10)
  const slug = await creerSlugUnique(
    creerSlug(`${valeurs.nomPharmacie} ${valeurs.quartier}`) || 'pharmacie',
  )

  try {
    await prisma.utilisateur.create({
      data: {
        nom: valeurs.nomPharmacie,
        email: valeurs.email,
        motDePasse: motDePasseHache,
        role: 'PHARMACY',
        pharmacie: {
          create: {
            slug,
            nom: valeurs.nomPharmacie,
            adresse: valeurs.adresse,
            quartier: valeurs.quartier,
            ville: valeurs.ville,
            telephone: valeurs.telephone,
          },
        },
      },
    })
  } catch (erreur) {
    if (erreur?.code === 'P2002') {
      return echec('Un compte existe déjà avec ces informations.', valeurs)
    }
    console.error('Erreur Prisma lors de l\'inscription:', erreur)
    return echec('Une erreur technique est survenue. Veuillez réessayer.', valeurs)
  }

  try {
  } catch (erreur) {
    if (erreur instanceof AuthError) {
    } else {
      console.error('Erreur session après inscription:', erreur)
    }
  }

  redirect('/pharmacie/stock')
}

export async function deconnecter() {
  await signOut({ redirectTo: '/' })
}
 