import Link from 'next/link'
import FormulaireInscription from '@/components/FormulaireInscription'

export default function PageInscription() {
  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h1 className="auth-title">Inscription Pharmacie</h1>
        <p className="auth-subtitle">Rejoignez le réseau Mbongo Pharma</p>
        <FormulaireInscription />
        <p className="auth-switch">
          Déjà un compte ? <Link href="/connexion" className="text-link">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
