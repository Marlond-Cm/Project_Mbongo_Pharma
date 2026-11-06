import Link from 'next/link'
import FormulaireConnexion from '@/components/FormulaireConnexion'
 

export default function PageConnexion() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Connexion Pro</h1>
        <p className="auth-subtitle">Accédez à votre espace pharmacie</p>
        <FormulaireConnexion />
        <p className="auth-switch">
          Pas de compte ? <Link href="/inscription" className="text-link">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}
