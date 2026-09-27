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

**🌐 Deployed Application**

-> (https://stackflix.netlify.app)

**🎥 Demo Video**

-> (https://youtu.be/BT591vpG9nA)

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

         ---------------------------------------------

                    ┌──────────────────┐
                    │   Open Stackflix │
                    └────────┬─────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │ Explore Movies & │
                    │    TV Shows      │
                    └────────┬─────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │ Search or Select │
                    │      Title       │
                    └────────┬─────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │ View Details &   │
                    │ Streaming Info   │
                    └────────┬─────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │ Login / Register │
                    └────────┬─────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │ Add to Watchlist │
                    └────────┬─────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │ Track, Rate, and │
                    │ Add Personal     │
                    │ Notes            │
                    └──────────────────┘  

```
---

## 🎓 Credits

### Stackflix

**Developed by:**  
**Dylan Florencio**

**Program:** Computer Engineering  
**University:** Florida Atlantic University (FAU)  
**Course:** Engineering Design 2  
**Project:** Stackflix — Movie & TV Discovery and Personal Watchlist Platform

This project was designed and developed as part of the **Engineering Design 2** course at **Florida Atlantic University**. The project demonstrates the application of software engineering principles through the design, development, integration, testing, version control, and deployment of a functional web application.

### Technologies & Services

Special thanks to the technologies and services that made Stackflix possible:

- **React** — Frontend application framework
- **Vite** — Development and build tooling
- **Supabase** — Authentication and database services
- **TMDB API** — Movie and television data
- **Netlify** — Application deployment
- **GitHub** — Source control and project hosting

### Project Author

**Dylan Florencio**  
Computer Engineering  
Florida Atlantic University

© 2026 Dylan Florencio. All rights reserved.