import Image from 'next/image'

export default function Home() {
  return (
    <div className="home-page">
      <div className="hero-content">
        <span className="location-badge">🇨🇬 Brazzaville & Pointe-Noire</span>
        <h1 className="home-title">
          Trouvez votre médicament en stock sans vous déplacer.
        </h1>
        <p className="home-description">
          Plateforme officielle de mise en relation des stocks de pharmacies et des patients au Congo.
        </p>
      </div>

      <div className="hero-visual" aria-label="Illustration de pharmacie et de gestion des stocks">
        <Image
          src="/hero-pharma.svg"
          alt="Illustration d’une pharmacie avec un stock de médicaments"
          width={620}
          height={420}
          priority
          sizes="(max-width: 640px) 100vw, 620px"
          className="hero-image"
        />
      </div>
    </div>
  )
}
