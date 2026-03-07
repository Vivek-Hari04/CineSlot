import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../apiClient';

function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      onSuccess(res.data);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="auth-title">Welcome back!</h1>
      <p className="auth-subtitle">Login to manage your bookings.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </>
  );
}

function SignupForm({ onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', { name, email, password, role: 'user' });
      onSuccess(res.data);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-subtitle">Sign up in a few seconds.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
          />
        </label>

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Create a password"
          />
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing up…' : 'Sign up'}
        </button>
      </form>
    </>
  );
}

function AuthPage({ initialMode = 'login' }) {
  const location = useLocation();
  const navigate = useNavigate();

  const startingMode = location.pathname.includes('signup') ? 'signup' : initialMode;
  const [mode, setMode] = useState(startingMode);

  useEffect(() => {
    setMode(location.pathname.includes('signup') ? 'signup' : 'login');
  }, [location.pathname]);

  const handleAuthSuccess = (user) => {
    window.localStorage.setItem('cineslotUserId', user.id);
    window.localStorage.setItem('cineslotUserName', user.name);
    navigate('/bookings');
  };

  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <p className="auth-hero-text">
          “Cinema is a matter of what&apos;s in the frame and what&apos;s out.”
        </p>
      </div>

      <div className="auth-card">
        {mode === 'login' ? (
          <>
            <LoginForm onSuccess={handleAuthSuccess} />
            <p className="auth-footer-text">
              Don&apos;t have an account? <Link to="/signup">Sign up</Link>
            </p>
          </>
        ) : (
          <>
            <SignupForm onSuccess={handleAuthSuccess} />
            <p className="auth-footer-text">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthPage;

