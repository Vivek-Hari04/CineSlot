import { useState } from 'react';
import api from '../../apiClient';

function AdminAddMovie() {
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    language: '',
    duration: '',
    releaseDate: '',
    rating: '',
    synopsis: '',
    posterUrl: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Split comma separated arrays
      const payload = {
        ...formData,
        genre: formData.genre.split(',').map(g => g.trim()),
        language: formData.language.split(',').map(l => l.trim()),
      };
      await api.post('/movies', payload);
      setStatus({ type: 'success', message: 'Movie added successfully!' });
      setFormData({
        title: '', genre: '', language: '', duration: '',
        releaseDate: '', rating: '', synopsis: '', posterUrl: ''
      });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to add movie. Check input data.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-movie">
      <h2 className="admin-section-title">ADD NEW MOVIE</h2>

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
        <div className="admin-form-group">
          <label>Genre</label>
          <input name="genre" value={formData.genre} onChange={handleChange} placeholder="Action, Sci-Fi" required />
        </div>
        <div className="admin-form-group">
          <label>Language</label>
          <input name="language" value={formData.language} onChange={handleChange} placeholder="English, Hindi" required />
        </div>
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
          <input name="rating" value={formData.rating} onChange={handleChange} placeholder="e.g. 8.8" required />
        </div>
        <div className="admin-form-group">
          <label>Synopsis</label>
          <textarea name="synopsis" value={formData.synopsis} onChange={handleChange} rows="3" required />
        </div>
        <div className="admin-form-group">
          <label>Poster Url</label>
          <input name="posterUrl" value={formData.posterUrl} onChange={handleChange} required />
        </div>

        <button type="submit" className="admin-submit-btn" disabled={loading}>
          {loading ? 'Adding...' : 'Add Movie'}
        </button>
      </form>
    </div>
  );
}

export default AdminAddMovie;
