export default function HomePage() {
  return (
    <main id="main-content" className="page">
      <header className="hero" aria-labelledby="title">
        <h1 id="title">Alea - Asociación cultural de juegos</h1>
        <p>
          Plataforma de reservas para rol y juegos de mesa, con accesibilidad y diseño responsive.
        </p>
      </header>

      <section aria-labelledby="rooms-title" className="card-grid">
        <h2 id="rooms-title">Salas</h2>
        {[1, 2, 3, 4, 5, 6].map((room) => (
          <article key={room} className="card" aria-label={`Sala ${room}`}>
            <h3>Sala {room}</h3>
            <p>Estado de mesas visible por colores e iconos.</p>
            <button type="button" className="btn-primary">Ver sala</button>
          </article>
        ))}
      </section>
    </main>
  );
}
