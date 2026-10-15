export default function Home() {
  return (
    <main className="landing">
      <nav className="landing-nav" aria-label="Navegación principal">
        <a className="brand" href="#inicio" aria-label="Firebase Prueba, inicio">
          <span className="brand-mark" aria-hidden="true">f</span>
          <span>Firebase Prueba</span>
        </a>
        <a className="nav-link" href="#sobre">Sobre el proyecto</a>
      </nav>

      <section className="hero" id="inicio">
        <div className="hero-content">
          <p className="eyebrow"><span /> Un proyecto listo para empezar</p>
          <h1>Ideas simples.<br /><span>Grandes posibilidades.</span></h1>
          <p className="hero-copy">
            Esta página ya está en línea. Un espacio sencillo para probar,
            construir y dar vida a lo que viene.
          </p>
          <a className="primary-button" href="#sobre">
            Conoce el proyecto <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="glow" />
          <div className="firebase-symbol">
            <span className="flame flame-left" />
            <span className="flame flame-right" />
            <span className="flame flame-base" />
          </div>
          <div className="art-label"><span /> Todo listo para despegar</div>
        </div>
      </section>

      <section className="about" id="sobre">
        <p>UN BUEN LUGAR PARA COMENZAR</p>
        <h2>El siguiente paso empieza aquí.</h2>
        <span>Gracias por visitarnos.</span>
      </section>

      <footer className="landing-footer">
        <span>Firebase Prueba</span>
        <span>Hecho para lo que sigue <span aria-hidden="true">✳</span></span>
      </footer>
    </main>
  );
}
