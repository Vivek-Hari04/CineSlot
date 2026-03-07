import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../apiClient';

function MovieDetailsPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [movieRes, showsRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/shows`, { params: { movieId: id } }),
        ]);
        setMovie(movieRes.data);
        setShows(showsRes.data || []);
      } catch (err) {
        console.error(err);
        setMessage('Could not load movie or shows.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const dateOptions = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const timeSlots = ['10:00 AM', '2:30 PM', '7:30 PM'];

  const findSelectedShow = () => {
    if (!movie || !shows.length || !selectedTime || selectedDayIndex === null) return null;
    const selectedDate = dateOptions[selectedDayIndex];
    return (
      shows.find((show) => {
        const d = new Date(show.showDate);
        const sameDay =
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate();
        return sameDay && show.startTime === selectedTime;
      }) || null
    );
  };

  const handleSelectSeats = () => {
    const show = findSelectedShow();
    if (!show) {
      setMessage('No show configured for that date and time yet.');
      return;
    }
    navigate(`/shows/${show._id}/seats`);
  };

  if (loading) {
    return <div className="empty-state">Loading movie…</div>;
  }

  if (!movie) {
    return <div className="empty-state">Movie not found.</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Movie details</h1>
      </div>

      <div className="page-layout-two-column">
        <section className="movie-hero">
          {movie.posterUrl && (
            <div className="movie-hero-poster">
              <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />
            </div>
          )}
          <div className="movie-hero-details">
            <h2 className="movie-title" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              {movie.title}
            </h2>
            <div className="movie-meta">
              {movie.genre?.map((g) => (
                <span key={g} className="pill">
                  {g}
                </span>
              ))}
              {movie.language && <span className="pill">{movie.language}</span>}
              {movie.duration && <span className="pill">{movie.duration} min</span>}
              {typeof movie.rating === 'number' && (
                <span className="pill rating-pill">★ {movie.rating}</span>
              )}
            </div>
            {movie.synopsis && <p className="movie-details-synopsis">{movie.synopsis}</p>}
          </div>
        </section>

        <section>
          <h2 className="section-title">Showtimes</h2>

          <p className="showtimes-label">Show date</p>
          <div className="chip-row show-chip-row">
            {dateOptions.map((d, index) => (
              <button
                key={d.toISOString()}
                type="button"
                className={`show-chip${
                  index === selectedDayIndex ? ' show-chip-active' : ''
                }`}
                onClick={() => {
                  setSelectedDayIndex(index);
                  setSelectedTime('');
                }}
              >
                {d.toLocaleDateString(undefined, {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                })}
              </button>
            ))}
          </div>

          <p className="showtimes-label" style={{ marginTop: '1rem' }}>
            Show time
          </p>
          <div className="show-list">
            <div className="chip-row show-chip-row">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`show-chip${selectedTime === slot ? ' show-chip-active' : ''}`}
                  onClick={() => setSelectedTime(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button
                type="button"
                className="show-select-button"
                onClick={handleSelectSeats}
                disabled={selectedDayIndex === null || !selectedTime}
              >
                Select seats
              </button>
            </div>
          </div>
        </section>
      </div>

      {message && <div className="empty-state">{message}</div>}
    </div>
  );
}

export default MovieDetailsPage;

