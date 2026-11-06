'use client'

import { useActionState } from 'react'
import {
  addStockItem,
  updateStockStatus,
  removeStockItem,
} from '@/actions/stock'
import styles from './StockForm.module.css'

// À déplacer dans lib/constants.js quand Grasty l'aura créé.
const STATUTS = [
  { valeur: 'DISPONIBLE', libelle: 'Disponible' },
  { valeur: 'STOCK_FAIBLE', libelle: 'Stock faible' },
  { valeur: 'RUPTURE', libelle: 'Rupture' },
]

const formatDate = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
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

function ChampStatut({ id, defaut }) {
  return (
    <select id={id} name="statut" defaultValue={defaut} className={styles.champ}>
      {STATUTS.map((s) => (
        <option key={s.valeur} value={s.valeur}>
          {s.libelle}
        </option>
      ))}
    </select>
  )
}

function LigneStock({ item }) {
  const [etatMaj, actionMaj, enCoursMaj] = useActionState(updateStockStatus, null)
  const [etatRetrait, actionRetrait, enCoursRetrait] = useActionState(
    removeStockItem,
    null,
  )
  const idChamp = `statut-${item.id}`

  return (
    <li className={styles.ligne}>
      <div className={styles.ligneTete}>
        <strong>{item.medicament.nom}</strong>
        <span className={styles.date}>
          Mis à jour le {formatDate.format(new Date(item.modifieLe))}
        </span>
      </div>

      <div className={styles.ligneActions}>
        <form action={actionMaj} className={styles.formLigne}>
          <input type="hidden" name="stockItemId" value={item.id} />
          <label htmlFor={idChamp} className={styles.etiquetteCachee}>
            Statut de {item.medicament.nom}
          </label>
          <ChampStatut id={idChamp} defaut={item.statut} />
          <button type="submit" className={styles.boutonSecondaire} disabled={enCoursMaj}>
            {enCoursMaj ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>

        <form action={actionRetrait}>
          <input type="hidden" name="stockItemId" value={item.id} />
          <button
            type="submit"
            className={styles.boutonDanger}
            disabled={enCoursRetrait}
            aria-label={`Retirer ${item.medicament.nom} du stock`}
          >
            Retirer
          </button>
        </form>
      </div>

      <Message etat={etatMaj} />
      <Message etat={etatRetrait} />
    </li>
  )
}

export default function StockForm({ items = [] }) {
  const [etat, action, enCours] = useActionState(addStockItem, null)

  return (
    <div className={styles.conteneur}>
      <form action={action} className={styles.carte}>
        <h2 className={styles.titre}>Ajouter un médicament</h2>
        <div className={styles.groupe}>
          <label htmlFor="nomMedicament">Nom du médicament</label>
          <input
            id="nomMedicament"
            name="nomMedicament"
            type="text"
            required
            minLength={2}
            maxLength={100}
            autoComplete="off"
            className={styles.champ}
          />
        </div>
        <div className={styles.groupe}>
          <label htmlFor="statut-ajout">Statut</label>
          <ChampStatut id="statut-ajout" defaut="DISPONIBLE" />
        </div>
        <button type="submit" className={styles.bouton} disabled={enCours}>
          {enCours ? 'Ajout en cours…' : 'Ajouter au stock'}
        </button>
        <Message etat={etat} />
      </form>

      <section className={styles.carte} aria-labelledby="titre-liste-stock">
        <h2 id="titre-liste-stock" className={styles.titre}>
          Votre stock ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className={styles.vide}>
            Aucun médicament pour l’instant. Ajoutez le premier avec le formulaire ci-dessus.
          </p>
        ) : (
          <ul className={styles.liste}>
            {items.map((item) => (
              <LigneStock key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
