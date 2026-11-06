'use client'

import { useActionState } from 'react'
import { inscrire } from '@/actions/auth'

// Ajout de la prop "erreur" pour afficher les erreurs de validation sous chaque champ
function Champ({ id, label, type = 'text', autoComplete, valeur, erreur }) {
  return (
    <div>
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
        defaultValue={valeur ?? ''}
        className="form-input"
        aria-invalid={!!erreur}
      />
      {erreur && <p className="field-error">{erreur}</p>}
    </div>
  )
}

export default function FormulaireInscription() {
  // On initialise l'état à null comme dans votre code
  const [etat, action, enCours] = useActionState(inscrire, null)
  
  // On s'assure que valeurs est toujours un objet pour éviter les crashs
  const valeurs = etat?.valeurs ?? {}
  const erreurs = etat?.erreurs ?? {}

  return (
    <form action={action} className="form-stack">
      {/* Message d'erreur global */}
      {etat?.erreur && (
        <div role="alert" className="form-error">
          ⚠️ {etat.erreur}
        </div>
      )}

      <Champ id="nomPharmacie" label="Nom de la pharmacie" valeur={valeurs.nomPharmacie} erreur={erreurs.nomPharmacie} />
      
      <div>
        <label htmlFor="ville" className="form-label">Ville</label>
        <select id="ville" name="ville" required defaultValue={valeurs.ville ?? ''} className="form-input">
          <option value="" disabled>Choisir une ville</option>
          <option value="BRAZZAVILLE">Brazzaville</option>
          <option value="POINTE_NOIRE">Pointe-Noire</option>
        </select>
        {erreurs.ville && <p className="field-error">{erreurs.ville}</p>}
      </div>

      <div className="form-grid">
        <Champ id="quartier" label="Quartier" valeur={valeurs.quartier} erreur={erreurs.quartier} />
        <Champ id="telephone" label="Téléphone" type="tel" autoComplete="tel" valeur={valeurs.telephone} erreur={erreurs.telephone} />
      </div>

      <Champ id="adresse" label="Adresse complète" autoComplete="street-address" valeur={valeurs.adresse} erreur={erreurs.adresse} />
      <Champ id="email" label="Email professionnel" type="email" autoComplete="email" valeur={valeurs.email} erreur={erreurs.email} />

      <div className="form-grid">
        <Champ id="motDePasse" label="Mot de passe (min 8 car.)" type="password" autoComplete="new-password" erreur={erreurs.motDePasse} />
        <Champ id="confirmation" label="Confirmer le mot de passe" type="password" autoComplete="new-password" erreur={erreurs.confirmation} />
      </div>

      <button type="submit" disabled={enCours} className="button-primary">
        {enCours ? 'Création de votre compte…' : 'Créer mon compte pharmacie'}
      </button>
    </form>
  )
}