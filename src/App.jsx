import { useEffect, useState } from "react";
import "./App.css";

import {
  getPopularMovies,
  searchMovies,
  getMovieDetails,
  getMovieProviders,
} from "./tmdb";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieProviders, setMovieProviders] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadPopularMovies();
  }, []);

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
      setError("We couldn't complete your search.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMovieClick(movieId) {
    try {
      setDetailsLoading(true);
      setError("");

      const [details, providers] = await Promise.all([
        getMovieDetails(movieId),
        getMovieProviders(movieId),
      ]);

      setSelectedMovie(details);
      setMovieProviders(providers);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (requestError) {
      console.error(requestError);
      setError("We couldn't load the movie details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeMovieDetails() {
    setSelectedMovie(null);
    setMovieProviders(null);
  }

  async function handleBackToPopular() {
    await loadPopularMovies();

    setActiveSearch("");
    setSearchQuery("");
  }

  function getReleaseYear(releaseDate) {
    if (!releaseDate) {
      return "Unknown";
    }

    return releaseDate.substring(0, 4);
  }

  function formatRuntime(runtime) {
    if (!runtime) {
      return "Not available";
    }

    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;

    if (hours === 0) {
      return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
  }

  function getUniqueProviders() {
    if (!movieProviders) {
      return [];
    }

    const providers = [
      ...(movieProviders.flatrate || []),
      ...(movieProviders.free || []),
      ...(movieProviders.ads || []),
    ];

    const uniqueProviders = providers.filter(
      (provider, index, array) =>
        index ===
        array.findIndex(
          (item) => item.provider_id === provider.provider_id,
        ),
    );

    return uniqueProviders;
  }

  if (selectedMovie) {
  return (
    <div className="app">
      {/* Navigation */}
      <header className="navbar">
        <button
          className="logo logo-button"
          onClick={closeMovieDetails}
        >
          STACK<span>FLIX</span>
        </button>

        <nav className="nav-links">
          <button onClick={closeMovieDetails}>
            Discover
          </button>

          <a href="#watchlist">
            My Watchlist
          </a>

          <a href="#about">
            About
          </a>
        </nav>

        <a className="nav-login" href="#login">
          Sign In
        </a>
      </header>

      {/* Main Details Page */}
      <main className="details-page">
        {/* Back Button */}
        <button
          className="back-button"
          onClick={closeMovieDetails}
        >
          ← Back to Movies
        </button>

        {detailsLoading ? (
          <div className="status-message">
            <div className="loading-spinner"></div>
            <p>Loading movie details...</p>
          </div>
        ) : (
          <>
            {/* Movie Hero Section */}
            <section
              className="details-hero"
              style={
                selectedMovie.backdrop_path
                  ? {
                      backgroundImage: `url(${BACKDROP_BASE_URL}${selectedMovie.backdrop_path})`,
                    }
                  : undefined
              }
            >
              <div className="details-layout">
                {/* Movie Poster */}
                <div className="details-poster-container">
                  {selectedMovie.poster_path ? (
                    <img
                      className="details-poster"
                      src={`${IMAGE_BASE_URL}${selectedMovie.poster_path}`}
                      alt={`${selectedMovie.title} poster`}
                    />
                  ) : (
                    <div className="poster-placeholder">
                      <span>NO IMAGE</span>
                    </div>
                  )}
                </div>

                {/* Movie Information */}
                <div className="details-content">
                  <p className="details-label">
                    MOVIE DETAILS
                  </p>

                  <h1 className="details-title">
                    {selectedMovie.title}
                  </h1>

                  {/* Tagline */}
                  {selectedMovie.tagline && (
                    <p className="details-tagline">
                      {selectedMovie.tagline}
                    </p>
                  )}

                  {/* Metadata Cards */}
                  <div className="details-metadata">
                    {/* Rating */}
                    <div className="metadata-card">
                      <div className="metadata-label">
                        Rating
                      </div>

                      <div className="metadata-value rating">
                        ★{" "}
                        {selectedMovie.vote_average
                          ? selectedMovie.vote_average.toFixed(1)
                          : "N/A"}
                      </div>
                    </div>

                    {/* Release Date */}
                    <div className="metadata-card">
                      <div className="metadata-label">
                        Release Date
                      </div>

                      <div className="metadata-value">
                        {selectedMovie.release_date ||
                          "Unknown"}
                      </div>
                    </div>

                    {/* Runtime */}
                    <div className="metadata-card">
                      <div className="metadata-label">
                        Runtime
                      </div>

                      <div className="metadata-value">
                        {formatRuntime(selectedMovie.runtime)}
                      </div>
                    </div>
                  </div>

                  {/* Genres */}
                  {selectedMovie.genres?.length > 0 && (
                    <div className="details-genres">
                      {selectedMovie.genres.map((genre) => (
                        <span
                          className="genre-tag"
                          key={genre.id}
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Overview */}
                  <div className="details-section">
                    <h2>Overview</h2>

                    <p>
                      {selectedMovie.overview ||
                        "No description is available for this movie."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Streaming Section */}
            <section className="streaming-section">
              <p className="details-label">
                STREAMING
              </p>

              <h2>Where to Watch</h2>

              <p>
                Available streaming options in the United States.
              </p>

              {getUniqueProviders().length > 0 ? (
                <div className="provider-list">
                  {getUniqueProviders().map((provider) => (
                    <div
                      className="provider-card"
                      key={provider.provider_id}
                    >
                      {provider.logo_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt={provider.provider_name}
                        />
                      )}

                      <span>
                        {provider.provider_name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-providers">
                  <p>
                    Streaming availability is not currently
                    available for this movie.
                  </p>

                  <p>
                    Availability may vary by location and service.
                  </p>
                </div>
              )}

              {/* Streaming Link */}
              {movieProviders?.link && (
                <a
                  className="streaming-link"
                  href={movieProviders.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Streaming Options →
                </a>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <button
          className="logo logo-button"
          onClick={closeMovieDetails}
        >
          STACK<span>FLIX</span>
        </button>

        <p>
          Discover your next favorite movie.
        </p>

        <p className="copyright">
          © 2026 Stackflix. Built for educational purposes.
        </p>
      </footer>
    </div>
  );
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
              Discover movies, explore new favorites, and keep track
              of everything you want to watch in one place.
            </p>

            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Search for a movie..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
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
                onClick={loadPopularMovies}
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
                <article
                  className="movie-card"
                  key={movie.id}
                  onClick={() => handleMovieClick(movie.id)}
                  role="button"
                  tabIndex="0"
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      handleMovieClick(movie.id);
                    }
                  }}
                >
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
                      onClick={(event) => {
                        event.stopPropagation();

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
              Create your personal watchlist and never forget a movie
              you wanted to watch.
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
            Stackflix helps you discover movies and organize your
            next viewing experience.
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