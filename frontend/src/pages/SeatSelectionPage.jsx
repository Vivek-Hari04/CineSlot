import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../apiClient';

const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COL_COUNT = 8;

function buildSeatIds(totalSeats) {
  const ids = [];
  let remaining = totalSeats;

  for (let r = 0; r < ROW_LABELS.length && remaining > 0; r += 1) {
    for (let c = 1; c <= COL_COUNT && remaining > 0; c += 1) {
      ids.push(`${ROW_LABELS[r]}${c}`);
      remaining -= 1;
    }
  }

  return ids;
}

function SeatSelectionPage() {
  const { showId } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [message, setMessage] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/shows/${showId}`);
        setShow(res.data);
      } catch (err) {
        console.error(err);
        setMessage('Could not load show details.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [showId]);

  const allSeatIds = useMemo(
    () => (show ? buildSeatIds(show.totalSeats) : []),
    [show]
  );

  const isOccupied = (seatId) => show?.bookedSeats?.includes(seatId);

  const toggleSeat = (seatId) => {
    if (isOccupied(seatId)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  const handleConfirm = async () => {
    if (!show || selectedSeats.length === 0) {
      setMessage('Select at least one seat to continue.');
      return;
    }

    const userId = window.localStorage.getItem('cineslotUserId');
    if (!userId || userId === 'undefined' || userId === 'null') {
      setMessage('Your session has expired or is invalid. Please log out and back in.');
      return;
    }

    try {
      setMessage('');
      const totalAmount = show.basePrice * selectedSeats.length;
      await api.post('/bookings', {
        userId,
        showId: show._id,
        seats: selectedSeats,
        totalAmount,
      });

      setIsBooked(true);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Booking failed. Please try again.';
      setMessage(msg);
    }
  };

  if (loading) {
    return <div className="empty-state">Loading seat map…</div>;
  }

  if (!show) {
    return <div className="empty-state">Show not found.</div>;
  }

  const pricePerTicket = show.basePrice;
  const total = pricePerTicket * selectedSeats.length;

  if (isBooked) {
    return (
      <div className="empty-state" style={{ marginTop: '3rem' }}>
        <h2 style={{ color: '#4ade80', fontSize: '1.75rem', marginBottom: '1rem', fontWeight: '700' }}>
          Booking Successful!
        </h2>
        <p style={{ color: '#cbd5f5', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
          Your seat(s) {selectedSeats.join(', ')} have been confirmed.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button type="button" className="secondary-button" onClick={() => navigate('/')}>
            Return Home
          </button>
          <button type="button" onClick={() => navigate('/bookings')}>
            View Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Seat selection</h1>
      </div>

      <div className="seat-legend">
        <span className="seat-legend-item">
          <span className="seat-swatch available" /> Available
        </span>
        <span className="seat-legend-item">
          <span className="seat-swatch selected" /> Selected
        </span>
        <span className="seat-legend-item">
          <span className="seat-swatch occupied" /> Occupied
        </span>
      </div>

      <div className="seat-screen-label">SCREEN</div>

      <div className="seat-grid">
        {ROW_LABELS.map((rowLabel) => (
          <div key={rowLabel} className="seat-row">
            <div className="seat-row-label">{rowLabel}</div>
            {Array.from({ length: COL_COUNT }).map((_, index) => {
              const seatId = `${rowLabel}${index + 1}`;
              if (!allSeatIds.includes(seatId)) {
                return (
                  <button
                    key={seatId}
                    type="button"
                    className="seat-button seat-hidden"
                    disabled
                  />
                );
              }

              const occupied = isOccupied(seatId);
              const selected = selectedSeats.includes(seatId);

              const classNames = [
                'seat-button',
                occupied ? 'occupied' : 'available',
                selected ? 'selected' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <button
                  key={seatId}
                  type="button"
                  className={classNames}
                  onClick={() => toggleSeat(seatId)}
                  disabled={occupied}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="seat-summary">
        <div className="seat-summary-text">
          <div>Selected seats: {selectedSeats.length ? selectedSeats.join(', ') : '-'}</div>
          <div>Price per ticket: ₹{pricePerTicket}</div>
        </div>
        <div className="seat-summary-total">Total: ₹{total}</div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button type="button" onClick={handleConfirm}>
          Confirm booking
        </button>
      </div>

      {message && <div className="empty-state">{message}</div>}
    </div>
  );
}

export default SeatSelectionPage;

