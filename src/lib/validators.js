// Schémas zod de Mbongo Pharma. Chacun ajoute ceux de ses formulaires.
// Les messages sont en français : ils s'affichent tels quels dans les formulaires.
import { z } from 'zod'

// --- Stock (issue 8, Clairline) ---

export const STATUTS_STOCK = ['DISPONIBLE', 'STOCK_FAIBLE', 'RUPTURE']

const statutStock = z.enum(STATUTS_STOCK, {
  message: 'Choisissez un statut : Disponible, Stock faible ou Rupture.',
})

export const ajoutStockSchema = z.object({
  nomMedicament: z
    .string({ message: 'Indiquez le nom du médicament.' })
    .trim()
    .min(2, 'Le nom du médicament doit contenir au moins 2 caractères.')
    .max(100, 'Le nom du médicament est trop long (100 caractères maximum).')
    .transform((nom) => nom.replace(/\s+/g, ' ')),
  statut: statutStock,
})

export const modifStatutSchema = z.object({
  stockItemId: z.string().min(1, 'Ligne de stock introuvable.'),
  statut: statutStock,
})

export const retraitStockSchema = z.object({
  stockItemId: z.string().min(1, 'Ligne de stock introuvable.'),
})

// --- Gardes (issue 10, Clairline) ---
// Le champ <input type="datetime-local"> envoie "2026-11-06T08:00", sans fuseau.
// On l'interprète comme une heure de Brazzaville (UTC+1, sans heure d'été)
// puis on obtient un instant exact : new Date() le stocke en UTC.

const heureBrazzaville = z
  .string({ message: 'Indiquez une date et une heure.' })
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, 'Date ou heure invalide.')
  .transform((valeur) => {
    const complete = valeur.length === 16 ? `${valeur}:00` : valeur
    return new Date(`${complete}+01:00`)
  })
  .refine((date) => !Number.isNaN(date.getTime()), 'Date ou heure invalide.')

export const gardeSchema = z
  .object({
    pharmacieId: z.string().min(1, 'Choisissez une pharmacie.'),
    dateDebut: heureBrazzaville,
    dateFin: heureBrazzaville,
  })
  .refine((garde) => garde.dateFin > garde.dateDebut, {
    message: 'La date de fin doit être après la date de début.',
    path: ['dateFin'],
  })

export const suppressionGardeSchema = z.object({
  gardeId: z.string().min(1, 'Garde introuvable.'),
})

// --- Validation des pharmacies (issue 11, Clairline) ---

export const decisionPharmacieSchema = z.object({
  pharmacieId: z.string().min(1, 'Pharmacie introuvable.'),
})

// --- Profil de la pharmacie (issue 12, Clairline) ---
// Numéros : on accepte « 06 123 45 67 », « 061234567 », « +242 06 123 45 67 » ou
// « 00242… » et on enregistre toujours la forme internationale « +242061234567 »,
// celle que lib/whatsapp.js transforme en lien wa.me.

function normaliserTelephone(brut) {
  const sansSeparateurs = brut.replace(/[\s.\-()]/g, '')
  const international = sansSeparateurs.startsWith('00')
    ? `+${sansSeparateurs.slice(2)}`
    : sansSeparateurs
  return /^\d{9}$/.test(international) ? `+242${international}` : international
}

const estTelephoneValide = (numero) => /^\+\d{8,15}$/.test(numero)
const MESSAGE_TELEPHONE =
  'Numéro invalide. Exemples : 06 123 45 67 ou +242 06 123 45 67.'

export const profilSchema = z.object({
  adresse: z
    .string({ message: 'Indiquez l’adresse de la pharmacie.' })
    .trim()
    .min(5, 'L’adresse doit contenir au moins 5 caractères.')
    .max(200, 'L’adresse est trop longue (200 caractères maximum).'),
  horaires: z
    .string()
    .trim()
    .max(100, 'Les horaires sont trop longs (100 caractères maximum).')
    .transform((valeur) => (valeur === '' ? null : valeur)),
  telephone: z
    .string({ message: 'Indiquez le numéro de téléphone.' })
    .trim()
    .min(1, 'Indiquez le numéro de téléphone.')
    .transform(normaliserTelephone)
    .refine(estTelephoneValide, MESSAGE_TELEPHONE),
  whatsapp: z
    .string()
    .trim()
    .transform((valeur) => (valeur === '' ? null : normaliserTelephone(valeur)))
    .refine((numero) => numero === null || estTelephoneValide(numero), MESSAGE_TELEPHONE),
})
