import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import api from '../../apiClient';

function AdminAddShow() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState('');
  
  const [shows, setShows] = useState([]);
  const [loadingShows, setLoadingShows] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingShowId, setEditingShowId] = useState(null);

  // Generate next 8 dates
  const next8Days = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const displayStr = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    next8Days.push({ value: dateStr, label: displayStr });
  }

  const initialForm = {
    movie: '',
    showDate: '',
    startTime: '', // This will hold a single string if editing, or a single value if multiple added
    basePrice: '',
    totalSeats: 1, // Start with at least 1 seat
    status: 'scheduled',
  };

  const [formData, setFormData] = useState(initialForm);
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [formLoading, setFormLoading] = useState(false);
  
  const predeterminedTimes = ['10:00 AM', '2:30 PM', '7:30 PM'];
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [showCustomTimeInput, setShowCustomTimeInput] = useState(false);
  const [customTime, setCustomTime] = useState('');

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const res = await api.get('/movies');
        setMovies(res.data || []);
      } catch (err) {
        console.error('Failed to load movies:', err);
      }
    };
    loadMovies();
  }, []);

  useEffect(() => {
    if (!selectedMovie) {
      setShows([]);
      return;
    }
    loadShowsForMovie(selectedMovie);
  }, [selectedMovie]);

  const loadShowsForMovie = async (movieId) => {
    setLoadingShows(true);
    try {
      const res = await api.get(`/shows?movieId=${movieId}`);
      setShows(res.data || []);
    } catch (err) {
      console.error('Failed to load shows:', err);
    } finally {
      setLoadingShows(false);
    }
  };

  const resetTimeSelection = () => {
    setSelectedTimes([]);
    setShowCustomTimeInput(false);
    setCustomTime('');
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({ ...initialForm, movie: selectedMovie, showDate: next8Days[0]?.value || '' });
    resetTimeSelection();
    setFormStatus({ type: '', message: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (show) => {
    setModalMode('edit');
    setEditingShowId(show._id);
    const dateStr = new Date(show.showDate).toISOString().split('T')[0];
    
    setFormData({
      movie: show.movie._id || show.movie,
      showDate: dateStr,
      startTime: show.startTime,
      basePrice: show.basePrice,
      totalSeats: show.totalSeats,
      status: show.status,
    });
    
    resetTimeSelection();
    setSelectedTimes([show.startTime]);
    
    setFormStatus({ type: '', message: '' });
    setShowModal(true);
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this show?')) return;
    try {
      await api.delete(`/shows/${id}`);
      if (selectedMovie) {
        loadShowsForMovie(selectedMovie);
      }
    } catch (err) {
      console.error('Failed to delete show:', err);
      alert('Error deleting show');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleTimeSelection = (time) => {
    if (modalMode === 'add') {
      setSelectedTimes(prev => 
        prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
      );
    } else {
      // Edit mode limits to 1 time selection
      setSelectedTimes([time]);
    }
  };

  const handleCustomTimeAdd = () => {
    if (customTime) {
       toggleTimeSelection(customTime);
       setCustomTime('');
       setShowCustomTimeInput(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormStatus({ type: '', message: '' });
    
    if (selectedTimes.length === 0) {
      setFormStatus({ type: 'error', message: 'Please select at least one time slot.' });
      setFormLoading(false);
      return;
    }

    try {
      if (modalMode === 'add') {
        // Create multiple shows based on the selected times
        const promises = selectedTimes.map(time => {
           return api.post('/shows', {
             ...formData,
             startTime: time,
             basePrice: Number(formData.basePrice),
             totalSeats: Number(formData.totalSeats),
           });
        });
        await Promise.all(promises);
        setFormStatus({ type: 'success', message: `Successfully added ${selectedTimes.length} show(s)!` });
      } else {
        // Edit mode processes only the single time slot selection
        const timeToUpdate = selectedTimes[0];
        const payload = {
          ...formData,
          startTime: timeToUpdate,
          basePrice: Number(formData.basePrice),
          totalSeats: Number(formData.totalSeats),
        };
        await api.put(`/shows/${editingShowId}`, payload);
        setFormStatus({ type: 'success', message: 'Show updated successfully!' });
      }
      
      if (selectedMovie) {
        loadShowsForMovie(selectedMovie);
      }
      
      setTimeout(() => setShowModal(false), 1500);

    } catch (err) {
      console.error(err);
      setFormStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to save show(s).' 
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Group shows by date
  const groupedShows = shows.reduce((acc, show) => {
    const dateStr = new Date(show.showDate).toISOString().split('T')[0];
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(show);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedShows).sort();

  return (
    <div className="admin-shows-management">
      <div className="admin-shows-header">
        <h2 className="admin-section-title">MANAGE SHOWS</h2>
        <button className="admin-action-btn primary" onClick={handleOpenAddModal}>
          <FiPlus size={18} /> Add Show
        </button>
      </div>

      <div className="admin-show-filters">
        <label>Select Movie to view shows:</label>
        <select 
          value={selectedMovie} 
          onChange={(e) => setSelectedMovie(e.target.value)}
          className="admin-movie-select"
        >
          <option value="">-- Choose a Movie --</option>
          {movies.map(m => (
            <option key={m._id} value={m._id}>{m.title}</option>
          ))}
        </select>
      </div>

      {loadingShows ? (
        <div className="admin-loading">Loading shows...</div>
      ) : selectedMovie ? (
        <div className="admin-shows-list">
          {sortedDates.length === 0 ? (
            <div className="admin-empty-state">No shows scheduled for this movie.</div>
          ) : (
            sortedDates.map((date) => (
              <div key={date} className="admin-show-date-group">
                <h3 className="admin-show-date-heading">
                  {new Date(date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <div className="admin-show-times-grid">
                  {groupedShows[date].map(show => (
                    <div key={show._id} className={`admin-show-time-card status-${show.status}`}>
                      <div className="show-time-main">
                        <span className="show-time-text">{show.startTime}</span>
                        <span className="show-status-badge">{show.status}</span>
                      </div>
                      <div className="show-time-details">
                        <span>₹{show.basePrice}</span>
                        <span>•</span>
                        <span>{show.totalSeats} seats</span>
                      </div>
                      <div className="show-time-actions">
                        <button 
                          className="icon-btn edit" 
                          onClick={() => handleOpenEditModal(show)}
                          title="Edit Show"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          className="icon-btn delete" 
                          onClick={() => handleDeleteShow(show._id)}
                          title="Delete Show"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="admin-empty-state">Please select a movie to view its shows.</div>
      )}

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-content">
            <button className="admin-modal-close" onClick={() => setShowModal(false)}>
              <FiX size={24} />
            </button>
            <h2 className="admin-modal-title">
              {modalMode === 'add' ? 'Add New Show' : 'Edit Show'}
            </h2>

            {formStatus.message && (
              <div className={`admin-submit-${formStatus.type}`}>
                {formStatus.message}
              </div>
            )}

            <form className="admin-form-container" onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Movie</label>
                <select name="movie" value={formData.movie} onChange={handleChange} required>
                  <option value="" disabled>Select a movie</option>
                  {movies.map(m => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="admin-form-group time-slot-group">
                <label>Select Date</label>
                <div className="time-slots-container">
                  {modalMode === 'edit' && !next8Days.find(d => d.value === formData.showDate) && (
                     <button 
                       type="button" 
                       className="time-slot-btn selected"
                     >
                       {new Date(formData.showDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                     </button>
                  )}
                  {next8Days.map(d => (
                    <button 
                      type="button"
                      key={d.value}
                      className={`time-slot-btn ${formData.showDate === d.value ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, showDate: d.value })}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-form-group time-slot-group">
                <label>Time Slots {modalMode === 'add' ? '(Select Multiple)' : ''}</label>
                <div className="time-slots-container">
                  {predeterminedTimes.map(time => (
                    <button 
                      type="button"
                      key={time}
                      className={`time-slot-btn ${selectedTimes.includes(time) ? 'selected' : ''}`}
                      onClick={() => toggleTimeSelection(time)}
                    >
                      {time}
                    </button>
                  ))}
                  {/* Render any selected custom times */}
                  {selectedTimes.filter(t => !predeterminedTimes.includes(t)).map(time => (
                    <button 
                      type="button"
                      key={time}
                      className="time-slot-btn selected custom-slot"
                      onClick={() => toggleTimeSelection(time)}
                    >
                      {time} <FiX size={12} style={{marginLeft: 4}} />
                    </button>
                  ))}
                  {!showCustomTimeInput ? (
                    <button 
                      type="button" 
                      className="time-slot-btn add-custom"
                      onClick={() => setShowCustomTimeInput(true)}
                    >
                      + Custom Time
                    </button>
                  ) : (
                    <div className="custom-time-input-group">
                      <input 
                        type="time" 
                        value={customTime}
                        onChange={(e) => {
                          // Format it nicely to AM/PM if standard HTML5 time
                          if (e.target.value) {
                             const [h, m] = e.target.value.split(':');
                             let hours = parseInt(h);
                             const ampm = hours >= 12 ? 'PM' : 'AM';
                             hours = hours % 12;
                             hours = hours ? hours : 12;
                             setCustomTime(`${hours}:${m} ${ampm}`);
                          }
                        }}
                      />
                      <button type="button" onClick={handleCustomTimeAdd}>Add</button>
                      <button type="button" onClick={() => setShowCustomTimeInput(false)}><FiX /></button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-form-group">
                  <label>Base Price (₹)</label>
                  <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} placeholder="e.g. 150" required />
                </div>
                <div className="admin-form-group">
                  <label>Total Seats</label>
                  <input type="number" name="totalSeats" value={formData.totalSeats} onChange={handleChange} min="1" max="64" placeholder="Min 1, Max 64" required />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} required>
                  <option value="scheduled">Scheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-action-btn secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : modalMode === 'add' ? 'Add Show' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAddShow;
