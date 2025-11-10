import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, user, navigate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Please provide both an institutional email and password.');
      return;
    }

    if (!/@/.test(email) || !email.endsWith('.edu')) {
      setError('Use your institutional .edu email address to continue.');
      return;
    }

    setSubmitting(true);
    login({ email, password })
      .then(() => {
      setSubmitting(false);
        setSuccess('Welcome back to CoinMatch.');
      navigate('/dashboard', { replace: true });
      })
      .catch((error: Error) => {
        setSubmitting(false);
        setError(error.message || 'Unable to sign in.');
      });
  };

  return (
    <div className="flex min-h-screen bg-parchment">
      <div className="relative hidden w-1/2 items-end justify-between overflow-hidden border-r border-gold-300 bg-gradient-to-br from-parchment via-white to-gold-300 px-12 py-16 lg:flex">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Harvard Art Museums</p>
          <h1 className="mt-4 text-5xl font-display text-stone-900">CoinMatch</h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-stone-600">
            A research console for tracing Dewing collection coins across global auction records. Designed for curators, conservators, and provenance scholars.
          </p>
        </div>
        <div className="rounded-full border border-stone-200 bg-white/70 px-6 py-3 text-xs uppercase tracking-[0.35em] text-stone-500">
          Division of Asian and Mediterranean Art
        </div>
      </div>
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white/90 p-10 shadow-card">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Research login</p>
            <h2 className="mt-3 text-3xl font-display text-stone-900">Sign in to CoinMatch</h2>
            <p className="mt-2 text-sm text-stone-500">Use your Harvard Art Museums credentials.</p>
          </div>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500" htmlFor="email">
                Institutional Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                disabled={submitting}
                className="mt-2 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 shadow-inner focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-200"
                placeholder="name@harvard.edu"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide text-stone-500" htmlFor="password">
                  Password
                </label>
                <button type="button" className="text-xs font-semibold uppercase tracking-wide text-gold-500 transition hover:text-gold-400">
                  Forgot?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                disabled={submitting}
                className="mt-2 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 shadow-inner focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-200"
                placeholder="••••••••"
              />
            </div>
            {error ? <p className="text-sm text-rose-500">{error}</p> : null}
            {success ? <p className="text-sm text-gold-500">{success}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-md bg-gold-500 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-stone-400">Version 0.1 · UI prototype</p>
        </div>
      </div>
    </div>
  );
}
