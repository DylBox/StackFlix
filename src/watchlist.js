
import { supabase } from "./supabaseClient";

// Get all watchlist movies for a specific user
export async function getUserWatchlist(userId) {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

// Add a movie to the user's watchlist
export async function addToWatchlist(userId, movie) {
  const { data, error } = await supabase
    .from("watchlist")
    .insert({
      user_id: userId,
      movie_id: movie.id,
      movie_title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Remove a movie from the user's watchlist
export async function removeFromWatchlist(userId, movieId) {
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("movie_id", movieId);

  if (error) {
    throw error;
  }
}