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

export async function addToWatchlist(userId, item, mediaType = "movie") {
  const title = mediaType === "tv" ? item.name || item.original_name : item.title;
  const releaseDate = mediaType === "tv" ? item.first_air_date : item.release_date;
  const { data, error } = await supabase
    .from("watchlist")
    .insert({
      user_id: userId,
      movie_id: item.id,
      movie_title: title,
      poster_path: item.poster_path,
      release_date: releaseDate,
      media_type: mediaType,
      watched: false,
      personal_score: null,
      notes: "",
      current_season: null,
      current_episode: null,
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

export async function removeFromWatchlist(userId, itemId, mediaType = "movie") {
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("movie_id", itemId)
    .eq("media_type", mediaType);
  if (error) throw error;
}
