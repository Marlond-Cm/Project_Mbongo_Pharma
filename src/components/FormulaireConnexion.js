'use client'

import { useActionState } from 'react'
import { connecter } from '@/actions/auth'

export default function FormulaireConnexion() {
  const [etat, action, enCours] = useActionState(connecter, null)
  const valeurs = etat?.valeurs ?? {}

  return (
    <form action={action} className="form-stack">
      {etat?.erreur && (
        <div role="alert" className="form-error">
           {etat.erreur}
        </div>
      )}
      <div>
        <label htmlFor="email" className="form-label">Email professionnel</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={valeurs.email ?? ''} className="form-input" />
      </div>
      <div>
        <label htmlFor="motDePasse" className="form-label">Mot de passe</label>
        <input id="motDePasse" name="motDePasse" type="password" autoComplete="current-password" required className="form-input" />
      </div>
      <button type="submit" disabled={enCours} className="button-primary">
        {enCours ? 'Connexion en cours…' : 'Se connecter'}
      </button>
    </form>
  )
}
