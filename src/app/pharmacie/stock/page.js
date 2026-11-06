import { auth } from '@/auth'

export default async function PageStockPharmacie() {
  const session = await auth()
  return (
    <div className="stock-page">
      <div className="stock-banner">
        <h1 className="stock-title">Espace Pharmacie : {session?.user?.name}</h1>
        <p className="stock-role">Rôle : {session?.user?.role}</p>
      </div>
    </div>
  )
}
