import { supabase } from "./supabaseClient";

export async function getUserWatchlist(userId) {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addToWatchlist(userId, movie) {
  const { data, error } = await supabase
    .from("watchlist")
    .insert({
      user_id: userId,
      movie_id: movie.id,
      movie_title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      watched: false,
      personal_score: null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWatchlistEntry(userId, watchlistId, changes) {
  const { data, error } = await supabase
    .from("watchlist")
    .update(changes)
    .eq("id", watchlistId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFromWatchlist(userId, movieId) {
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("movie_id", movieId);

  if (error) throw error;
}
