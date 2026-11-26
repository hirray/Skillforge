import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

// ── BRAND SPLIT WRAPPER ──────────────────────────────────────────────────────────
export const AuthSplitLayout: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-4xl grid md:grid-cols-12 bg-[#12131a] border border-[#262838] rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Left: Brand Identity Gradient Panel */}
        <div className="md:col-span-5 p-8 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#0A1680] via-[#08105c] to-[#040830] text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#93B2F8]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-[#93B2F8]">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className="font-extrabold text-lg tracking-tight">skillforge<span className="text-[#93B2F8]">.</span></span>
            </div>

            <div className="space-y-3 pt-6">
              <div className="inline-block px-2.5 py-1 rounded-full bg-[#FBEDB0]/15 border border-[#FBEDB0]/30 text-[#FBEDB0] text-[10px] font-bold uppercase tracking-wider">
                Identity & Access
              </div>
              <h2 className="text-2xl font-black leading-tight tracking-tight text-white">
                Find the right people. Build together. Prove it.
              </h2>
              <p className="text-xs text-[#93B2F8]/90 leading-relaxed">
                The auditable collaboration and talent network where engineering contributions become cryptographically attestable career proof.
              </p>
            </div>

            <div className="space-y-2.5 pt-4 text-[11px] text-white/80">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#93B2F8]/20 text-[#93B2F8] flex items-center justify-center text-[10px]">✓</span>
                <span>Verified Milestones & Realtime Project Rooms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#93B2F8]/20 text-[#93B2F8] flex items-center justify-center text-[10px]">✓</span>
                <span>Owner-Verified Completion Certificates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#93B2F8]/20 text-[#93B2F8] flex items-center justify-center text-[10px]">✓</span>
                <span>AI-Powered Requirements & Talent Discovery</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
            <span>Enterprise Auth P0</span>
            <span className="font-mono text-[10px] text-[#93B2F8]">Phase 1 · Module 1</span>
          </div>
        </div>

        {/* Right: Surface Card Form */}
        <div className="md:col-span-7 p-6 sm:p-8 bg-[#151620] flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-5">
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
              <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>

      </div>
    </div>
  );
};

// ── PASSWORD STRENGTH METER HELPER ───────────────────────────────────────────────
export function getPasswordStrength(p: string): { score: number; label: string; color: string } {
  if (!p) return { score: 0, label: '', color: '#333' };
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#F1B94C' }; // Orange pastel weak
  if (score <= 3) return { score: 2, label: 'Fair', color: '#93B2F8' }; // Bleu ciel fair
  return { score: 3, label: 'Strong', color: '#4E75FF' }; // Bleu océan strong
}

// ── 1. SIGN IN PAGE ─────────────────────────────────────────────────────────────
export const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDevLogin = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/auth/dev-login/${userId}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Dev login failed');

      localStorage.setItem('token', data.tokens?.accessToken || userId);
      if (data.tokens?.refreshToken) localStorage.setItem('refreshToken', data.tokens.refreshToken);
      localStorage.setItem('sf_user_email', data.user?.email || `${userId}@skillforge.local`);
      window.location.href = '/projects';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error?.message || 'Invalid email or password');

      localStorage.setItem('token', data.tokens?.accessToken);
      if (data.tokens?.refreshToken) localStorage.setItem('refreshToken', data.tokens.refreshToken);
      localStorage.setItem('sf_user_email', data.user?.email || email);
      window.location.href = '/projects';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout title="Sign In" subtitle="Access your workspace, projects, and verified credentials">
      {error && (
        <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-4 text-xs">
        <div>
          <label className="block text-zinc-300 font-semibold mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="engineer@skillforge.local"
            className="w-full bg-[#1b1b26] text-white p-2.5 rounded-xl border border-[#2b2d3d] focus:border-[#93B2F8] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-zinc-300 font-semibold">Password</label>
            <Link to="/auth/forgot-password" className="text-[11px] text-[#93B2F8] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#1b1b26] text-white p-2.5 pr-10 rounded-xl border border-[#2b2d3d] focus:border-[#93B2F8] focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-400">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-[#2b2d3d] bg-[#1b1b26] text-[#0A1680] focus:ring-0"
            />
            <span>Remember session on this device</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl font-bold text-xs text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20 flex items-center justify-center gap-2"
        >
          {loading ? 'Authenticating...' : 'Sign In to Workspace'}
        </button>
      </form>

      <div className="pt-2 border-t border-[#262838] text-center text-xs text-zinc-400">
        Don't have an account?{' '}
        <Link to="/auth/register" className="font-semibold text-[#93B2F8] hover:underline">
          Create Account
        </Link>
      </div>

      {/* Dev Quick-Login Bar */}
      <div className="pt-3 border-t border-[#262838] space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold text-center">
          1-Click Developer Authentication (Local Dev)
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDevLogin('user-001')}
            className="px-2 py-1.5 rounded-lg bg-[#1b1b26] hover:bg-[#252636] border border-[#2b2d3d] text-[11px] font-semibold text-zinc-300 transition-colors"
          >
            Candidate (001)
          </button>
          <button
            type="button"
            onClick={() => handleDevLogin('user-002')}
            className="px-2 py-1.5 rounded-lg bg-[#1b1b26] hover:bg-[#252636] border border-[#2b2d3d] text-[11px] font-semibold text-zinc-300 transition-colors"
          >
            Freelancer (002)
          </button>
          <button
            type="button"
            onClick={() => handleDevLogin('recruiter-001')}
            className="px-2 py-1.5 rounded-lg bg-[#1b1b26] hover:bg-[#252636] border border-[#2b2d3d] text-[11px] font-semibold text-zinc-300 transition-colors"
          >
            Recruiter (001)
          </button>
        </div>
      </div>
    </AuthSplitLayout>
  );
};

// ── 2. REGISTER PAGE ────────────────────────────────────────────────────────────
export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [intendedUse, setIntendedUse] = useState<'individual' | 'recruiter'>('individual');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const strength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('You must accept the terms of service and privacy consent.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          intendedUse,
          companyName: intendedUse === 'recruiter' ? companyName : undefined,
          jobTitle: intendedUse === 'recruiter' ? jobTitle : undefined,
          termsAccepted: true,
          privacyAccepted: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error?.message || 'Registration failed');

      setSuccess('Account created successfully! Verification link logged to API console.');
      localStorage.setItem('token', data.tokens?.accessToken);
      if (data.tokens?.refreshToken) localStorage.setItem('refreshToken', data.tokens.refreshToken);
      localStorage.setItem('sf_user_email', email);
      setTimeout(() => {
        window.location.href = '/projects';
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout title="Create Account" subtitle="Join the verified builder and talent market">
      {error && (
        <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-xs text-rose-300">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-xs text-emerald-300">
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
        <div>
          <label className="block text-zinc-300 font-semibold mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alexandre Chen"
            className="w-full bg-[#1b1b26] text-white p-2.5 rounded-xl border border-[#2b2d3d] focus:border-[#93B2F8] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-zinc-300 font-semibold mb-1">Work or Personal Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.chen@example.com"
            className="w-full bg-[#1b1b26] text-white p-2.5 rounded-xl border border-[#2b2d3d] focus:border-[#93B2F8] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-zinc-300 font-semibold mb-1">Account Role & Intended Use</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIntendedUse('individual')}
              className={`p-2 rounded-xl border text-center transition-all ${
                intendedUse === 'individual'
                  ? 'border-[#93B2F8] bg-[#93B2F8]/15 text-[#93B2F8] font-bold'
                  : 'border-[#2b2d3d] bg-[#1b1b26] text-zinc-400'
              }`}
            >
              Developer / Builder
            </button>
            <button
              type="button"
              onClick={() => setIntendedUse('recruiter')}
              className={`p-2 rounded-xl border text-center transition-all ${
                intendedUse === 'recruiter'
                  ? 'border-[#FBEDB0] bg-[#FBEDB0]/15 text-[#FBEDB0] font-bold'
                  : 'border-[#2b2d3d] bg-[#1b1b26] text-zinc-400'
              }`}
            >
              Recruiter / Sponsor
            </button>
          </div>
        </div>

        {intendedUse === 'recruiter' && (
          <div className="grid grid-cols-2 gap-2 p-3 bg-[#181926] border border-[#2b2d3d] rounded-xl">
            <div>
              <label className="block text-zinc-400 text-[10px] font-semibold mb-1">Company Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="SkillForge Labs"
                className="w-full bg-[#13141f] text-white p-2 rounded-lg border border-[#2b2d3d] text-xs"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-[10px] font-semibold mb-1">Job Title</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Talent Partner"
                className="w-full bg-[#13141f] text-white p-2 rounded-lg border border-[#2b2d3d] text-xs"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-zinc-300 font-semibold mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-[#1b1b26] text-white p-2.5 pr-10 rounded-xl border border-[#2b2d3d] focus:border-[#93B2F8] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {/* Animated Strength Meter */}
          {password && (
            <div className="mt-1.5 space-y-1">
              <div className="h-1.5 w-full bg-[#262838] rounded-full overflow-hidden flex gap-1">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(strength.score / 3) * 100}%`,
                    backgroundColor: strength.color,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Strength: <strong style={{ color: strength.color }}>{strength.label}</strong></span>
                <span>Requires 8+ chars & numbers</span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-1">
          <label className="flex items-start gap-2 cursor-pointer text-zinc-400 text-[11px]">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 rounded border-[#2b2d3d] bg-[#1b1b26] text-[#0A1680]"
            />
            <span>
              I agree to the SkillForge Terms of Service, Privacy Policy, and consent to auditable proof records.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl font-bold text-xs text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20 flex items-center justify-center gap-2"
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </button>
      </form>

      <div className="pt-2 border-t border-[#262838] text-center text-xs text-zinc-400">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-semibold text-[#93B2F8] hover:underline">
          Sign In
        </Link>
      </div>
    </AuthSplitLayout>
  );
};

// ── 3. FORGOT PASSWORD PAGE ────────────────────────────────────────────────────
export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout title="Reset Password" subtitle="We'll send a 1-hour secure password reset link">
      {submitted ? (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-xs space-y-2 text-zinc-300">
          <p className="font-bold text-emerald-300">✓ If an account exists, a reset link has been dispatched.</p>
          <p className="text-[11px] text-zinc-400">
            In development mode, your single-use reset URL has been printed directly to the API server console log.
          </p>
          <div className="pt-2">
            <Link to="/auth/login" className="text-xs text-[#93B2F8] font-bold hover:underline">
              ← Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Account Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@skillforge.local"
              className="w-full bg-[#1b1b26] text-white p-2.5 rounded-xl border border-[#2b2d3d] focus:border-[#93B2F8] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all"
          >
            {loading ? 'Sending link...' : 'Send Password Reset Link'}
          </button>

          <div className="text-center pt-2">
            <Link to="/auth/login" className="text-zinc-400 hover:text-white text-xs">
              ← Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthSplitLayout>
  );
};

// ── 4. RESET PASSWORD PAGE ────────────────────────────────────────────────────
export const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ error?: string; success?: string } | null>(null);

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus({ error: 'Missing reset token from URL.' });
      return;
    }
    try {
      setLoading(true);
      setStatus(null);
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      setStatus({ success: 'Password reset successfully! Redirecting to login...' });
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 1500);
    } catch (err: any) {
      setStatus({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout title="Set New Password" subtitle="Choose a strong, unique credential for your account">
      {status?.error && (
        <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-xs text-rose-300">
          ⚠️ {status.error}
        </div>
      )}
      {status?.success && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-xs text-emerald-300">
          ✓ {status.success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-zinc-300 font-semibold mb-1">New Password (8+ characters)</label>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[#1b1b26] text-white p-2.5 rounded-xl border border-[#2b2d3d] focus:border-[#93B2F8] focus:outline-none"
          />
          {newPassword && (
            <div className="mt-1.5 space-y-1">
              <div className="h-1.5 w-full bg-[#262838] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(strength.score / 3) * 100}%`,
                    backgroundColor: strength.color,
                  }}
                />
              </div>
              <span className="text-[10px] text-zinc-400">Strength: <strong style={{ color: strength.color }}>{strength.label}</strong></span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl font-bold text-xs text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all"
        >
          {loading ? 'Saving...' : 'Update Password & Revoke Other Sessions'}
        </button>
      </form>
    </AuthSplitLayout>
  );
};

// ── 5. VERIFY EMAIL PAGE ────────────────────────────────────────────────────────
export const VerifyEmailPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ error?: string; success?: string } | null>(null);

  useEffect(() => {
    if (token) {
      void (async () => {
        try {
          setLoading(true);
          const res = await fetch('/api/v1/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Verification token invalid or expired');
          setStatus({ success: 'Email address verified! Full contributor privileges unlocked.' });
        } catch (err: any) {
          setStatus({ error: err.message });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [token]);

  return (
    <AuthSplitLayout title="Email Verification" subtitle="Confirming single-use verification token">
      {loading && <p className="text-xs text-zinc-300">Verifying single-use token with security provider...</p>}
      {status?.error && (
        <div className="p-4 bg-rose-950/70 border border-rose-500/50 rounded-2xl text-xs space-y-2 text-rose-300">
          <p className="font-bold">⚠️ {status.error}</p>
          <p className="text-[11px] text-zinc-400">Tokens expire after 24 hours. Request a new link from Account Settings.</p>
        </div>
      )}
      {status?.success && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-xs space-y-2 text-emerald-300">
          <p className="font-bold">✓ {status.success}</p>
          <Link to="/projects" className="inline-block mt-2 font-bold text-[#93B2F8] hover:underline">
            Go to Active Projects →
          </Link>
        </div>
      )}
    </AuthSplitLayout>
  );
};

// ── 6. ACCOUNT SETTINGS PAGE ────────────────────────────────────────────────────
export const AccountSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'security' | 'email' | 'danger'>('security');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: string; error?: string } | null>(null);

  const token = localStorage.getItem('token') || 'user-001';

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/v1/auth/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.data) setSessions(data.data);
    } catch {
      // Fallback local session preview
      setSessions([
        { id: 'sess-current', deviceLabel: 'Chrome on Windows 11 (Current)', ipAddress: '127.0.0.1', isCurrent: true, lastActiveAt: new Date().toISOString() },
      ]);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setStatus(null);
      const res = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update password');
      setStatus({ success: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setStatus({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await fetch(`/api/v1/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setStatus({ success: 'Session revoked successfully.' });
    } catch {
      setStatus({ error: 'Could not revoke session.' });
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Log out of all devices? This will invalidate all active refresh chains.')) return;
    try {
      await fetch('/api/v1/auth/logout-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/auth/login';
    } catch {
      setStatus({ error: 'Could not revoke all sessions.' });
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Temporarily deactivate your account? Your public profile and candidate matching will be paused.')) return;
    try {
      setLoading(true);
      const res = await fetch('/api/v1/auth/deactivate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStatus({ success: 'Account deactivated. You can reactivate anytime by signing back in.' });
      }
    } catch (err: any) {
      setStatus({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmation !== 'DELETE') {
      setStatus({ error: 'Please type DELETE in capital letters to confirm.' });
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/v1/auth/delete-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: deleteReason || 'User requested GDPR erasure' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Deletion request failed');
      setStatus({ success: data.message || 'GDPR deletion scheduled with 14-day statutory grace period.' });
      setDeleteConfirmation('');
    } catch (err: any) {
      setStatus({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282938] pb-5">
        <div>
          <h1 className="text-xl font-black text-white">Account & Security Management</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Session controls, security credentials, and GDPR privacy settings</p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('sf_user_email');
            window.location.href = '/auth/login';
          }}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/60 transition-colors flex items-center gap-1.5 w-fit"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out of Workspace
        </button>
      </div>

      {status?.error && (
        <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-xs text-rose-300">
          ⚠️ {status.error}
        </div>
      )}
      {status?.success && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-xs text-emerald-300">
          ✓ {status.success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#282938] pb-1">
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'security'
              ? 'bg-[#0A1680] text-white shadow-md shadow-[#0A1680]/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Security & Active Sessions
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'email'
              ? 'bg-[#0A1680] text-white shadow-md shadow-[#0A1680]/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Email & Verification
        </button>
        <button
          onClick={() => setActiveTab('danger')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'danger'
              ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
              : 'text-zinc-400 hover:text-rose-400'
          }`}
        >
          Danger Zone & GDPR
        </button>
      </div>

      {/* TAB 1: SECURITY */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="bg-[#151622] border border-[#262838] rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-3.5 max-w-md text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#1b1b26] text-white p-2.5 rounded-xl border border-[#2b2d3d] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">New Password (8+ characters)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#1b1b26] text-white p-2.5 rounded-xl border border-[#2b2d3d] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Active Sessions Card */}
          <div className="bg-[#151622] border border-[#262838] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Active Device Sessions</h2>
                <p className="text-[11px] text-zinc-400">Authenticated devices with rotating refresh tokens</p>
              </div>
              <button
                onClick={handleLogoutAll}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/50"
              >
                Log Out All Devices
              </button>
            </div>

            <div className="divide-y divide-[#262838]">
              {sessions.map((sess) => (
                <div key={sess.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{sess.deviceLabel || 'Web Browser'}</span>
                      {sess.isCurrent && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      IP: {sess.ipAddress || '127.0.0.1'} · Last Active: {new Date(sess.lastActiveAt).toLocaleString()}
                    </p>
                  </div>
                  {!sess.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(sess.id)}
                      className="px-2.5 py-1 rounded bg-[#262838] hover:bg-rose-950 hover:text-rose-300 text-zinc-300 text-[11px] transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMAIL & VERIFICATION */}
      {activeTab === 'email' && (
        <div className="bg-[#151622] border border-[#262838] rounded-2xl p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-white">Email Address & Verification Status</h2>
          <div className="p-4 bg-[#1b1b26] rounded-xl border border-[#2b2d3d] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-zinc-400 block text-[11px]">Primary Email</span>
                <span className="text-white font-semibold text-sm">
                  {localStorage.getItem('sf_user_email') || `${token}@skillforge.local`}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                ✓ Verified
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Verified accounts have unrestricted access to team invitations, project chat rooms, and cryptographic credential attestation.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: DANGER ZONE */}
      {activeTab === 'danger' && (
        <div className="bg-[#181215] border border-rose-900/40 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-rose-300">Danger Zone & GDPR Statutory Erasure</h2>
            <p className="text-xs text-rose-400/80 mt-1">Irreversible privacy and account lifecycle operations</p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-rose-900/30 text-xs">
            <div>
              <p className="font-semibold text-zinc-200">Deactivate Account</p>
              <p className="text-[11px] text-zinc-400">Temporarily pause discovery and hide profile.</p>
            </div>
            <button
              onClick={handleDeactivate}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold"
            >
              Deactivate
            </button>
          </div>

          <div className="pt-4 border-t border-rose-900/30 space-y-3 text-xs">
            <div>
              <p className="font-semibold text-rose-300">Request Permanent Account Deletion</p>
              <p className="text-[11px] text-zinc-400">
                Schedules irreversible deletion with a 14-day statutory grace period during which you can cancel.
              </p>
            </div>
            <form onSubmit={handleDeleteRequest} className="flex flex-col sm:flex-row gap-2 max-w-lg">
              <input
                type="text"
                placeholder="Reason (optional)"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="bg-[#1b1b26] text-white p-2.5 rounded-xl border border-rose-900/50 text-xs flex-1"
              />
              <input
                type="text"
                placeholder="Type DELETE"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="bg-[#1b1b26] text-white p-2.5 rounded-xl border border-rose-900/50 text-xs w-32"
              />
              <button
                type="submit"
                disabled={deleteConfirmation !== 'DELETE' || loading}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold"
              >
                Schedule Deletion
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
