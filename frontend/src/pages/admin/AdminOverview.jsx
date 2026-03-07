import { useEffect, useState } from 'react';
import api from '../../apiClient';

function AdminOverview() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch currently showing movies (or all movies depending on API endpoint)
    const loadMovies = async () => {
      try {
        const res = await api.get('/movies');
        setMovies(res.data || []);
      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, []);

  const handleRemove = async (movieId) => {
    if (!window.confirm('Are you sure you want to remove this movie?')) return;
    try {
      await api.delete(`/movies/${movieId}`);
      setMovies((prev) => prev.filter((m) => m._id !== movieId));
    } catch (err) {
      console.error('Failed to delete movie:', err);
      alert('Could not delete movie. Ensure no shows depend on it.');
    }
  };

  return (
    <div className="admin-overview">
      <h2 className="admin-section-title">CURRENTLY SHOWING</h2>
      
      {loading ? (
        <div className="admin-loading">Loading movies...</div>
      ) : (
        <div className="admin-movie-grid">
          {movies.map((movie) => (
            <div key={movie._id} className="admin-movie-card">
              <div className="admin-movie-poster">
                {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt={movie.title} />
                ) : (
                  <span>Poster</span>
                )}
              </div>
              <div className="admin-movie-details">
                 <div className="admin-movie-title">{movie.title}</div>
                 <button 
                   className="admin-remove-btn" 
                   onClick={() => handleRemove(movie._id)}
                 >
                   REMOVE
                 </button>
              </div>
            </div>
          ))}
          {movies.length === 0 && <p className="admin-empty">No movies found.</p>}
        </div>
      )}
    </div>
  );
}

export default AdminOverview;
