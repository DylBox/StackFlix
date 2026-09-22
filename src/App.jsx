
import "./App.css";

const featuredMovies = [
  {
    id: 1,
    title: "Interstellar",
    year: 2014,
    genre: "Sci-Fi",
    rating: "8.7",
    image:
      "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },
  {
    id: 2,
    title: "The Dark Knight",
    year: 2008,
    genre: "Action",
    rating: "9.0",
    image:
      "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  },
  {
    id: 3,
    title: "Inception",
    year: 2010,
    genre: "Thriller",
    rating: "8.8",
    image:
      "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  },
  {
    id: 4,
    title: "Spider-Man: Into the Spider-Verse",
    year: 2018,
    genre: "Animation",
    rating: "8.4",
    image:
      "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
  },
];

function App() {
  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">▶</span>
          STACKFLIX
        </div>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#discover">Discover</a>
          <a href="#watchlist">My Watchlist</a>
        </nav>

        <button className="login-button">Sign In</button>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">YOUR NEXT FAVORITE MOVIE</p>

            <h1>
              Discover movies.
              <br />
              Build your watchlist.
            </h1>

            <p className="hero-description">
              Find your next favorite movie, explore where to stream it,
              and keep track of everything you want to watch.
            </p>

            <div className="hero-actions">
              <button className="primary-button">Explore Movies</button>
              <button className="secondary-button">My Watchlist →</button>
            </div>
          </div>

          <div className="hero-decoration">
            <div className="floating-card card-one">🎬</div>
            <div className="floating-card card-two">🍿</div>
            <div className="floating-card card-three">⭐</div>
          </div>
        </section>

        <section className="movie-section" id="discover">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EXPLORE</p>
              <h2>Popular Movies</h2>
            </div>

            <button className="text-button">View all →</button>
          </div>

          <div className="movie-grid">
            {featuredMovies.map((movie) => (
              <article className="movie-card" key={movie.id}>
                <div className="poster-wrapper">
                  <img src={movie.image} alt={movie.title} />
                  <span className="rating">★ {movie.rating}</span>
                </div>

                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p>
                    {movie.year} · {movie.genre}
                  </p>
                  <button className="watchlist-button">
                    + Add to watchlist
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section" id="watchlist">
          <p className="eyebrow">KEEP TRACK OF YOUR FAVORITES</p>
          <h2>Your watchlist, all in one place.</h2>
          <p>
            Create an account to save movies and access your watchlist
            from anywhere.
          </p>
          <button className="primary-button">Create Account</button>
        </section>
      </main>

      <footer className="footer">
        <div className="logo">
          <span className="logo-icon">▶</span>
          STACKFLIX
        </div>
        <p>Discover something worth watching.</p>
      </footer>
    </div>
  );
}

export default App;