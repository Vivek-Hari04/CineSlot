import './App.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthPage from './pages/AuthPage';
import BookingsPage from './pages/BookingsPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import FavoritesPage from './pages/FavoritesPage';
import SearchOverlay from './components/SearchOverlay';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminAddMovie from './pages/admin/AdminAddMovie';
import AdminAddShow from './pages/admin/AdminAddShow';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <div className="app-shell">
          <SearchOverlay open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          <header className="app-header">
            <div className="app-brand">
              <span className="brand-mark">Cine</span>
              <span className="brand-mark accent">Slot</span>
            </div>
            <nav className="app-nav app-nav-main">
              <Link to="/">Home</Link>
              <Link to="/favorites">Favourites</Link>
              <Link to="/bookings">My Bookings</Link>
            </nav>
            <nav className="app-nav app-nav-auth">
              {user ? (
                <>
                  <span className="user-greeting">Hi, {user.name}</span>
                  <button className="logout-button" onClick={logout}>Logout</button>
                </>
              ) : (
                <Link to="/login">Login / Sign up</Link>
              )}
            </nav>
          </header>

          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<AuthPage initialMode="login" />} />
              <Route path="/signup" element={<AuthPage initialMode="signup" />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/movies/:id" element={<MovieDetailsPage />} />
              <Route path="/shows/:showId/seats" element={<SeatSelectionPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminOverview />} />
                <Route path="movies/add" element={<AdminAddMovie />} />
                <Route path="shows/add" element={<AdminAddShow />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
