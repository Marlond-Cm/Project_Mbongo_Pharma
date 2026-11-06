'use client'
import { useActionState } from 'react'
import { addDutyPeriod, deleteDutyPeriod } from '@/actions/admin'
import styles from './DutyForm.module.css'

const VILLES = { BRAZZAVILLE: 'Brazzaville', POINTE_NOIRE: 'Pointe-Noire' }

const formatDate = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Brazzaville',
})

function Message({ etat }) {
  if (etat?.erreur) {
    return (
      <p className={styles.erreur} role="alert">
        {etat.erreur}
      </p>
    )
  }
  if (etat?.succes) {
    return (
      <p className={styles.succes} role="status">
        {etat.succes}
      </p>
    )
  }
  return null
}

function LigneGarde({ garde }) {
  const [etat, action, enCours] = useActionState(deleteDutyPeriod, null)
  const { pharmacie } = garde

  return (
    <li className={styles.ligne}>
      <div className={styles.ligneTete}>
        <div>
          <strong>{pharmacie.nom}</strong>
          <span className={styles.lieu}>
            {' '}
            ({pharmacie.quartier}, {VILLES[pharmacie.ville]})
          </span>
        </div>
        {garde.enCours && <span className={styles.enCours}>En cours</span>}
      </div>
      <p className={styles.periode}>
        Du {formatDate.format(new Date(garde.dateDebut))} au{' '}
        {formatDate.format(new Date(garde.dateFin))}
      </p>
      <form action={action}>
        <input type="hidden" name="gardeId" value={garde.id} />
        <button
          type="submit"
          className={styles.boutonDanger}
          disabled={enCours}
          aria-label={`Supprimer la garde de ${pharmacie.nom}`}
        >
          {enCours ? 'Suppression…' : 'Supprimer'}
        </button>
      </form>
      <Message etat={etat} />
    </li>
  )
}

export default function DutyForm({ pharmacies = [], gardes = [] }) {
  const [etat, action, enCours] = useActionState(addDutyPeriod, null)

  return (
    <div className={styles.conteneur}>
      <form action={action} className={styles.carte}>
        <h2 className={styles.titre}>Ajouter une garde</h2>

        <div className={styles.groupe}>
          <label htmlFor="pharmacieId">Pharmacie</label>
          <select
            id="pharmacieId"
            name="pharmacieId"
            required
            defaultValue=""
            className={styles.champ}
          >
            <option value="" disabled>
              Choisir une pharmacie
            </option>
            {pharmacies.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom} ({p.quartier}, {VILLES[p.ville]})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.dates}>
          <div className={styles.groupe}>
            <label htmlFor="dateDebut">Début de la garde</label>
            <input
              id="dateDebut"
              name="dateDebut"
              type="datetime-local"
              required
              className={styles.champ}
            />
          </div>
          <div className={styles.groupe}>
            <label htmlFor="dateFin">Fin de la garde</label>
            <input
              id="dateFin"
              name="dateFin"
              type="datetime-local"
              required
              className={styles.champ}
            />
          </div>
        </div>

        <button type="submit" className={styles.bouton} disabled={enCours}>
          {enCours ? 'Ajout en cours…' : 'Ajouter la garde'}
        </button>
        <Message etat={etat} />
      </form>

      <section className={styles.carte} aria-labelledby="titre-liste-gardes">
        <h2 id="titre-liste-gardes" className={styles.titre}>
          Gardes en cours et à venir ({gardes.length})
        </h2>
        {gardes.length === 0 ? (
          <p className={styles.vide}>
            Aucune garde planifiée. La page « Pharmacies de garde » sera vide tant
            qu’aucune garde n’est ajoutée.
          </p>
        ) : (
          <ul className={styles.liste}>
            {gardes.map((garde) => (
              <LigneGarde key={garde.id} garde={garde} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
