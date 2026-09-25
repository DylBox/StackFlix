const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

async function tmdbRequest(endpoint) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key is missing.");
  }

  const separator = endpoint.includes("?") ? "&" : "?";
  const response = await fetch(
    `${TMDB_BASE_URL}${endpoint}${separator}api_key=${TMDB_API_KEY}`,
  );

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  return response.json();
}

export async function getPopularMovies() {
  const data = await tmdbRequest("/movie/popular?language=en-US&page=1");
  return data.results;
}

export async function getNowPlayingMovies() {
  const data = await tmdbRequest("/movie/now_playing?language=en-US&page=1");
  return data.results;
}

export async function getTopRatedMovies() {
  const data = await tmdbRequest("/movie/top_rated?language=en-US&page=1");
  return data.results;
}

export async function getUpcomingMovies() {
  const data = await tmdbRequest("/movie/upcoming?language=en-US&page=1");
  return data.results;
}

export async function searchMovies(query) {
  const encodedQuery = encodeURIComponent(query.trim());
  const data = await tmdbRequest(
    `/search/movie?query=${encodedQuery}&language=en-US&page=1&include_adult=false`,
  );
  return data.results;
}

export async function getMovieDetails(movieId) {
  return tmdbRequest(`/movie/${movieId}?language=en-US`);
}

export async function getMovieProviders(movieId) {
  const data = await tmdbRequest(`/movie/${movieId}/watch/providers`);
  return data.results?.US || null;
}
