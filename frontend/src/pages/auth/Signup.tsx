import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../../api/auth';
import { useAuthStore } from '../../store/auth';

export default function Signup() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState(1);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const workspaces = ['Acme Corp', 'Global Inc', 'Design Co'];

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace && !name) {
      setError('Please select or create a workspace');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await signup({ name, email, password });
      setAuth(response.accessToken, response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
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
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-[rgba(255,255,255,0.08)] rounded-t-[var(--r-xl)]" />

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div 
            className={`h-1.5 w-8 rounded-full transition-colors ${step === 1 ? 'bg-violet' : 'bg-border-default'}`} 
            onClick={() => setStep(1)} 
            role="button" 
          />
          <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 2 ? 'bg-violet' : 'bg-border-default'}`} />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-[8px] h-[8px] bg-violet rounded-[4px]" />
          <span className="text-[18px] font-semibold text-text-primary tracking-tight">Taskflow</span>
        </div>

        <p className="text-[13px] text-text-muted mt-[24px]">
          {step === 1 ? 'Create your account' : 'Join or create a workspace'}
        </p>

        {error && <div className="mt-4 text-[13px] text-rose-400">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-label">Full name</label>
              <input 
                type="text" 
                className="input-base h-[38px]"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
              <label className="text-label">Password</label>
              <input 
                type="password" 
                className="input-base h-[38px]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary h-[38px] mt-2">
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit} className="mt-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-label">Workspace name</label>
              <input 
                type="text" 
                className="input-base h-[38px]"
                placeholder="e.g. Acme Corp"
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label">Suggested workspaces</label>
              <div className="flex gap-2 flex-wrap">
                {workspaces.map((ws) => (
                  <div
                    key={ws}
                    onClick={() => setSelectedWorkspace(ws)}
                    className={`
                      w-[80px] h-[60px] flex items-center justify-center rounded-[var(--r-md)] border text-[12px] font-medium cursor-pointer transition-all duration-[120ms] text-center px-2
                      ${selectedWorkspace === ws 
                        ? 'border-border-violet bg-violet-dim text-text-violet' 
                        : 'border-border-default bg-transparent text-text-secondary hover:border-border-violet hover:bg-violet-dim hover:text-text-primary'
                      }
                    `}
                  >
                    {ws}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary h-[38px] mt-2" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>

            <button 
              type="button"
              onClick={() => setStep(1)}
              className="btn-ghost h-[38px]"
            >
              Back
            </button>
          </form>
        )}

        <p className="text-center text-[13px] text-text-muted mt-8">
          Already have an account? <Link to="/login" className="text-text-violet hover:text-violet-light transition-colors">Sign in &rarr;</Link>
        </p>
      </div>
    </div>
  );
}
