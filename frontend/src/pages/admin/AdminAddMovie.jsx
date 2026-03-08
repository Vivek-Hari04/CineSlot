import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import api from '../../apiClient';

function AdminAddMovie() {
  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingMovieId, setEditingMovieId] = useState(null);

  const initialForm = {
    title: '',
    genre: '',
    language: '',
    duration: '',
    releaseDate: '',
    rating: '',
    synopsis: '',
    posterUrl: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setLoadingMovies(true);
    try {
      const res = await api.get('/movies');
      setMovies(res.data || []);
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoadingMovies(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData(initialForm);
    setStatus({ type: '', message: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (movie) => {
    setModalMode('edit');
    setEditingMovieId(movie._id);
    setFormData({
      title: movie.title || '',
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : (movie.genre || ''),
      language: Array.isArray(movie.language) ? movie.language.join(', ') : (movie.language || ''),
      duration: movie.duration || '',
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
      rating: movie.rating != null ? movie.rating.toString() : '',
      synopsis: movie.synopsis || '',
      posterUrl: movie.posterUrl || ''
    });
    setStatus({ type: '', message: '' });
    setShowModal(true);
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie? This may affect existing shows!')) return;
    try {
      await api.delete(`/movies/${id}`);
      loadMovies();
    } catch (err) {
      console.error('Failed to delete movie:', err);
      alert('Error deleting movie');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const payload = {
        ...formData,
        genre: formData.genre.split(',').map(g => g.trim()),
        language: formData.language.split(',').map(l => l.trim()),
        rating: Number(formData.rating)
      };

      if (modalMode === 'add') {
        await api.post('/movies', payload);
        setStatus({ type: 'success', message: 'Movie added successfully!' });
      } else {
        await api.put(`/movies/${editingMovieId}`, payload);
        setStatus({ type: 'success', message: 'Movie updated successfully!' });
      }
      
      loadMovies();
      setTimeout(() => setShowModal(false), 1500);

    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to check input data.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-movie">
      <div className="admin-shows-header">
        <h2 className="admin-section-title">MANAGE MOVIES</h2>
        <button className="admin-action-btn primary" onClick={handleOpenAddModal}>
          <FiPlus size={18} /> Add Movie
        </button>
      </div>

      <div className="admin-movies-list-container">
        {loadingMovies ? (
          <div className="admin-loading">Loading movies...</div>
        ) : movies.length === 0 ? (
          <div className="admin-empty-state">No movies found in the database.</div>
        ) : (
          <div className="admin-movies-grid">
            {movies.map(movie => (
              <div key={movie._id} className="admin-movie-card">
                <div className="admin-movie-poster-mini" style={{ backgroundImage: `url(${movie.posterUrl})` }}>
                  <div className="admin-movie-overlay-actions">
                    <button className="icon-btn edit" onClick={() => handleOpenEditModal(movie)} title="Edit Movie">
                      <FiEdit2 size={16} />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDeleteMovie(movie._id)} title="Delete Movie">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="admin-movie-info-mini">
                  <h3>{movie.title}</h3>
                  <div className="admin-movie-meta-mini">
                    <span>{movie.duration}</span>
                    <span>•</span>
                    <span>⭐ {movie.rating}</span>
                  </div>
                  <div className="admin-movie-genres-mini">
                    {movie.genre.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-content admin-modal-wide">
            <button className="admin-modal-close" onClick={() => setShowModal(false)}>
              <FiX size={24} />
            </button>
            <h2 className="admin-modal-title">
              {modalMode === 'add' ? 'Add New Movie' : 'Edit Movie'}
            </h2>

            {status.message && (
              <div className={`admin-submit-${status.type}`}>
                {status.message}
              </div>
            )}

            <form className="admin-form-container" onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Movie Title</label>
                <input name="title" value={formData.title} onChange={handleChange} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-form-group">
                  <label>Genre</label>
                  <input name="genre" value={formData.genre} onChange={handleChange} placeholder="Action, Sci-Fi" required />
                </div>
                <div className="admin-form-group">
                  <label>Language</label>
                  <input name="language" value={formData.language} onChange={handleChange} placeholder="English, Hindi" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
                <div className="admin-form-group">
                  <label>Duration</label>
                  <input name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 148 min" required />
                </div>
                <div className="admin-form-group">
                  <label>Release Date</label>
                  <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange} required />
                </div>
                <div className="admin-form-group">
                  <label>Rating</label>
                  <input type="number" step="0.1" min="0.0" max="10.0" name="rating" value={formData.rating} onChange={handleChange} placeholder="e.g. 8.8" required />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Poster Url</label>
                <input name="posterUrl" value={formData.posterUrl} onChange={handleChange} required />
              </div>

              <div className="admin-form-group">
                <label>Synopsis</label>
                <textarea name="synopsis" value={formData.synopsis} onChange={handleChange} rows="3" required />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-action-btn secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary" disabled={loading}>
                  {loading ? 'Saving...' : modalMode === 'add' ? 'Add Movie' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAddMovie;
