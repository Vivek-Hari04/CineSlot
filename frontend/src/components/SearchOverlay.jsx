import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apiClient';

function SearchOverlay({ open, onClose }) {
  const [movies, setMovies] = useState([]);
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || loadedOnce) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get('/movies');
        setMovies(res.data || []);
        setLoadedOnce(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, loadedOnce]);

  useEffect(() => {
    if (open) {
      setTerm('');
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!term.trim()) return movies;
    const t = term.toLowerCase();
    return movies.filter((m) => m.title?.toLowerCase().includes(t));
  }, [movies, term]);

  if (!open) return null;

  const handleNavigate = (id) => {
    onClose();
    navigate(`/movies/${id}`);
  };

  return (
    <div className="search-overlay-backdrop" onClick={onClose}>
      <div
        className="search-overlay-panel"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="search-overlay-input-row">
          <span className="search-overlay-icon">🔍</span>
          <input
            autoFocus
            type="text"
            placeholder="Search movies"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="search-overlay-input"
          />
          <button
            type="button"
            className="search-overlay-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="search-overlay-results">
          {loading && <div className="empty-state">Searching movies…</div>}
          {!loading && filtered.length === 0 && (
            <div className="empty-state">No movies found.</div>
          )}
          {!loading &&
            filtered.length > 0 && (
              <div className="search-overlay-grid">
                {filtered.map((movie) => (
                  <button
                    key={movie._id}
                    type="button"
                    className="search-overlay-card"
                    onClick={() => handleNavigate(movie._id)}
                  >
                    <div className="search-overlay-card-poster">
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title} />
                      ) : (
                        <div className="booking-poster-placeholder">Poster</div>
                      )}
                    </div>
                    <div className="search-overlay-card-body">
                      <h3 className="search-overlay-card-title">{movie.title}</h3>
                      <div className="search-overlay-card-meta">
                        {movie.duration && <span>{movie.duration} min</span>}
                        {movie.language && <span>{movie.language}</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default SearchOverlay;

