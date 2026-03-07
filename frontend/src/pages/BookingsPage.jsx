import { useEffect, useState } from 'react';
import api from '../apiClient';
import qrCode from '../assets/qrcode.jpeg';

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    const load = async () => {
      const userId = window.localStorage.getItem('cineslotUserId');
      if (!userId) {
        setMessage('Login or sign up to see your bookings.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(`/bookings/user/${userId}`);
        setBookings(res.data || []);
      } catch (err) {
        console.error(err);
        setMessage('Could not load bookings.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCancel = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b)),
      );
    } catch (err) {
      console.error(err);
      setMessage('Could not cancel booking.');
    }
  };

  const handleRemove = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (err) {
      console.error(err);
      setMessage('Could not remove booking.');
    }
  };

  const renderBookingCard = (booking) => {
    const show = booking.show || {};
    const movie = show.movie || {};
    const poster = movie.posterUrl;
    const title = movie.title || 'Movie';

    const bookingDate =
      booking.bookingDate && new Date(booking.bookingDate).toLocaleDateString();

    const showDate =
      show.showDate &&
      new Date(show.showDate).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    const bookingIdShort = booking._id.slice(-6).toUpperCase();

    return (
      <article key={booking._id} className="booking-card">
        <div className="booking-poster">
          {poster ? (
            <img src={poster} alt={title} />
          ) : (
            <div className="booking-poster-placeholder">Poster</div>
          )}
        </div>
        <div className="booking-meta">
          <h2 className="booking-meta-title">
            {title}
            {booking.status === 'cancelled' && ' (Cancelled)'}
          </h2>
          <div className="booking-meta-row">
            <span>
              {showDate} · {show.startTime}
            </span>
          </div>
          <div className="booking-meta-row">
            <span>Seats: {booking.seats.join(', ')}</span>
          </div>
          <div className="booking-meta-row">
            <span>Total: ₹{booking.totalAmount}</span>
          </div>
          <div className="booking-meta-row">
            <span>Booking ID: #{bookingIdShort}</span>
            {bookingDate && <span>Booked on: {bookingDate}</span>}
          </div>
          <div className="booking-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setActiveBooking({ booking, show, movie, bookingIdShort })}
            >
              Show ticket
            </button>
            {booking.status !== 'cancelled' ? (
              <button
                type="button"
                className="secondary-button cancel-button"
                onClick={() => handleCancel(booking._id)}
              >
                Cancel booking
              </button>
            ) : (
              <button
                type="button"
                className="secondary-button cancel-button"
                onClick={() => handleRemove(booking._id)}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My bookings</h1>
      </div>

      {loading && <div className="empty-state">Loading bookings…</div>}
      {!loading && message && <div className="empty-state">{message}</div>}

      {!loading && !message && bookings.length === 0 && (
        <div className="empty-state">You don&apos;t have any bookings yet.</div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="bookings-list">
          {bookings.map((booking) => renderBookingCard(booking))}
        </div>
      )}

      {activeBooking && (
        <div className="ticket-modal-backdrop" onClick={() => setActiveBooking(null)}>
          <div
            className="ticket-new-modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {activeBooking.booking.status && (
              <div className={`ticket-header-pill status-${activeBooking.booking.status.toLowerCase()}`}>
                {activeBooking.booking.status.toUpperCase()}
              </div>
            )}
            <div className="ticket-top">
              <div className="ticket-time">
                {new Date(activeBooking.show.showDate).toLocaleDateString(undefined, {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}{' '}
                · {activeBooking.show.startTime}
              </div>
              <h2 className="ticket-title">{activeBooking.movie.title}</h2>
              <div className="ticket-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Cinema
              </div>
              <div className="ticket-details-grid">
                <div><span>Seats:</span> <strong>{activeBooking.booking.seats.join(', ')}</strong></div>
                <div><span>Total:</span> <strong>₹{activeBooking.booking.totalAmount}</strong></div>
                <div style={{gridColumn: "span 2"}}><span>Booking ID:</span> <strong>#{activeBooking.bookingIdShort}</strong></div>
              </div>
            </div>
            
            <div className="ticket-divider">
               <div className="ticket-divider-line"></div>
               <button type="button" className="ticket-view-btn" onClick={() => setActiveBooking(null)}>
                 VIEW TICKET
               </button>
               <div className="ticket-divider-line"></div>
            </div>

            <div className="ticket-bottom">
               <img src={qrCode} alt="Ticket QR code" className="ticket-qr" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingsPage;

