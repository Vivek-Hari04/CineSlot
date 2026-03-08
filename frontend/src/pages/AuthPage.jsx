import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../apiClient';
import { useAuth } from '../context/AuthContext';

function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Please use a @gmail.com email address.');
      return;
    }
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
            pattern=".*@gmail\.com"
            required
            placeholder="you@gmail.com"
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Please use a @gmail.com email address.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
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
            pattern=".*@gmail\.com"
            required
            placeholder="you@gmail.com"
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </label>

        <label className="auth-field">
          <span>Confirm Password</span>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing up…' : 'Sign up'}
        </button>
      </form>
    </>
  );
}

const QUOTES = [
  "“Cinema is a matter of what's in the frame and what's out.”",
  "“Every time I go to a movie, it's magic, no matter what the movie's about.”",
  "“Photography is truth. The cinema is truth twenty-four times per second.”",
  "“There are no rules in filmmaking. Only sins. And the cardinal sin is dullness.”",
  "“To make a great film you need three things – the script, the script, and the script.”",
];

function AuthPage({ initialMode = 'login' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [quote, setQuote] = useState('');

  const startingMode = location.pathname.includes('signup') ? 'signup' : initialMode;
  const [mode, setMode] = useState(startingMode);

  useEffect(() => {
    setMode(location.pathname.includes('signup') ? 'signup' : 'login');
  }, [location.pathname]);

  useEffect(() => {
    // Pick a random quote on mount
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[randomIndex]);
  }, []);

  const handleAuthSuccess = (user) => {
    login(user);
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <p className="auth-hero-text">
          {quote}
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

