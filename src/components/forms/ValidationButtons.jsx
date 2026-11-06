'use client'

// Issue 11 : boutons Approuver / Refuser d'une pharmacie en attente.

import { useActionState } from 'react'
import { approvePharmacy, rejectPharmacy } from '@/actions/admin'
import styles from './ValidationButtons.module.css'

export default function ValidationButtons({ pharmacieId, nom }) {
  const [etatApprobation, actionApprobation, approbationEnCours] = useActionState(
    approvePharmacy,
    null,
  )
  const [etatRefus, actionRefus, refusEnCours] = useActionState(rejectPharmacy, null)

  const occupe = approbationEnCours || refusEnCours
  const erreur = etatApprobation?.erreur || etatRefus?.erreur

  return (
    <div className={styles.conteneur}>
      <div className={styles.boutons}>
        <form action={actionApprobation}>
          <input type="hidden" name="pharmacieId" value={pharmacieId} />
          <button
            type="submit"
            className={styles.approuver}
            disabled={occupe}
            aria-label={`Approuver ${nom}`}
          >
            {approbationEnCours ? 'Approbation…' : 'Approuver'}
          </button>
        </form>
        <form action={actionRefus}>
          <input type="hidden" name="pharmacieId" value={pharmacieId} />
          <button
            type="submit"
            className={styles.refuser}
            disabled={occupe}
            aria-label={`Refuser ${nom}`}
          >
            {refusEnCours ? 'Refus…' : 'Refuser'}
          </button>
        </form>
      </div>
      {erreur && (
        <p className={styles.erreur} role="alert">
          {erreur}
        </p>
      )}
    </div>
  )
}
