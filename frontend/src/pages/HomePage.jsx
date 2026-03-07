import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../apiClient';

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
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
        setError('Could not load movies. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    if (!search.trim()) return movies;
    const term = search.toLowerCase();
    return movies.filter((m) => m.title?.toLowerCase().includes(term));
  }, [movies, search]);

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
        <h1 className="page-title">Now Showing</h1>
      </div>

      <section className="search-bar">
        <input
          type="text"
          placeholder="Search movies…"
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className="search-button"
          onClick={() => {
            // no-op: filtering is live as you type
          }}
        >
          Search
        </button>
      </section>

      {loading && <div className="empty-state">Loading movies…</div>}
      {error && !loading && <div className="empty-state">{error}</div>}

      {!loading && !error && filteredMovies.length === 0 && (
        <div className="empty-state">No movies match your search.</div>
      )}

      {!loading && !error && filteredMovies.length > 0 && (
        <div className="movie-grid">
          {filteredMovies.map((movie) => {
            const isFavorite = favorites.includes(movie._id);
            return (
              <article key={movie._id} className="movie-card">
                <button
                  type="button"
                  className={`favorite-toggle ${isFavorite ? 'active' : ''}`}
                  onClick={() => toggleFavorite(movie._id)}
                  aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
                >
                  {isFavorite ? '★' : '☆'}
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
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HomePage;

