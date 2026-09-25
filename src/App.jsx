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
  getPopularTvShows,
  getTopRatedTvShows,
  getOnTheAirTvShows,
  searchMovies,
  searchTvShows,
  getMovieDetails,
  getTvDetails,
  getMovieProviders,
  getTvProviders,
  getMovieVideos,
  getTvVideos,
  getMovieCredits,
  getTvCredits,
  getMovieExternalIds,
  getTvExternalIds,
  getTvSeasonDetails,
} from "./tmdb";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";
const PROVIDER_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w92";

const MOVIE_SECTIONS = [
  { key: "popular", title: "Popular Movies", eyebrow: "TRENDING NOW" },
  { key: "nowPlaying", title: "Now Playing", eyebrow: "IN THEATERS" },
  { key: "topRated", title: "Top Rated", eyebrow: "CRITIC FAVORITES" },
  { key: "upcoming", title: "Upcoming Releases", eyebrow: "COMING SOON" },
];

const TV_SECTIONS = [
  { key: "popular", title: "Popular Series", eyebrow: "TRENDING SERIES" },
  { key: "topRated", title: "Top Rated Series", eyebrow: "FAN FAVORITES" },
  { key: "onTheAir", title: "Currently Airing", eyebrow: "WATCH WEEKLY" },
];

function App() {
  const [contentType, setContentType] = useState("movie");
  const [sections, setSections] = useState({});
  const [loadingSections, setLoadingSections] = useState(true);
  const [loadingSection, setLoadingSection] = useState("");
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState("movie");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [movieProviders, setMovieProviders] = useState(null);
  const [videos, setVideos] = useState([]);
  const [credits, setCredits] = useState(null);
  const [externalIds, setExternalIds] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonDetails, setSeasonDetails] = useState(null);

  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [showWatchlistPage, setShowWatchlistPage] = useState(false);
  const [showWatchPartyPage, setShowWatchPartyPage] = useState(false);
  const [ratingPromptId, setRatingPromptId] = useState(null);
  const [heroItems, setHeroItems] = useState([]);

  const sectionsConfig = contentType === "movie" ? MOVIE_SECTIONS : TV_SECTIONS;

  useEffect(() => {
    const allItems = Object.values(sections).flat();
    const uniqueItems = Array.from(
      new Map(allItems.map((item) => [item.id, item])).values(),
    );
    const shuffledItems = [...uniqueItems].sort(() => Math.random() - 0.5);
    setHeroItems(shuffledItems.slice(0, 3));
  }, [sections, contentType]);

  useEffect(() => {
    loadSections(contentType);

    const getCurrentUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) await loadUserWatchlist(currentUser.id);
    };

    getCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) loadUserWatchlist(currentUser.id);
      else setWatchlist([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserWatchlist(userId) {
    try {
      setWatchlistLoading(true);
      setWatchlist(await getUserWatchlist(userId));
    } catch (requestError) {
      console.error("Error loading watchlist:", requestError);
    } finally {
      setWatchlistLoading(false);
    }
  }

  async function loadSections(type) {
    try {
      setLoadingSections(true);
      setError("");
      const data =
        type === "movie"
          ? await Promise.all([
              getPopularMovies(),
              getNowPlayingMovies(),
              getTopRatedMovies(),
              getUpcomingMovies(),
            ]).then(([popular, nowPlaying, topRated, upcoming]) => ({
              popular,
              nowPlaying,
              topRated,
              upcoming,
            }))
          : await Promise.all([
              getPopularTvShows(),
              getTopRatedTvShows(),
              getOnTheAirTvShows(),
            ]).then(([popular, topRated, onTheAir]) => ({
              popular,
              topRated,
              onTheAir,
            }));
      setSections(data);
    } catch (requestError) {
      console.error("Error loading sections:", requestError);
      setError("We couldn't load this collection. Please try again.");
    } finally {
      setLoadingSections(false);
    }
  }

  async function switchContentType(type) {
    if (type === contentType) return;
    clearSearch();
    setContentType(type);
    await loadSections(type);
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
      const results =
        contentType === "movie"
          ? await searchMovies(query)
          : await searchTvShows(query);
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
    setShowWatchPartyPage(false);
    setSelectedItem(null);
    setMovieProviders(null);
    setVideos([]);
    setCredits(null);
    setExternalIds(null);
    setSelectedSeason(null);
    setSeasonDetails(null);
    clearSearch();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  async function handleItemClick(itemId, type = contentType) {
    try {
      setDetailsLoading(true);
      setError("");
      setShowWatchlistPage(false);
      setSelectedMediaType(type);
      setSelectedSeason(null);
      setSeasonDetails(null);

      const [details, providers, itemVideos, itemCredits, ids] = await Promise.all([
        type === "movie" ? getMovieDetails(itemId) : getTvDetails(itemId),
        type === "movie" ? getMovieProviders(itemId) : getTvProviders(itemId),
        type === "movie" ? getMovieVideos(itemId) : getTvVideos(itemId),
        type === "movie" ? getMovieCredits(itemId) : getTvCredits(itemId),
        type === "movie" ? getMovieExternalIds(itemId) : getTvExternalIds(itemId),
      ]);

      setSelectedItem(details);
      setMovieProviders(providers);
      setVideos(itemVideos);
      setCredits(itemCredits);
      setExternalIds(ids);
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (requestError) {
      console.error("Details error:", requestError);
      setError("We couldn't load the details. Please try again.");
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeDetails() {
    setSelectedItem(null);
    setMovieProviders(null);
    setVideos([]);
    setCredits(null);
    setExternalIds(null);
    setSelectedSeason(null);
    setSeasonDetails(null);
  }

  async function loadSeason(seasonNumber) {
    if (selectedMediaType !== "tv" || !selectedItem) return;
    try {
      setSelectedSeason(seasonNumber);
      setSeasonDetails(await getTvSeasonDetails(selectedItem.id, seasonNumber));
    } catch (requestError) {
      console.error("Season error:", requestError);
    }
  }

  async function toggleWatchlist(item, type = selectedMediaType) {
    if (!user) {
      setShowAuth(true);
      return;
    }

    const itemId = item.id;
    const saved = watchlist.find(
      (entry) => entry.movie_id === itemId && (entry.media_type || "movie") === type,
    );

    try {
      if (saved) {
        await removeFromWatchlist(user.id, itemId, type);
        setWatchlist((current) => current.filter((entry) => entry.id !== saved.id));
      } else {
        const savedItem = await addToWatchlist(user.id, item, type);
        setWatchlist((current) => [savedItem, ...current]);
      }
    } catch (requestError) {
      console.error("Watchlist update error:", requestError);
      alert("We couldn't update your watchlist. Please try again.");
    }
  }

  async function updateSavedMovie(savedMovieId, changes) {
    if (!user) return;
    try {
      const updated = await updateWatchlistEntry(user.id, savedMovieId, changes);
      setWatchlist((current) =>
        current.map((entry) => (entry.id === savedMovieId ? { ...entry, ...updated } : entry)),
      );
      if (Object.prototype.hasOwnProperty.call(changes, "watched") && changes.watched) {
        setRatingPromptId(savedMovieId);
      }
    } catch (requestError) {
      console.error("Watchlist preference error:", requestError);
      alert("We couldn't save that change. Please run the watchlist UPDATE policy in Supabase, then try again.");
    }
  }

  async function removeSavedMovie(savedMovie) {
    try {
      await removeFromWatchlist(user.id, savedMovie.movie_id, savedMovie.media_type || "movie");
      setWatchlist((current) => current.filter((entry) => entry.id !== savedMovie.id));
    } catch (requestError) {
      console.error("Remove error:", requestError);
      alert("We couldn't remove this item. Please try again.");
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

  function getReleaseDate(item, type) {
    return type === "tv" ? item.first_air_date || "Unknown" : item.release_date || "Unknown";
  }

  function getTitle(item, type) {
    return type === "tv" ? item.name || item.original_name : item.title;
  }

  function getReleaseYear(date) {
    return date ? date.substring(0, 4) : "Unknown";
  }

  function formatRuntime(minutes) {
    if (!minutes) return "Not available";
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return hours ? `${hours}h ${remaining}m` : `${remaining}m`;
  }

  function getUniqueProviders() {
    if (!movieProviders) return [];
    const providers = [
      ...(movieProviders.flatrate || []),
      ...(movieProviders.free || []),
      ...(movieProviders.ads || []),
      ...(movieProviders.rent || []),
      ...(movieProviders.buy || []),
    ];
    return providers.filter(
      (provider, index, array) =>
        index === array.findIndex((entry) => entry.provider_id === provider.provider_id),
    );
  }

  function getProviderHref(provider) {
    const title = getTitle(selectedItem, selectedMediaType);
    const year = getReleaseYear(getReleaseDate(selectedItem, selectedMediaType));
    const query = encodeURIComponent(`${title} ${year}`);
    const name = provider.provider_name.toLowerCase();
    if (name.includes("amazon") || name.includes("prime")) return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${query}`;
    if (name.includes("netflix")) return `https://www.netflix.com/search?q=${query}`;
    if (name.includes("disney")) return `https://www.disneyplus.com/search?q=${query}`;
    if (name.includes("hulu")) return `https://www.hulu.com/search?q=${query}`;
    if (name.includes("apple tv")) return `https://tv.apple.com/us/search?term=${query}`;
    if (name.includes("peacock")) return `https://www.peacocktv.com/search?query=${query}`;
    return movieProviders?.link || `https://www.google.com/search?q=${encodeURIComponent(`${provider.provider_name} ${title}`)}`;
  }

  function getPersonHref(person) {
    return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(person.name)}`;
  }

  function getTrailer() {
    return videos.find(
      (video) => video.site === "YouTube" && video.type === "Trailer" && video.key,
    ) || videos.find((video) => video.site === "YouTube" && video.key);
  }

  function getExternalLinks() {
    const title = getTitle(selectedItem, selectedMediaType);
    const year = getReleaseYear(getReleaseDate(selectedItem, selectedMediaType));
    const query = encodeURIComponent(`${title} ${year}`);
    const links = [
      externalIds?.imdb_id && {
        label: "IMDb",
        href: `https://www.imdb.com/title/${externalIds.imdb_id}/`,
      },
      { label: "Rotten Tomatoes", href: `https://www.rottentomatoes.com/search?search=${query}` },
      { label: "Metacritic", href: `https://www.metacritic.com/search/${query}/` },
      { label: "Wikipedia", href: `https://en.wikipedia.org/wiki/Special:Search?search=${query}` },
      movieProviders?.link && { label: "JustWatch", href: movieProviders.link },
    ];
    return links.filter(Boolean);
  }

  function renderUserMenu() {
    return user ? (
      <div className="user-menu">
        <span className="welcome-message">Welcome, {getDisplayName()}</span>
        <button className="nav-login" onClick={() => supabase.auth.signOut()}>Sign Out</button>
      </div>
    ) : (
      <button className="nav-login" onClick={() => setShowAuth(true)}>Login</button>
    );
  }

  function renderNavigation({ details = false, watchlistPage = false } = {}) {
    return (
      <header className="navbar">
        <button className="logo logo-button" onClick={goToDiscover}>STACK<span>FLIX</span></button>
        <nav className="nav-links">
          <button className={!details && !watchlistPage && !showWatchPartyPage ? "active-nav-link" : ""} onClick={goToDiscover}>Discover</button>
          <button
            className={watchlistPage ? "active-nav-link" : ""}
            onClick={() => {
              closeDetails();
              clearSearch();
              setShowWatchPartyPage(false);
              setShowWatchlistPage(true);
              window.scrollTo({ top: 0, behavior: "auto" });
            }}
          >
            My Watchlist
          </button>
          <button
            className={showWatchPartyPage ? "active-nav-link" : ""}
            onClick={() => {
              closeDetails();
              setShowWatchlistPage(false);
              setShowWatchPartyPage(true);
              window.scrollTo({ top: 0, behavior: "auto" });
            }}
          >
            Watch Party
          </button>
          <button className="nav-about-button" onClick={goToAbout}>About</button>
        </nav>
        {renderUserMenu()}
      </header>
    );
  }

  function goToAbout() {
    goToDiscover();
    setTimeout(() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  function renderMovieCard(item, type = contentType) {
    const title = getTitle(item, type);
    const releaseDate = type === "tv" ? item.first_air_date : item.release_date;
    const saved = watchlist.some(
      (entry) => entry.movie_id === item.id && (entry.media_type || "movie") === type,
    );

    return (
      <article
        className="movie-card"
        key={`${type}-${item.id}`}
        onClick={() => handleItemClick(item.id, type)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleItemClick(item.id, type);
          }
        }}
      >
        <div className="movie-poster-container">
          {item.poster_path ? (
            <img className="movie-poster" src={`${IMAGE_BASE_URL}${item.poster_path}`} alt={`${title} poster`} />
          ) : <div className="poster-placeholder">NO IMAGE</div>}
          <div className="movie-rating">★ {item.vote_average ? item.vote_average.toFixed(1) : "N/A"}</div>
          {type === "tv" && <span className="media-type-badge">TV</span>}
        </div>
        <div className="movie-info">
          <h3>{title}</h3>
          <p className="movie-year">{getReleaseYear(releaseDate)}</p>
          <button
            className={`watchlist-button ${saved ? "saved" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              toggleWatchlist(item, type);
            }}
          >
            {saved ? "✓ In Watchlist" : "+ Add to Watchlist"}
          </button>
        </div>
      </article>
    );
  }

  function renderSection(section) {
    const items = sections[section.key] || [];
    return (
      <section className="movie-section" key={section.key}>
        <div className="section-header">
          <div><p className="section-label">{section.eyebrow}</p><h2>{section.title}</h2></div>
          <span className="section-count">{items.length} titles</span>
        </div>
        <div className="movie-grid">{items.map((item) => renderMovieCard(item, contentType))}</div>
      </section>
    );
  }

  function renderStars(score, onChange, readOnly = false) {
    return (
      <div className={`star-rating ${readOnly ? "read-only" : ""}`} aria-label={score ? `${score} out of 5 stars` : "Not rated"}>
        {Array.from({ length: 5 }, (_, index) => {
          const value = index + 1;
          return (
            <button
              key={value}
              type="button"
              className={value <= (score || 0) ? "star active" : "star"}
              disabled={readOnly}
              onClick={() => onChange(score === value ? null : value)}
            >
              ★
            </button>
          );
        })}
      </div>
    );
  }

  function renderWatchlistCard(savedMovie) {
    const type = savedMovie.media_type || "movie";
    const watched = Boolean(savedMovie.watched);
    return (
      <article
        className="movie-card watchlist-card"
        key={savedMovie.id}
        onClick={() => handleItemClick(savedMovie.movie_id, type)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleItemClick(savedMovie.movie_id, type);
          }
        }}
      >
        <div className="movie-poster-container">
          {savedMovie.poster_path ? <img className="movie-poster" src={`${IMAGE_BASE_URL}${savedMovie.poster_path}`} alt={`${savedMovie.movie_title} poster`} /> : <div className="poster-placeholder">NO IMAGE</div>}
          <span className={`watch-status-badge ${watched ? "watched" : "to-watch"}`}>{watched ? "Watched" : "To Watch"}</span>
          {watched && savedMovie.personal_score && <span className="personal-score-badge">{savedMovie.personal_score}/5 ★</span>}
        </div>
        <div className="movie-info">
          <h3>{savedMovie.movie_title}</h3>
          <p className="movie-year">{getReleaseYear(savedMovie.release_date)} · {type === "tv" ? "Series" : "Movie"}</p>
          <div className="watchlist-controls" onClick={(event) => event.stopPropagation()}>
            <button className={`status-toggle ${watched ? "is-watched" : ""}`} onClick={() => updateSavedMovie(savedMovie.id, { watched: !watched })}>
              {watched ? "✓ Watched" : "Mark as Watched"}
            </button>
            <div className="score-field">
              <span>{watched ? "Your rating" : "Personal rating"}</span>
              {renderStars(savedMovie.personal_score, (value) => {
                updateSavedMovie(savedMovie.id, { personal_score: value });
                setRatingPromptId(null);
              })}
              {ratingPromptId === savedMovie.id && !savedMovie.personal_score && (
                <div className="rating-prompt">
                  <strong>How was it?</strong>
                  <span>Choose a personal rating above.</span>
                  <button type="button" onClick={() => setRatingPromptId(null)}>Maybe later</button>
                </div>
              )}
            </div>
            <details className="notes-dropdown">
              <summary>📝 Notes {savedMovie.notes ? "· Saved" : "· Add a note"}</summary>
              <textarea
                rows="3"
                placeholder="Write a thought, favorite quote, or reminder..."
                value={savedMovie.notes || ""}
                onKeyDown={(event) => event.stopPropagation()}
                onChange={(event) => setWatchlist((current) => current.map((entry) => entry.id === savedMovie.id ? { ...entry, notes: event.target.value } : entry))}
                onBlur={(event) => updateSavedMovie(savedMovie.id, { notes: event.target.value })}
              />
              <small>Notes save when you click outside the field.</small>
            </details>
            {type === "tv" && (
              <div className="episode-progress">
                <span>Continue at</span>
                <div className="episode-inputs">
                  <input type="number" min="1" placeholder="Season" value={savedMovie.current_season || ""} onChange={(event) => updateSavedMovie(savedMovie.id, { current_season: event.target.value ? Number(event.target.value) : null })} />
                  <input type="number" min="1" placeholder="Episode" value={savedMovie.current_episode || ""} onChange={(event) => updateSavedMovie(savedMovie.id, { current_episode: event.target.value ? Number(event.target.value) : null })} />
                </div>
              </div>
            )}
            <button className="remove-link" onClick={() => removeSavedMovie(savedMovie)}>Remove</button>
          </div>
        </div>
      </article>
    );
  }

  if (showAuth) return <Auth onClose={() => setShowAuth(false)} />;

  if (showWatchPartyPage) {
    return (
      <div className="app">
        {renderNavigation()}
        <main className="watch-party-page">
          <div className="watch-party-hero">
            <p className="section-label">COMING SOON</p>
            <h1>Watch together. Even when you're apart.</h1>
            <p>Watch Party is a Stackflix concept space for synchronized viewing, chat, camera, and shared controls. This presentation-ready prototype shows the future direction; live screen sharing and synchronized playback are not connected yet.</p>
            <div className="watch-party-actions"><button className="primary-button" disabled>Start a Room · Coming Soon</button><button className="secondary-button" onClick={goToDiscover}>Explore Movies</button></div>
          </div>
          <div className="watch-party-grid">
            <div className="watch-party-card"><span>◉</span><h3>Shared Playback</h3><p>One pause, play, and timeline for everyone in the room.</p></div>
            <div className="watch-party-card"><span>◌</span><h3>Friends on Camera</h3><p>Optional camera and voice controls for movie night conversations.</p></div>
            <div className="watch-party-card"><span>✦</span><h3>Room Chat</h3><p>React, share thoughts, and plan your next watch together.</p></div>
          </div>
        </main>
      </div>
    );
  }

  if (showWatchlistPage) {
    const toWatch = watchlist.filter((item) => !item.watched);
    const watchedItems = watchlist.filter((item) => item.watched);
    return (
      <div className="app">
        {renderNavigation({ watchlistPage: true })}
        <main className="watchlist-page">
          <div className="watchlist-page-header">
            <button type="button" className="watchlist-back-button" onClick={goToDiscover}><span>←</span> Back to Discover</button>
            <p className="section-label">YOUR PERSONAL CINEMA</p>
            <h1>My Watchlist</h1>
            <p>Build your next movie night, rate what you watch, and keep notes for later.</p>
          </div>
          {!user ? (
            <div className="empty-state"><h2>Login to view your watchlist</h2><p>Save movies and series for your next movie night.</p><button className="primary-button" onClick={() => setShowAuth(true)}>Login to Continue →</button></div>
          ) : watchlistLoading ? (
            <div className="status-message"><div className="loading-spinner" /><p>Loading your watchlist...</p></div>
          ) : (
            <div className="watchlist-groups">
              <section className="watchlist-group"><div className="section-header"><div><p className="section-label">UP NEXT</p><h2>To Watch</h2></div><span className="section-count">{toWatch.length} titles</span></div>{toWatch.length ? <div className="movie-grid watchlist-grid">{toWatch.map(renderWatchlistCard)}</div> : <div className="empty-inline">Your next watch is waiting to be discovered.</div>}</section>
              <section className="watchlist-group"><div className="section-header"><div><p className="section-label">YOUR HISTORY</p><h2>Watched</h2></div><span className="section-count">{watchedItems.length} titles</span></div>{watchedItems.length ? <div className="movie-grid watchlist-grid">{watchedItems.map(renderWatchlistCard)}</div> : <div className="empty-inline">Your watched titles and ratings will appear here.</div>}</section>
            </div>
          )}
        </main>
        <footer className="footer"><button className="logo logo-button" onClick={goToDiscover}>STACK<span>FLIX</span></button><p>Discover your next favorite movie.</p><p className="copyright">© 2026 Stackflix. Built for educational purposes.</p></footer>
      </div>
    );
  }

  if (selectedItem) {
    const type = selectedMediaType;
    const title = getTitle(selectedItem, type);
    const saved = watchlist.find((entry) => entry.movie_id === selectedItem.id && (entry.media_type || "movie") === type);
    const trailer = getTrailer();
    const cast = credits?.cast?.slice(0, 8) || [];
    const crew = credits?.crew?.filter((person) => ["Director", "Writer", "Creator", "Executive Producer"].includes(person.job)).slice(0, 6) || [];

    return (
      <div className="app">
        {renderNavigation({ details: true })}
        <main className="details-page">
          <button type="button" className="details-back-button" onClick={closeDetails}><span>←</span> Back to Discover</button>
          {detailsLoading ? <div className="status-message"><div className="loading-spinner" /><p>Loading details...</p></div> : (
            <>
              <section className="details-hero" style={selectedItem.backdrop_path ? { backgroundImage: `url(${BACKDROP_BASE_URL}${selectedItem.backdrop_path})` } : undefined}>
                <div className="details-overlay" />
                <div className="details-layout">
                  <div className="details-poster-container">{selectedItem.poster_path ? <img className="details-poster" src={`${IMAGE_BASE_URL}${selectedItem.poster_path}`} alt={`${title} poster`} /> : <div className="poster-placeholder">NO IMAGE</div>}</div>
                  <div className="details-content">
                    <p className="details-label">{type === "tv" ? "SERIES DETAILS" : "MOVIE DETAILS"}</p>
                    <h1 className="details-title">{title}</h1>
                    {selectedItem.tagline && <p className="details-tagline">{selectedItem.tagline}</p>}
                    <div className="details-metadata">
                      <div className="metadata-card"><span className="metadata-label">Rating</span><strong className="metadata-value rating">★ {selectedItem.vote_average ? selectedItem.vote_average.toFixed(1) : "N/A"}</strong></div>
                      <div className="metadata-card"><span className="metadata-label">{type === "tv" ? "First Aired" : "Release Date"}</span><strong className="metadata-value">{getReleaseDate(selectedItem, type)}</strong></div>
                      <div className="metadata-card"><span className="metadata-label">{type === "tv" ? "Seasons" : "Runtime"}</span><strong className="metadata-value">{type === "tv" ? `${selectedItem.number_of_seasons || 0} seasons` : formatRuntime(selectedItem.runtime)}</strong></div>
                    </div>
                    {selectedItem.genres?.length > 0 && <div className="details-genres">{selectedItem.genres.map((genre) => <span className="genre-tag" key={genre.id}>{genre.name}</span>)}</div>}
                    <div className="details-actions"><button className={`primary-button details-watchlist-button ${saved ? "saved" : ""}`} onClick={() => toggleWatchlist(selectedItem, type)}>{saved ? "✓ Remove from Watchlist" : "+ Add to Watchlist"}</button>{trailer && <a className="secondary-button" href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noreferrer">▶ Watch Trailer</a>}</div>
                    <div className="external-links">{getExternalLinks().map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div>
                  </div>
                </div>
                <div className="details-overview-box"><p className="details-label">OVERVIEW</p><p>{selectedItem.overview || "No description is available."}</p></div>
              </section>

              <section className="info-panel"><div><p className="details-label">WHERE TO WATCH</p><h2>Streaming Options</h2><p>Choose a provider to open the availability page on JustWatch.</p></div>{getUniqueProviders().length ? <div className="provider-list">{getUniqueProviders().map((provider) => <a className="provider-card" key={provider.provider_id} href={getProviderHref(provider)} target="_blank" rel="noreferrer">{provider.logo_path && <img src={`${PROVIDER_IMAGE_BASE_URL}${provider.logo_path}`} alt={provider.provider_name} />}<span>{provider.provider_name}</span><span className="provider-arrow">↗</span></a>)}</div> : <div className="no-providers">Streaming availability is not currently available for this title.</div>}{movieProviders?.link && <a className="streaming-link" href={movieProviders.link} target="_blank" rel="noreferrer">Open full availability on JustWatch →</a>}</section>

              {type === "tv" && selectedItem.seasons?.length > 0 && <section className="info-panel"><p className="details-label">EPISODE GUIDE</p><h2>Seasons & Episodes</h2><p>Choose a season to explore its episodes and keep track of where you left off.</p><div className="season-list">{selectedItem.seasons.filter((season) => season.season_number > 0).map((season) => <button className={`season-button ${selectedSeason === season.season_number ? "active" : ""}`} key={season.id} onClick={() => loadSeason(season.season_number)}>Season {season.season_number}<span>{season.episode_count} eps</span></button>)}</div>{seasonDetails && <div className="episode-list"><h3>{seasonDetails.name}</h3>{seasonDetails.episodes?.map((episode) => <div className="episode-row" key={episode.id}><div className="episode-main">{episode.still_path ? <img className="episode-still" src={`${IMAGE_BASE_URL}${episode.still_path}`} alt={`${episode.name} still`} /> : <div className="episode-still placeholder">EP</div>}<div><strong>{episode.episode_number}. {episode.name}</strong><p>{episode.overview || "No episode description available."}</p></div></div>{saved && <button className="small-action" onClick={() => updateSavedMovie(saved.id, { current_season: seasonDetails.season_number, current_episode: episode.episode_number })}>Set as Next</button>}</div>)}</div>}</section>}

              <section className="info-panel"><p className="details-label">CAST & CREW</p><h2>People Behind the {type === "tv" ? "Series" : "Movie"}</h2><div className="people-grid">{cast.map((person) => <a className="person-card" href={getPersonHref(person)} target="_blank" rel="noreferrer" key={`${person.id}-${person.character}`}><div className="person-photo">{person.profile_path ? <img src={`${IMAGE_BASE_URL}${person.profile_path}`} alt={person.name} /> : <span>★</span>}</div><strong>{person.name}</strong><span>{person.character || "Cast"}</span><small>Wikipedia ↗</small></a>)}</div>{crew.length > 0 && <><h3 className="subsection-heading">Directors & Crew</h3><div className="crew-people-grid">{crew.map((person, index) => <a className="crew-person-card" href={getPersonHref(person)} target="_blank" rel="noreferrer" key={`${person.id}-${person.job}-${index}`}><div className="crew-photo">{person.profile_path ? <img src={`${IMAGE_BASE_URL}${person.profile_path}`} alt={person.name} /> : <span>★</span>}</div><strong>{person.name}</strong><span>{person.job}</span></a>)}</div></>}</section>
            </>
          )}
        </main>
        <footer className="footer"><button className="logo logo-button" onClick={closeDetails}>STACK<span>FLIX</span></button><p>Discover your next favorite movie.</p><p className="copyright">© 2026 Stackflix. Built for educational purposes.</p></footer>
      </div>
    );
  }

  return (
    <div className="app">
      {renderNavigation()}
      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">YOUR NEXT FAVORITE STORY</p>
            <h1>Find something<br /><span>worth watching.</span></h1>
            <p className="hero-description">Discover movies and series, build your personal collection, and remember every story that made an impression.</p>
            <div className="content-switcher"><button className={contentType === "movie" ? "active" : ""} onClick={() => switchContentType("movie")}>Movies</button><button className={contentType === "tv" ? "active" : ""} onClick={() => switchContentType("tv")}>TV Shows</button></div>
            <form className="search-form" onSubmit={handleSearch}><input type="search" placeholder={`Search for a ${contentType === "movie" ? "movie" : "series"}...`} value={searchQuery} onChange={(event) => { const value = event.target.value; setSearchQuery(value); if (!value.trim() && activeSearch) clearSearch(); }} aria-label="Search" /><button className="primary-button" type="submit">Search</button></form>
            <div className="hero-actions"><a className="secondary-button" href="#discover">Explore Collection ↓</a><button className="secondary-button" onClick={() => { clearSearch(); setShowWatchlistPage(true); }}>My Watchlist →</button></div>
          </div>
          <div className="hero-decoration" aria-label="Featured movies">
            <div className="hero-poster-stack">
              {heroItems.map((item, index) => (
                <button type="button" className={`hero-poster-card hero-poster-${index + 1}`} key={item.id} onClick={() => handleItemClick(item.id, contentType)}>
                  {item.poster_path ? <img src={`${IMAGE_BASE_URL}${item.poster_path}`} alt={getTitle(item, contentType)} /> : <span>STACKFLIX</span>}
                  <span className="hero-poster-label">{getTitle(item, contentType)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="discover-section" id="discover">
          {activeSearch ? <section className="movie-section search-section"><div className="section-header"><div><p className="section-label">SEARCH RESULTS</p><h2>Results for “{activeSearch}”</h2></div><button className="text-button" onClick={clearSearch}>Clear Search</button></div>{loadingSection === "search" ? <div className="status-message"><div className="loading-spinner" /><p>Searching...</p></div> : searchResults.length ? <div className="movie-grid">{searchResults.map((item) => renderMovieCard(item, contentType))}</div> : <div className="empty-state"><h2>No results found</h2><p>Try another title.</p></div>}</section> : loadingSections ? <div className="status-message page-loading"><div className="loading-spinner" /><p>Loading your collection...</p></div> : error ? <div className="status-message error-message"><p>{error}</p><button className="primary-button" onClick={() => loadSections(contentType)}>Try Again</button></div> : sectionsConfig.map(renderSection)}
        </section>

        <section className="about-section" id="about"><p className="section-label">ABOUT STACKFLIX</p><h2>A class project built around the love of movies and television.</h2><p>Stackflix is an Engineering Design 2 project created to explore how a modern entertainment discovery platform can combine a public media API, authentication, cloud storage, personal tracking, and thoughtful interface design.</p><div className="about-grid"><div className="about-card"><span className="about-card-icon">🎬</span><h3>Discover</h3><p>Explore movies and series by popularity, release status, ratings, and search.</p></div><div className="about-card"><span className="about-card-icon">☑</span><h3>Organize</h3><p>Keep a personal watchlist, separate unwatched and watched titles, and track TV episode progress.</p></div><div className="about-card"><span className="about-card-icon">★</span><h3>Remember</h3><p>Rate what you watch with stars, write notes, and keep your own viewing history.</p></div></div><p className="about-note">Built for educational purposes using React, Supabase, and TMDB. Stackflix is not affiliated with the linked media services.</p></section>
      </main>
      <footer className="footer"><button className="logo logo-button" onClick={goToDiscover}>STACK<span>FLIX</span></button><p>Discover your next favorite movie.</p><p className="copyright">© 2026 Stackflix. Built for educational purposes.</p></footer>
    </div>
  );
}

export default App;
