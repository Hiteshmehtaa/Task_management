import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/auth';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await login({ email, password });
      setAuth(response.accessToken, response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 page-transition">
      <div 
        className="w-full max-w-[400px] bg-bg-surface border border-border-default rounded-[var(--r-xl)] relative flex flex-col"
        style={{ padding: '40px 36px' }}
      >
        {/* Subtle top border lift */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-[rgba(255,255,255,0.08)] rounded-t-[var(--r-xl)]" />

        <div className="flex items-center gap-3">
          <div className="w-[8px] h-[8px] bg-violet rounded-[4px]" />
          <span className="text-[18px] font-semibold text-text-primary tracking-tight">Taskflow</span>
        </div>

        <p className="text-[13px] text-text-muted mt-[24px]">Sign in to continue</p>

        {error && <div className="mt-4 text-[13px] text-rose-400">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-label">Email</label>
            <input 
              type="email" 
              className="input-base h-[38px]"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-label">Password</label>
              <a href="#" className="text-[12px] text-text-violet hover:text-violet-light transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                className="input-base h-[38px] w-full pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary h-[38px] mt-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-[1px] bg-border-subtle flex-1" />
          <span className="text-[12px] text-text-muted">or</span>
          <div className="h-[1px] bg-border-subtle flex-1" />
        </div>

        <button type="button" className="btn-ghost h-[38px] w-full gap-2 opacity-60 cursor-not-allowed">
          <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* TODO: We need OAuth setup for this so we can implement it later on */}
        <p className="text-center text-[11px] text-text-muted mt-2 italic">
          ( Requires OAuth setup, Due to time constraints, this is currently non-functional )
        </p>

        <p className="text-center text-[13px] text-text-muted mt-8">
          No account? <Link to="/signup" className="text-text-violet hover:text-violet-light transition-colors">Sign up &rarr;</Link>
        </p>
      </div>
    </div>
  );
}
