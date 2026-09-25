import { useEffect, useState } from "react";
import "./App.css";

import Auth from "./Auth";
import { supabase } from "./supabaseClient";
import {
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updateWatchlistEntry,
} from "./watchlist";
import {
  getPopularMovies,
  getNowPlayingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  searchMovies,
  getMovieDetails,
  getMovieProviders,
} from "./tmdb";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";

const SECTION_CONFIG = [
  { key: "popular", title: "Popular Movies", eyebrow: "TRENDING NOW" },
  { key: "nowPlaying", title: "Now Playing", eyebrow: "IN THEATERS" },
  { key: "topRated", title: "Top Rated", eyebrow: "CRITIC FAVORITES" },
  { key: "upcoming", title: "Upcoming Releases", eyebrow: "COMING SOON" },
];

function App() {
  const [sections, setSections] = useState({
    popular: [],
    nowPlaying: [],
    topRated: [],
    upcoming: [],
  });
  const [loadingSections, setLoadingSections] = useState(true);
  const [loadingSection, setLoadingSection] = useState("");
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieProviders, setMovieProviders] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [showWatchlistPage, setShowWatchlistPage] = useState(false);

  useEffect(() => {
    loadAllSections();

    const getCurrentUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      if (currentUser) {
        await loadUserWatchlist(currentUser.id);
      }
    };

    getCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        loadUserWatchlist(currentUser.id);
      } else {
        setWatchlist([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserWatchlist(userId) {
    try {
      setWatchlistLoading(true);
      const savedMovies = await getUserWatchlist(userId);
      setWatchlist(savedMovies);
    } catch (requestError) {
      console.error("Error loading watchlist:", requestError);
    } finally {
      setWatchlistLoading(false);
    }
  }

  async function loadAllSections() {
    try {
      setLoadingSections(true);
      setError("");

      const [popular, nowPlaying, topRated, upcoming] = await Promise.all([
        getPopularMovies(),
        getNowPlayingMovies(),
        getTopRatedMovies(),
        getUpcomingMovies(),
      ]);

      setSections({ popular, nowPlaying, topRated, upcoming });
    } catch (requestError) {
      console.error("Error loading movie sections:", requestError);
      setError("We couldn't load the movies. Please try again.");
    } finally {
      setLoadingSections(false);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      clearSearch();
      return;
    }

    try {
      setLoadingSection("search");
      setError("");
      const results = await searchMovies(query);
      setSearchResults(results);
      setActiveSearch(query);
      document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" });
    } catch (requestError) {
      console.error("Search error:", requestError);
      setError("We couldn't complete your search.");
    } finally {
      setLoadingSection("");
    }
  }

  function clearSearch() {
    setActiveSearch("");
    setSearchQuery("");
    setSearchResults([]);
  }

  function goToDiscover() {
    setShowWatchlistPage(false);
    setSelectedMovie(null);
    setMovieProviders(null);
    clearSearch();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  async function handleMovieClick(movieId) {
    try {
      setDetailsLoading(true);
      setError("");
      setShowWatchlistPage(false);

      const [details, providers] = await Promise.all([
        getMovieDetails(movieId),
        getMovieProviders(movieId),
      ]);

      setSelectedMovie(details);
      setMovieProviders(providers);
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (requestError) {
      console.error("Movie details error:", requestError);
      setError("We couldn't load the movie details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeMovieDetails() {
    setSelectedMovie(null);
    setMovieProviders(null);
  }

  async function toggleWatchlist(movie) {
    if (!user) {
      setShowAuth(true);
      return;
    }

    const alreadySaved = watchlist.some(
      (savedMovie) => savedMovie.movie_id === movie.id,
    );

    try {
      if (alreadySaved) {
        await removeFromWatchlist(user.id, movie.id);
        setWatchlist((currentWatchlist) =>
          currentWatchlist.filter((savedMovie) => savedMovie.movie_id !== movie.id),
        );
      } else {
        const savedMovie = await addToWatchlist(user.id, movie);
        setWatchlist((currentWatchlist) => [savedMovie, ...currentWatchlist]);
      }
    } catch (requestError) {
      console.error("Watchlist update error:", requestError);
      alert("We couldn't update your watchlist. Please try again.");
    }
  }

  async function updateSavedMovie(savedMovieId, changes) {
    try {
      const updatedMovie = await updateWatchlistEntry(
        user.id,
        savedMovieId,
        changes,
      );

      setWatchlist((currentWatchlist) =>
        currentWatchlist.map((movie) =>
          movie.id === savedMovieId ? { ...movie, ...updatedMovie } : movie,
        ),
      );
    } catch (requestError) {
      console.error("Watchlist preference update error:", requestError);
      alert("We couldn't save that change. Please try again.");
    }
  }

  async function removeSavedMovie(movieId) {
    try {
      await removeFromWatchlist(user.id, movieId);
      setWatchlist((currentWatchlist) =>
        currentWatchlist.filter((savedMovie) => savedMovie.movie_id !== movieId),
      );
    } catch (requestError) {
      console.error("Error removing movie:", requestError);
      alert("We couldn't remove this movie. Please try again.");
    }
  }

  function getDisplayName() {
    const name =
      user?.user_metadata?.username ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "User";

    return name.trim().split(/\s+/)[0];
  }

  function getWelcomeMessage() {
    return `Welcome, ${getDisplayName()}`;
  }

  function getReleaseYear(releaseDate) {
    return releaseDate ? releaseDate.substring(0, 4) : "Unknown";
  }

  function formatRuntime(runtime) {
    if (!runtime) return "Not available";
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    if (!hours) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }

  function getUniqueProviders() {
    if (!movieProviders) return [];

    const providers = [
      ...(movieProviders.flatrate || []),
      ...(movieProviders.free || []),
      ...(movieProviders.ads || []),
    ];

    return providers.filter(
      (provider, index, array) =>
        index === array.findIndex((item) => item.provider_id === provider.provider_id),
    );
  }

  function renderUserMenu() {
    if (!user) {
      return (
        <button className="nav-login" onClick={() => setShowAuth(true)}>
          Login
        </button>
      );
    }

    return (
      <div className="user-menu">
        <span className="welcome-message">{getWelcomeMessage()}</span>
        <button className="nav-login" onClick={() => supabase.auth.signOut()}>
          Sign Out
        </button>
      </div>
    );
  }

  function renderNavigation({ details = false, watchlistPage = false } = {}) {
    return (
      <header className="navbar">
        <button className="logo logo-button" onClick={goToDiscover}>
          STACK<span>FLIX</span>
        </button>

        <nav className="nav-links">
          <button
            className={!details && !watchlistPage ? "active-nav-link" : ""}
            onClick={goToDiscover}
          >
            Discover
          </button>
          <button
            className={watchlistPage ? "active-nav-link" : ""}
            onClick={() => {
              closeMovieDetails();
              clearSearch();
              setShowWatchlistPage(true);
              window.scrollTo({ top: 0, behavior: "auto" });
            }}
          >
            My Watchlist
          </button>
          <button className="nav-about-button" onClick={goToAbout}>
            About
          </button>
        </nav>

        {renderUserMenu()}
      </header>
    );
  }

  function goToAbout() {
    if (selectedMovie || showWatchlistPage) {
      goToDiscover();
    }

    setTimeout(() => {
      document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }

  function renderMovieCard(movie) {
    const saved = watchlist.some((savedMovie) => savedMovie.movie_id === movie.id);

    return (
      <article
        className="movie-card"
        key={movie.id}
        onClick={() => handleMovieClick(movie.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
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
            <div className="poster-placeholder">NO IMAGE</div>
          )}
          <div className="movie-rating">
            ★ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
          </div>
        </div>

        <div className="movie-info">
          <h3>{movie.title}</h3>
          <p className="movie-year">{getReleaseYear(movie.release_date)}</p>
          <button
            className={`watchlist-button ${saved ? "saved" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              toggleWatchlist(movie);
            }}
          >
            {saved ? "✓ In Watchlist" : "+ Add to Watchlist"}
          </button>
        </div>
      </article>
    );
  }

  function renderMovieSection(section) {
    const movies = sections[section.key] || [];

    return (
      <section className="movie-section" key={section.key}>
        <div className="section-header">
          <div>
            <p className="section-label">{section.eyebrow}</p>
            <h2>{section.title}</h2>
          </div>
          <span className="section-count">{movies.length} movies</span>
        </div>

        <div className="movie-grid">
          {movies.map((movie) => renderMovieCard(movie))}
        </div>
      </section>
    );
  }

  function renderWatchlistCard(savedMovie) {
    const watched = Boolean(savedMovie.watched);

    return (
      <article
        className="movie-card watchlist-card"
        key={savedMovie.id}
        onClick={() => handleMovieClick(savedMovie.movie_id)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleMovieClick(savedMovie.movie_id);
          }
        }}
      >
        <div className="movie-poster-container">
          {savedMovie.poster_path ? (
            <img
              className="movie-poster"
              src={`${IMAGE_BASE_URL}${savedMovie.poster_path}`}
              alt={`${savedMovie.movie_title} poster`}
            />
          ) : (
            <div className="poster-placeholder">NO IMAGE</div>
          )}
          <span className={`watch-status-badge ${watched ? "watched" : "to-watch"}`}>
            {watched ? "Watched" : "To Watch"}
          </span>
        </div>

        <div className="movie-info">
          <h3>{savedMovie.movie_title}</h3>
          <p className="movie-year">{getReleaseYear(savedMovie.release_date)}</p>

          <div className="watchlist-controls" onClick={(event) => event.stopPropagation()}>
            <button
              className={`status-toggle ${watched ? "is-watched" : ""}`}
              onClick={() => updateSavedMovie(savedMovie.id, { watched: !watched })}
            >
              {watched ? "✓ Watched" : "Mark as Watched"}
            </button>

            <label className="score-field">
              <span>Your score</span>
              <select
                value={savedMovie.personal_score ?? ""}
                onChange={(event) =>
                  updateSavedMovie(savedMovie.id, {
                    personal_score: event.target.value ? Number(event.target.value) : null,
                  })
                }
              >
                <option value="">— / 10</option>
                {Array.from({ length: 10 }, (_, index) => index + 1).map((score) => (
                  <option value={score} key={score}>{score} / 10</option>
                ))}
              </select>
            </label>

            <button
              className="remove-link"
              onClick={() => removeSavedMovie(savedMovie.movie_id)}
            >
              Remove
            </button>
          </div>
        </div>
      </article>
    );
  }

  if (showAuth) {
    return <Auth onClose={() => setShowAuth(false)} />;
  }

  if (showWatchlistPage) {
    const toWatch = watchlist.filter((movie) => !movie.watched);
    const watchedMovies = watchlist.filter((movie) => movie.watched);

    return (
      <div className="app">
        {renderNavigation({ watchlistPage: true })}

        <main className="watchlist-page">
          <div className="watchlist-page-header">
            <button type="button" className="watchlist-back-button" onClick={goToDiscover}>
              <span aria-hidden="true">←</span>
              Back to Discover
            </button>
            <p className="section-label">YOUR PERSONAL CINEMA</p>
            <h1>My Watchlist</h1>
            <p>Keep track of what you want to watch, what you finished, and your personal ratings.</p>
          </div>

          {!user ? (
            <div className="empty-state">
              <h2>Login to view your watchlist</h2>
              <p>Save movies and keep your next movie night organized.</p>
              <button className="primary-button" onClick={() => setShowAuth(true)}>
                Login to Continue →
              </button>
            </div>
          ) : watchlistLoading ? (
            <div className="status-message">
              <div className="loading-spinner" />
              <p>Loading your watchlist...</p>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="empty-state">
              <h2>Your watchlist is empty</h2>
              <p>Explore the movie sections and save something for your next movie night.</p>
              <button className="primary-button" onClick={goToDiscover}>
                Discover Movies →
              </button>
            </div>
          ) : (
            <div className="watchlist-groups">
              <section className="watchlist-group">
                <div className="section-header">
                  <div>
                    <p className="section-label">UP NEXT</p>
                    <h2>To Watch</h2>
                  </div>
                  <span className="section-count">{toWatch.length} movies</span>
                </div>
                {toWatch.length ? (
                  <div className="movie-grid watchlist-grid">{toWatch.map(renderWatchlistCard)}</div>
                ) : (
                  <div className="empty-inline">You have no unwatched movies saved.</div>
                )}
              </section>

              <section className="watchlist-group">
                <div className="section-header">
                  <div>
                    <p className="section-label">YOUR HISTORY</p>
                    <h2>Watched</h2>
                  </div>
                  <span className="section-count">{watchedMovies.length} movies</span>
                </div>
                {watchedMovies.length ? (
                  <div className="movie-grid watchlist-grid">{watchedMovies.map(renderWatchlistCard)}</div>
                ) : (
                  <div className="empty-inline">Movies you mark as watched will appear here.</div>
                )}
              </section>
            </div>
          )}
        </main>

        <footer className="footer">
          <button className="logo logo-button" onClick={goToDiscover}>STACK<span>FLIX</span></button>
          <p>Discover your next favorite movie.</p>
          <p className="copyright">© 2026 Stackflix. Built for educational purposes.</p>
        </footer>
      </div>
    );
  }

  if (selectedMovie) {
    const saved = watchlist.some((movie) => movie.movie_id === selectedMovie.id);

    return (
      <div className="app">
        {renderNavigation({ details: true })}

        <main className="details-page">
          <button type="button" className="details-back-button" onClick={closeMovieDetails}>
            <span aria-hidden="true">←</span>
            Back to Discover
          </button>

          {detailsLoading ? (
            <div className="status-message"><div className="loading-spinner" /><p>Loading movie details...</p></div>
          ) : (
            <>
              <section
                className="details-hero"
                style={selectedMovie.backdrop_path ? { backgroundImage: `url(${BACKDROP_BASE_URL}${selectedMovie.backdrop_path})` } : undefined}
              >
                <div className="details-overlay" />
                <div className="details-layout">
                  <div className="details-poster-container">
                    {selectedMovie.poster_path ? (
                      <img className="details-poster" src={`${IMAGE_BASE_URL}${selectedMovie.poster_path}`} alt={`${selectedMovie.title} poster`} />
                    ) : (
                      <div className="poster-placeholder">NO IMAGE</div>
                    )}
                  </div>

                  <div className="details-content">
                    <p className="details-label">MOVIE DETAILS</p>
                    <h1 className="details-title">{selectedMovie.title}</h1>
                    {selectedMovie.tagline && <p className="details-tagline">{selectedMovie.tagline}</p>}

                    <div className="details-metadata">
                      <div className="metadata-card"><span className="metadata-label">Rating</span><strong className="metadata-value rating">★ {selectedMovie.vote_average ? selectedMovie.vote_average.toFixed(1) : "N/A"}</strong></div>
                      <div className="metadata-card"><span className="metadata-label">Release Date</span><strong className="metadata-value">{selectedMovie.release_date || "Unknown"}</strong></div>
                      <div className="metadata-card"><span className="metadata-label">Runtime</span><strong className="metadata-value">{formatRuntime(selectedMovie.runtime)}</strong></div>
                    </div>

                    {selectedMovie.genres?.length > 0 && (
                      <div className="details-genres">{selectedMovie.genres.map((genre) => <span className="genre-tag" key={genre.id}>{genre.name}</span>)}</div>
                    )}

                    <div className="details-actions">
                      <button className={`primary-button details-watchlist-button ${saved ? "saved" : ""}`} onClick={() => toggleWatchlist(selectedMovie)}>
                        {saved ? "✓ Remove from Watchlist" : "+ Add to Watchlist"}
                      </button>
                      <button className="secondary-button" onClick={closeMovieDetails}>Continue Discovering</button>
                    </div>
                  </div>
                </div>

                <div className="details-overview-box">
                  <p className="details-label">OVERVIEW</p>
                  <p>{selectedMovie.overview || "No description is available for this movie."}</p>
                </div>
              </section>

              <section className="streaming-section">
                <p className="details-label">STREAMING</p>
                <h2>Where to Watch</h2>
                <p>Available streaming options in the United States.</p>
                {getUniqueProviders().length > 0 ? (
                  <div className="provider-list">
                    {getUniqueProviders().map((provider) => (
                      <div className="provider-card" key={provider.provider_id}>
                        {provider.logo_path && <img src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} alt={provider.provider_name} />}
                        <span>{provider.provider_name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-providers">Streaming availability is not currently available for this movie.</div>
                )}
                {movieProviders?.link && <a className="streaming-link" href={movieProviders.link} target="_blank" rel="noreferrer">View Streaming Options →</a>}
              </section>
            </>
          )}
        </main>

        <footer className="footer">
          <button className="logo logo-button" onClick={closeMovieDetails}>STACK<span>FLIX</span></button>
          <p>Discover your next favorite movie.</p>
          <p className="copyright">© 2026 Stackflix. Built for educational purposes.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="app">
      {renderNavigation()}

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">YOUR NEXT FAVORITE MOVIE</p>
            <h1>Find something<br /><span>worth watching.</span></h1>
            <p className="hero-description">Discover movies, explore new favorites, and keep track of everything you want to watch in one place.</p>

            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Search for a movie..."
                value={searchQuery}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchQuery(value);
                  if (!value.trim() && activeSearch) clearSearch();
                }}
                aria-label="Search for a movie"
              />
              <button className="primary-button" type="submit">Search</button>
            </form>

            <div className="hero-actions">
              <a className="secondary-button" href="#discover">Explore Movies ↓</a>
              <button className="secondary-button" onClick={() => { clearSearch(); setShowWatchlistPage(true); }}>My Watchlist →</button>
            </div>
          </div>

          <div className="hero-decoration" aria-hidden="true">
            <div className="film-card film-card-one"><div className="film-card-top">✦</div><div className="film-card-bottom">PREMIERES</div></div>
            <div className="film-card film-card-two"><div className="film-card-top">▣</div><div className="film-card-bottom">CINEMA</div></div>
            <div className="film-card film-card-three"><div className="film-card-top">★</div><div className="film-card-bottom">YOUR LIST</div></div>
          </div>
        </section>

        <section className="discover-section" id="discover">
          {activeSearch ? (
            <section className="movie-section search-section">
              <div className="section-header">
                <div><p className="section-label">SEARCH RESULTS</p><h2>Results for “{activeSearch}”</h2></div>
                <button className="text-button" onClick={clearSearch}>Clear Search</button>
              </div>
              {loadingSection === "search" ? (
                <div className="status-message"><div className="loading-spinner" /><p>Searching movies...</p></div>
              ) : searchResults.length ? (
                <div className="movie-grid">{searchResults.map((movie) => renderMovieCard(movie))}</div>
              ) : (
                <div className="empty-state"><h2>No movies found</h2><p>Try searching for a different title.</p></div>
              )}
            </section>
          ) : loadingSections ? (
            <div className="status-message page-loading"><div className="loading-spinner" /><p>Loading movie collections...</p></div>
          ) : error ? (
            <div className="status-message error-message"><p>{error}</p><button className="primary-button" onClick={loadAllSections}>Try Again</button></div>
          ) : (
            SECTION_CONFIG.map((section) => renderMovieSection(section))
          )}
        </section>

        <section className="about-section" id="about">
          <p className="section-label">ABOUT STACKFLIX</p>
          <h2>A class project built around the love of movies.</h2>
          <p>Stackflix is a movie discovery and personal watchlist application created for our Engineering Design 2 course. It combines a movie API, authentication, a cloud database, and a responsive interface into one project.</p>
          <div className="about-grid">
            <div className="about-card"><span className="about-card-icon">🎬</span><h3>Discover</h3><p>Explore popular, current, top-rated, and upcoming movies.</p></div>
            <div className="about-card"><span className="about-card-icon">☑</span><h3>Organize</h3><p>Save movies for later and separate your watchlist from your viewing history.</p></div>
            <div className="about-card"><span className="about-card-icon">★</span><h3>Personalize</h3><p>Mark movies as watched and record your own score for future reference.</p></div>
          </div>
          <p className="about-note">Built for educational purposes with React, Supabase, and TMDB.</p>
        </section>
      </main>

      <footer className="footer">
        <button className="logo logo-button" onClick={goToDiscover}>STACK<span>FLIX</span></button>
        <p>Discover your next favorite movie.</p>
        <p className="copyright">© 2026 Stackflix. Built for educational purposes.</p>
      </footer>
    </div>
  );
}

export default App;
