import { deconnecter } from '@/actions/auth'

export default function BoutonDeconnexion() {
  return (
    <form action={deconnecter}>
      <button type="submit" className="button-logout">
        Déconnexion
      </button>
    </form>
  )
}
