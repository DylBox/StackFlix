# 🎬 Stackflix

### Discover. Track. Remember what you want to watch.

Stackflix is a modern movie and TV discovery platform designed to make it easier to discover new titles, keep track of what you want to watch, and maintain a personal viewing history.

Instead of simply browsing movies and shows, Stackflix gives each user their own personalized space where they can save titles to a watchlist, mark content as watched, give personal ratings, write notes, and track their progress through TV seasons and episodes.

The application combines the TMDB API for movie and television data with Supabase for authentication and persistent user data.

---

## ✨ Why Stackflix?

Finding something to watch can be easy.

Remembering everything you want to watch is not.

Stackflix was created to combine **discovery and personal organization** into one application. Users can explore movies and TV shows, open detailed information about a title, and save the titles that interest them to their personal collection.

The goal is to make Stackflix feel less like a movie database and more like a **personal movie and TV companion**.

---

## 🚀 Features

### 🎥 Movie & TV Discovery

- Browse popular movies and TV shows
- Search for movies and television shows
- View detailed information about titles
- View release information
- Explore cast and crew information
- Watch available trailers
- Discover available streaming providers

### 📚 Personal Watchlist

Authenticated users can create their own personal collection of titles.

- Add movies and TV shows to a watchlist
- Remove titles from the watchlist
- View saved titles
- Maintain a personalized collection across sessions

### ⭐ Personal Tracking

Users can personalize their saved titles by:

- Marking titles as watched
- Giving titles personal star ratings
- Writing personal notes
- Tracking TV season progress
- Tracking TV episode progress

### 🔐 Authentication

Stackflix uses Supabase Authentication to provide:

- User registration
- User login
- User logout
- Authenticated user sessions
- User-specific watchlist data

Each user's saved information is associated with their account.

---

## 🏗️ Application Architecture

Stackflix uses a React frontend that communicates with two primary external services: **TMDB** and **Supabase**.

```text
                    ┌─────────────────────┐
                    │      Stackflix      │
                    │    React Frontend   │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
          ┌──────────────┐           ┌──────────────┐
          │   TMDB API   │           │   Supabase   │
          │              │           │              │
          │ Movies       │           │ Auth         │
          │ TV Shows     │           │ Database     │
          │ Cast         │           │ Watchlists   │
          │ Trailers     │           │ User Data    │
          │ Providers    │           │              │
          └──────────────┘           └──────────────┘


### One small change from the previous version

I put:

**🌐 Deployed Application**

-> (https://stackflix.netlify.app)

**🎥 Demo Video**

