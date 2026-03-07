import { useState, useEffect } from 'react';
import api from '../../apiClient';

function AdminAddShow() {
  const [movies, setMovies] = useState([]);
  const [formData, setFormData] = useState({
    movie: '',
    showDate: '',
    startTime: '',
    basePrice: '',
    totalSeats: '',
    status: 'scheduled'
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load movies to populate the drop-down
    const loadMovies = async () => {
      try {
        const res = await api.get('/movies');
        setMovies(res.data || []);
      } catch (err) {
        console.error('Failed to load movies for forms:', err);
      }
    };
    loadMovies();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post('/shows', {
         ...formData,
         basePrice: Number(formData.basePrice),
         totalSeats: Number(formData.totalSeats)
      });
      setStatus({ type: 'success', message: 'Show added successfully!' });
      setFormData({
        movie: '', showDate: '', startTime: '', basePrice: '', totalSeats: '', status: 'scheduled'
      });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to add show. Check input data.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-show">
      <h2 className="admin-section-title">ADD SHOWS</h2>

      {status.message && (
        <div className={`admin-submit-${status.type}`}>
          {status.message}
        </div>
      )}

      <form className="admin-form-container" onSubmit={handleSubmit}>
        <div className="admin-form-group">
          <label>Movie Title</label>
          <select name="movie" value={formData.movie} onChange={handleChange} required>
            <option value="" disabled>Select a movie</option>
            {movies.map(m => (
              <option key={m._id} value={m._id}>{m.title}</option>
            ))}
          </select>
        </div>
        <div className="admin-form-group">
          <label>ShowDate</label>
          <input type="date" name="showDate" value={formData.showDate} onChange={handleChange} required />
        </div>
        <div className="admin-form-group">
          <label>Start Time</label>
          <input name="startTime" value={formData.startTime} onChange={handleChange} placeholder="e.g. 10:00 AM" required />
        </div>
        <div className="admin-form-group">
          <label>Base Price</label>
          <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} placeholder="e.g. 150" required />
        </div>
        <div className="admin-form-group">
          <label>Total Seats</label>
          <input type="number" name="totalSeats" value={formData.totalSeats} onChange={handleChange} placeholder="e.g. 60" required />
        </div>
        <div className="admin-form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="scheduled">Scheduled</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button type="submit" className="admin-submit-btn" disabled={loading}>
          {loading ? 'Adding...' : 'Add Show'}
        </button>
      </form>
    </div>
  );
}

export default AdminAddShow;
