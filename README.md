# 🎬 CineSlot 🎟️

**CineSlot** is a full-featured, modern online movie ticket booking and theater management platform built aggressively fast and meticulously clean using the **MERN** stack. It provides a seamless experience for users to discover movies, browse screening schedules, select specific seats, manage bookings, and even curate a list of personalized favorites.

Under the hood, CineSlot boasts a robust **Admin Panel**, equipping theater managers with the tools to add new films, schedule daily showtimes, modify ticket prices, review user demographics, and effortlessly sweep outdated schedules from the database with a single click.

---

## ✨ Key Features

### 🍿 For Users (Moviegoers):
- **Browse & Search:** Effortlessly discover currently playing movies, filter shows by date and time, and instantly search utilizing a responsive global search overlay.
- **Interactive Seat Selection:** An intuitive, grid-based seat selector visually prevents double-booking while clearly indicating your current selections and total live price.
- **Favorites Hub:** Add movies to a permanent, personalized Favourites list for fast access.
- **Booking Management:** Review your entire ticket history alongside real-time show statuses (Scheduled, Completed, or Cancelled).
- **Responsive UI:** From the smart navigation bar to detailed movie cards, the interface scales gracefully across all desktop, tablet, and mobile displays.

### 🛡️ For Administrators:
- **Comprehensive Dashboard:** Gain a sweeping overview of revenue, reservations, and user engagement metrics directly from an insights panel.
- **Movie Data Management:** Add entirely new movies into the database with diverse metadata structures (cast, duration parsing natively recognizing `Xh Ym` patterns, dynamically processed genres, etc).
- **Show Scheduling:** Create one or multiple showtimes for specific dates, securely setting localized base prices and seating capacities.
- **System Maintenance:** Maintain a pristine database without writing scripts! An integrated **Clean Up** function instantly sweeps the database of `completed` and permanently `expired` shows with a single button press.

---

## 🛠️ Technology Stack

| Architecture Element | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React.js (Vite)** | State-driven user interface delivering extremely fast client-side rendering. |
| **Backend API** | **Node.js & Express** | High-performance, scalable REST architecture routing data models. |
| **Database** | **MongoDB** | Integrated via `mongoose` to rapidly manage relational schemas for movies, users, and shows. |
| **Auth & Security** | **JWT & bcryptjs** | Stateless JSON Web Tokens securely track persistent user sessions alongside natively hashed passkeys. |
| **Styling** | **Pure CSS** | Leveraging CSS properties without heavy CSS-framework bloat for highly optimized load speeds. |

---



## 📂 Project Architecture Overview

```text
CineSlot/
├── backend/
│   ├── src/
│   │   ├── config/      # Database mapping & credentials
│   │   ├── middleware/  # JWT auth gatekeepers & robust error handling
│   │   ├── models/      # Mongoose Schema Definitions (Show, Movie, User)
│   │   ├── routes/      # REST endpoint paths (/movies, /shows/cleanup, etc)
│   │   └── server.js    # Express runtime kernel
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # Isolated, dynamic React pieces (Global Search, Footers)
    │   ├── context/     # React Context mechanisms for universal state
    │   ├── pages/       # Distinct route-driven application views (Admin, Home, Auth)
    │   ├── utils/       # Modular pure functions (e.g. strict unified Time Parsing)
    │   ├── App.jsx      # Top-level Routing Map
    │   └── main.jsx     # DOM entry layer
    └── package.json
```

---

## 📜 License
This application is completely open source and available directly from **[Vivek-Hari04](https://github.com/Vivek-Hari04)**.

Happy coding! 🍿
