import { useEffect, useState } from "react";
import "./App.css";
import { getPopularMovies, searchMovies } from "./tmdb";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  useEffect(() => {
    async function loadPopularMovies() {
      try {
        setLoading(true);
        setError("");

        const popularMovies = await getPopularMovies();

        setMovies(popularMovies);
      } catch (requestError) {
        console.error(requestError);
        setError("We couldn't load the movies. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadPopularMovies();
  }, []);

  async function handleSearch(event) {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const searchResults = await searchMovies(query);

      setMovies(searchResults);
      setActiveSearch(query);
    } catch (requestError) {
      console.error(requestError);
      setError("We couldn't complete your search. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBackToPopular() {
    try {
      setLoading(true);
      setError("");

      const popularMovies = await getPopularMovies();

      setMovies(popularMovies);
      setActiveSearch("");
      setSearchQuery("");
    } catch (requestError) {
      console.error(requestError);
      setError("We couldn't load popular movies.");
    } finally {
      setLoading(false);
    }
  }

  function getReleaseYear(releaseDate) {
    if (!releaseDate) {
      return "Unknown";
    }

    return releaseDate.substring(0, 4);
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="#">
          STACK<span>FLIX</span>
        </a>

        <nav className="nav-links">
          <a href="#discover">Discover</a>
          <a href="#watchlist">My Watchlist</a>
          <a href="#about">About</a>
        </nav>

        <a className="nav-login" href="#login">
          Sign In
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">YOUR NEXT FAVORITE MOVIE</p>

            <h1>
              Find something
              <br />
              <span>worth watching.</span>
            </h1>

            <p className="hero-description">
              Discover movies, explore new favorites, and keep track of
              everything you want to watch in one place.
            </p>

            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Search for a movie..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search for a movie"
              />

              <button className="primary-button" type="submit">
                Search
              </button>
            </form>

            <div className="hero-actions">
              <a className="secondary-button" href="#discover">
                Explore Movies ↓
              </a>

              <a className="secondary-button" href="#watchlist">
                My Watchlist →
              </a>
            </div>
          </div>

          <div className="hero-decoration">
            <div className="film-card film-card-one">
              <div className="film-card-top">★</div>
              <div className="film-card-bottom">MOVIES</div>
            </div>

            <div className="film-card film-card-two">
              <div className="film-card-top">▶</div>
              <div className="film-card-bottom">STREAM</div>
            </div>

            <div className="film-card film-card-three">
              <div className="film-card-top">+</div>
              <div className="film-card-bottom">WATCHLIST</div>
            </div>
          </div>
        </section>

        <section className="movie-section" id="discover">
          <div className="section-header">
            <div>
              <p className="section-label">EXPLORE</p>

              <h2>
                {activeSearch
                  ? `Search Results for "${activeSearch}"`
                  : "Popular Movies"}
              </h2>
            </div>

            {activeSearch && (
              <button
                className="text-button"
                onClick={handleBackToPopular}
              >
                ← Back to Popular Movies
              </button>
            )}
          </div>

          {loading && (
            <div className="status-message">
              <div className="loading-spinner"></div>
              <p>Loading movies...</p>
            </div>
          )}

          {error && !loading && (
            <div className="status-message error-message">
              <p>{error}</p>

              <button
                className="primary-button"
                onClick={handleBackToPopular}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && movies.length === 0 && (
            <div className="status-message">
              <p>No movies found. Try another search.</p>
            </div>
          )}

          {!loading && !error && movies.length > 0 && (
            <div className="movie-grid">
              {movies.map((movie) => (
                <article className="movie-card" key={movie.id}>
                  <div className="movie-poster-container">
                    {movie.poster_path ? (
                      <img
                        className="movie-poster"
                        src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                        alt={`${movie.title} poster`}
                      />
                    ) : (
                      <div className="poster-placeholder">
                        <span>NO IMAGE</span>
                      </div>
                    )}

                    <div className="movie-rating">
                      ★{" "}
                      {movie.vote_average
                        ? movie.vote_average.toFixed(1)
                        : "N/A"}
                    </div>
                  </div>

                  <div className="movie-info">
                    <h3>{movie.title}</h3>

                    <p className="movie-year">
                      {getReleaseYear(movie.release_date)}
                    </p>

                    <button
                      className="watchlist-button"
                      onClick={() => {
                        alert(
                          `"${movie.title}" will be added to your watchlist in a future update.`,
                        );
                      }}
                    >
                      + Add to Watchlist
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="watchlist-section" id="watchlist">
          <div className="watchlist-content">
            <p className="section-label">KEEP TRACK</p>

            <h2>Your next movie night starts here.</h2>

            <p>
              Create your personal watchlist and never forget a movie you
              wanted to watch.
            </p>

            <a className="primary-button" href="#login">
              Create Your Watchlist →
            </a>
          </div>
        </section>

        <section className="about-section" id="about">
          <p className="section-label">ABOUT STACKFLIX</p>

          <h2>Less scrolling. More watching.</h2>

          <p>
            Stackflix helps you discover movies and organize your next
            viewing experience. Search for movies, explore popular titles,
            and build your personal watchlist.
          </p>
        </section>
      </main>

      <footer className="footer">
        <a className="logo" href="#">
          STACK<span>FLIX</span>
        </a>

        <p>Discover your next favorite movie.</p>

        <p className="copyright">
          © 2026 Stackflix. Built for educational purposes.
        </p>
      </footer>
    </div>
  );
}

export default App;