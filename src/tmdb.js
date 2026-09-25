const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

async function tmdbRequest(endpoint) {
  if (!TMDB_API_KEY) throw new Error("TMDB API key is missing.");
  const separator = endpoint.includes("?") ? "&" : "?";
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}${separator}api_key=${TMDB_API_KEY}`);
  if (!response.ok) throw new Error(`TMDB request failed: ${response.status}`);
  return response.json();
}

async function getResults(endpoint) {
  const data = await tmdbRequest(endpoint);
  return data.results || [];
}

export const getPopularMovies = () => getResults("/movie/popular?language=en-US&page=1");
export const getNowPlayingMovies = () => getResults("/movie/now_playing?language=en-US&page=1");
export const getTopRatedMovies = () => getResults("/movie/top_rated?language=en-US&page=1");
export const getUpcomingMovies = () => getResults("/movie/upcoming?language=en-US&page=1");
export const getPopularTvShows = () => getResults("/tv/popular?language=en-US&page=1");
export const getTopRatedTvShows = () => getResults("/tv/top_rated?language=en-US&page=1");
export const getOnTheAirTvShows = () => getResults("/tv/on_the_air?language=en-US&page=1");

export const searchMovies = (query) => getResults(`/search/movie?query=${encodeURIComponent(query.trim())}&language=en-US&page=1&include_adult=false`);
export const searchTvShows = (query) => getResults(`/search/tv?query=${encodeURIComponent(query.trim())}&language=en-US&page=1&include_adult=false`);

export const getMovieDetails = (id) => tmdbRequest(`/movie/${id}?language=en-US`);
export const getTvDetails = (id) => tmdbRequest(`/tv/${id}?language=en-US`);
export const getMovieProviders = async (id) => (await tmdbRequest(`/movie/${id}/watch/providers`)).results?.US || null;
export const getTvProviders = async (id) => (await tmdbRequest(`/tv/${id}/watch/providers`)).results?.US || null;
export const getMovieVideos = async (id) => (await tmdbRequest(`/movie/${id}/videos?language=en-US`)).results || [];
export const getTvVideos = async (id) => (await tmdbRequest(`/tv/${id}/videos?language=en-US`)).results || [];
export const getMovieCredits = (id) => tmdbRequest(`/movie/${id}/credits?language=en-US`);
export const getTvCredits = (id) => tmdbRequest(`/tv/${id}/credits?language=en-US`);
export const getMovieExternalIds = (id) => tmdbRequest(`/movie/${id}/external_ids`);
export const getTvExternalIds = (id) => tmdbRequest(`/tv/${id}/external_ids`);
export const getTvSeasonDetails = (showId, seasonNumber) => tmdbRequest(`/tv/${showId}/season/${seasonNumber}?language=en-US`);
