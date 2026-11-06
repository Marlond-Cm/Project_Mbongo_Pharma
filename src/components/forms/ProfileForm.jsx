'use client'

// Issue 12 : modifier l'adresse, les horaires, le téléphone et le numéro WhatsApp.
// `pharmacie` = { adresse, horaires, telephone, whatsapp } venant de la base.

import { useActionState } from 'react'
import { updateProfile } from '@/actions/profile'
import styles from './ProfileForm.module.css'

export default function ProfileForm({ pharmacie }) {
  const [etat, action, enCours] = useActionState(updateProfile, null)

  // Après une action, on réaffiche ce que l'utilisateur a saisi (ou la valeur enregistrée).
  const valeurs = etat?.valeurs ?? {
    adresse: pharmacie.adresse,
    horaires: pharmacie.horaires ?? '',
    telephone: pharmacie.telephone,
    whatsapp: pharmacie.whatsapp ?? '',
  }

  return (
    <form action={action} className={styles.carte}>
      <div className={styles.groupe}>
        <label htmlFor="adresse">Adresse</label>
        <input
          id="adresse"
          name="adresse"
          type="text"
          required
          minLength={5}
          maxLength={200}
          autoComplete="street-address"
          defaultValue={valeurs.adresse}
          className={styles.champ}
        />
      </div>

      <div className={styles.groupe}>
        <label htmlFor="horaires">Horaires d’ouverture (facultatif)</label>
        <input
          id="horaires"
          name="horaires"
          type="text"
          maxLength={100}
          placeholder="Lun-Sam 8h-20h"
          defaultValue={valeurs.horaires}
          className={styles.champ}
        />
      </div>

      <div className={styles.groupe}>
        <label htmlFor="telephone">Téléphone</label>
        <input
          id="telephone"
          name="telephone"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          aria-describedby="aide-telephone"
          defaultValue={valeurs.telephone}
          className={styles.champ}
        />
        <p id="aide-telephone" className={styles.aide}>
          Exemple : 06 123 45 67. Le préfixe +242 est ajouté automatiquement.
        </p>
      </div>

      <div className={styles.groupe}>
        <label htmlFor="whatsapp">Numéro WhatsApp (facultatif)</label>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          inputMode="tel"
          aria-describedby="aide-whatsapp"
          defaultValue={valeurs.whatsapp}
          className={styles.champ}
        />
        <p id="aide-whatsapp" className={styles.aide}>
          Laissez vide si la pharmacie n’a pas de WhatsApp : le bouton ne sera pas proposé.
        </p>
      </div>

      <button type="submit" className={styles.bouton} disabled={enCours}>
        {enCours ? 'Enregistrement…' : 'Enregistrer le profil'}
      </button>

      {etat?.erreur && (
        <p className={styles.erreur} role="alert">
          {etat.erreur}
        </p>
      )}
      {etat?.succes && (
        <p className={styles.succes} role="status">
          {etat.succes}
        </p>
      )}
    </form>
  )
}
