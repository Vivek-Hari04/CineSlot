import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../apiClient';

function FavoritesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = window.localStorage.getItem('cineslotFavorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const res = await api.get('/movies');
        setMovies(res.data || []);
      } catch (err) {
        console.error(err);
        setError('Could not load favourites. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const favouriteMovies = useMemo(
    () => movies.filter((m) => favorites.includes(m._id)),
    [movies, favorites]
  );

  const toggleFavorite = (movieId) => {
    setFavorites((prev) => {
      let next;
      if (prev.includes(movieId)) {
        next = prev.filter((id) => id !== movieId);
      } else {
        next = [...prev, movieId];
      }
      window.localStorage.setItem('cineslotFavorites', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Favourites</h1>
      </div>

      {loading && <div className="empty-state">Loading favourites…</div>}
      {error && !loading && <div className="empty-state">{error}</div>}

      {!loading && !error && favouriteMovies.length === 0 && (
        <div className="empty-state">You have not added any favourites yet.</div>
      )}

      {!loading && !error && favouriteMovies.length > 0 && (
        <div className="movie-grid">
          {favouriteMovies.map((movie) => (
            <article key={movie._id} className="movie-card">
              <button
                type="button"
                className="favorite-toggle active"
                onClick={() => toggleFavorite(movie._id)}
                aria-label="Remove from favourites"
              >
                ★
              </button>
              {movie.posterUrl && (
                <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />
              )}
              <div className="movie-body">
                <div className="movie-meta">
                  {movie.genre?.slice(0, 2).map((g) => (
                    <span key={g} className="pill">
                      {g}
                    </span>
                  ))}
                  {movie.language && <span className="pill">{movie.language}</span>}
                  {movie.duration && <span className="pill">{movie.duration} min</span>}
                </div>

                <div className="movie-header-row">
                  <h2 className="movie-title">{movie.title}</h2>
                  {typeof movie.rating === 'number' && (
                    <span className="badge-soft rating-inline">★ {movie.rating.toFixed(1)}</span>
                  )}
                </div>

                <div className="movie-actions">
                  <Link to={`/movies/${movie._id}`} className="movie-actions-link">
                    <button type="button" className="movie-book-button">
                      Book tickets
                    </button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;

