import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
      window.location.href = '/me/profile';
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
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error?.message || 'Invalid credentials');

      localStorage.setItem('token', data.tokens?.accessToken);
      if (data.tokens?.refreshToken) localStorage.setItem('refreshToken', data.tokens.refreshToken);
      window.location.href = '/me/profile';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111116] border border-[#22222e] rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#0A1680] text-[#93B2F8] flex items-center justify-center font-bold text-xl shadow-lg shadow-[#0A1680]/30">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to SkillForge</h1>
          <p className="text-xs text-zinc-400">Proof, Verification & Talent Market Platform</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@skillforge.io"
              className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-zinc-300 font-semibold">Password</label>
              <button
                type="button"
                onClick={() => navigate('/auth/forgot-password')}
                className="text-[11px] text-[#93B2F8] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#282836] bg-[#1b1b22] text-[#0A1680] focus:ring-0"
              />
              <span>Remember me for 30 days</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </form>

        <div className="pt-2 border-t border-[#22222e] text-center text-xs text-zinc-400">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/auth/register')}
            className="font-semibold text-[#93B2F8] hover:underline"
          >
            Create an Account
          </button>
        </div>

        {/* Dev Quick-Login Pills */}
        <div className="pt-4 border-t border-[#22222e]/60 space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold text-center">
            One-Click Dev Authentication
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDevLogin('user-001')}
              className="px-2 py-2 rounded-lg bg-[#1b1b22] hover:bg-[#252530] border border-[#282836] text-[11px] font-medium text-zinc-300 text-center transition-colors"
            >
              Candidate (001)
            </button>
            <button
              type="button"
              onClick={() => handleDevLogin('recruiter-001')}
              className="px-2 py-2 rounded-lg bg-[#1b1b22] hover:bg-[#252530] border border-[#282836] text-[11px] font-medium text-zinc-300 text-center transition-colors"
            >
              Recruiter (001)
            </button>
            <button
              type="button"
              onClick={() => handleDevLogin('admin-001')}
              className="px-2 py-2 rounded-lg bg-[#1b1b22] hover:bg-[#252530] border border-[#282836] text-[11px] font-medium text-zinc-300 text-center transition-colors"
            >
              Admin (001)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [intendedUse, setIntendedUse] = useState('seeking_work');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('You must accept the terms of service and privacy policy.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          intendedUse,
          termsAccepted,
          privacyAccepted: termsAccepted,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error?.message || 'Registration failed');

      setSuccess('Account created successfully! Check the API console for your verification link.');
      localStorage.setItem('token', data.tokens?.accessToken);
      if (data.tokens?.refreshToken) localStorage.setItem('refreshToken', data.tokens.refreshToken);
      setTimeout(() => {
        window.location.href = '/me/profile';
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#111116] border border-[#22222e] rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your SkillForge Account</h1>
          <p className="text-xs text-zinc-400">Join the verified engineering network</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Chen"
              className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5">Work / Personal Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.chen@example.com"
              className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5">Password (8+ chars)</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5">Primary Intended Use</label>
            <select
              value={intendedUse}
              onChange={(e) => setIntendedUse(e.target.value)}
              className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none cursor-pointer"
            >
              <option value="seeking_work">Seeking Work & Direct Recruiter Outreach</option>
              <option value="hiring">Hiring Engineers & Reviewing Verified Dossiers</option>
              <option value="learning">Continuous Skill Learning & Challenges</option>
              <option value="open_source">Open-Source Project Collaboration</option>
            </select>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2 cursor-pointer text-zinc-400">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded border-[#282836] bg-[#1b1b22] text-[#0A1680] focus:ring-0"
              />
              <span>
                I agree to the SkillForge Terms of Service, Privacy Policy, and consent to auditable proof attestation records.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </form>

        <div className="pt-2 border-t border-[#22222e] text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/auth/login')}
            className="font-semibold text-[#93B2F8] hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export const AccountSettingsPage: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: string; error?: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setStatus(null);
      const res = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || 'user-001'}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update password');
      setStatus({ success: 'Password changed successfully.' });
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setStatus({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to temporarily deactivate your account? Your public profile will be hidden.')) return;
    try {
      setLoading(true);
      const res = await fetch('/api/v1/auth/deactivate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || 'user-001'}` },
      });
      if (res.ok) {
        setStatus({ success: 'Account deactivated. You can reactivate anytime by logging in.' });
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
      setStatus({ error: 'Please type DELETE in capitals to confirm.' });
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/v1/auth/delete-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || 'user-001'}`,
        },
        body: JSON.stringify({ reason: 'User requested deletion' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Deletion request failed');
      setStatus({ success: data.message });
      setDeleteConfirmation('');
    } catch (err: any) {
      setStatus({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 animate-fadeIn">
      <div className="border-b border-[#282836] pb-4">
        <h1 className="text-xl font-bold text-white">Account & Security Settings</h1>
        <p className="text-xs text-zinc-400">Manage credentials, active devices, and GDPR data rights</p>
      </div>

      {status?.error && (
        <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
          {status.error}
        </div>
      )}
      {status?.success && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
          {status.success}
        </div>
      )}

      {/* Password Change Card */}
      <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-md">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">New Password (8+ chars)</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
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

      {/* Danger Zone */}
      <div className="bg-[#181113] border border-rose-900/40 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-rose-300 flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Danger Zone & Data Erasure
          </h2>
          <p className="text-xs text-rose-400/80 mt-1">Irreversible privacy and account lifecycle operations</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-rose-900/30">
          <div>
            <p className="text-xs font-semibold text-zinc-200">Deactivate Account</p>
            <p className="text-[11px] text-zinc-400">Hides profile, proof graphs, and pause notifications immediately.</p>
          </div>
          <button
            onClick={handleDeactivate}
            className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Deactivate
          </button>
        </div>

        <div className="pt-4 border-t border-rose-900/30 space-y-3">
          <div>
            <p className="text-xs font-semibold text-rose-300">Request Complete GDPR Account Deletion</p>
            <p className="text-[11px] text-zinc-400">
              Initiates irreversible deletion with a 14-day statutory grace period during which you can cancel.
            </p>
          </div>
          <form onSubmit={handleDeleteRequest} className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Type DELETE to confirm"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="bg-[#1b1b22] text-white text-xs p-2.5 rounded-xl border border-rose-900/50 focus:border-rose-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={deleteConfirmation !== 'DELETE' || loading}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Request Permanent Deletion
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
