import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft, Eye, EyeOff, AlertCircle, Sparkles, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';
import { RachyLogo } from './RachyLogo.tsx';

interface AdminLoginProps {
  onLoginSuccess: (token?: string) => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3-error trial tracking state
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(3);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Check attempt status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/auth/attempt-status');
        if (res.ok) {
          const data = await res.json();
          setAttemptsRemaining(typeof data.attemptsRemaining === 'number' ? data.attemptsRemaining : 3);
          if (data.locked) {
            setIsLocked(true);
            setRemainingSeconds(data.remainingSeconds || 900);
          }
        }
      } catch {
        // Fallback to local default
      }
    };

    fetchStatus();
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (!isLocked || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setAttemptsRemaining(3);
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, remainingSeconds]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setError(`Portal is locked. Please wait ${formatCountdown(remainingSeconds)} before trying again.`);
      return;
    }

    if (!password) {
      setError('Please enter the admin password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (!res.ok) {
        if (typeof data.attemptsRemaining === 'number') {
          setAttemptsRemaining(data.attemptsRemaining);
        }

        if (data.locked) {
          setIsLocked(true);
          setRemainingSeconds(data.remainingSeconds || 900);
          throw new Error(data.error || 'Too many incorrect attempts. Portal is locked for 15 minutes.');
        }

        throw new Error(data.error || 'Incorrect password.');
      }

      // Successful login
      setAttemptsRemaining(3);
      setIsLocked(false);

      if (data.token) {
        sessionStorage.setItem('rachy_admin_token', data.token);
      }
      onLoginSuccess(data.token);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check the password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="admin-login-page"
      className="min-h-screen bg-[#0e0c0b] text-[#f5ece2] flex flex-col justify-center items-center px-4 py-12 relative"
    >
      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] rounded-full pointer-events-none opacity-30 blur-[90px]"
        style={{
          background: 'radial-gradient(circle, #e2417e 0%, rgba(226,65,126,0.1) 50%, transparent 70%)'
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-md relative z-10">
        
        {/* Back button */}
        <button
          id="login-back-btn"
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#b8a89d] hover:text-[#e2417e] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to public website</span>
        </button>

        {/* Card */}
        <div className="bg-[#17140f] border border-[rgba(245,236,226,0.12)] rounded-2xl p-6 sm:p-8 shadow-2xl">
          
          {/* Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <RachyLogo variant="badge" className="w-24 h-24 rounded-2xl mb-3 shadow-xl" />

            <h1 className="font-serif font-bold text-2xl text-[#f5ece2]">
              Rachy's Admin Portal
            </h1>
            <p className="text-xs text-[#b8a89d] mt-1">
              Protected login for managing catalogue packages &amp; prices
            </p>
          </div>

          {/* 3-Trial Security Status Indicator */}
          <div className="mb-5 p-3 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.08)]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-[#b8a89d] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#e2417e]" />
                <span>Security Trial Limit:</span>
              </span>
              <span
                className={`font-semibold ${
                  isLocked
                    ? 'text-red-400'
                    : attemptsRemaining === 1
                    ? 'text-amber-400'
                    : 'text-[#f5ece2]'
                }`}
              >
                {isLocked
                  ? 'Locked (0/3 trials)'
                  : `${attemptsRemaining} of 3 trials remaining`}
              </span>
            </div>

            {/* Trial Progress Dots */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((num) => {
                const isUsed = num > attemptsRemaining;
                return (
                  <div
                    key={num}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      isLocked
                        ? 'bg-red-500'
                        : isUsed
                        ? 'bg-red-500/70'
                        : num === 3 && attemptsRemaining === 1
                        ? 'bg-amber-400'
                        : 'bg-[#e2417e]'
                    }`}
                  />
                );
              })}
            </div>

            {/* Lockout Warning Banner */}
            {isLocked ? (
              <div className="mt-3 pt-2.5 border-t border-red-500/20 text-[11px] text-red-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>Cooldown timer:</span>
                </span>
                <span className="font-mono font-bold text-red-400 text-xs">
                  {formatCountdown(remainingSeconds)}
                </span>
              </div>
            ) : attemptsRemaining === 1 ? (
              <p className="mt-2 text-[10px] text-amber-300/90 font-medium">
                ⚠️ Final attempt warning: 1 more failure will lock access for 15 minutes.
              </p>
            ) : null}
          </div>

          {error && (
            <div
              id="login-error-alert"
              className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-password-input"
                className="block text-xs font-semibold uppercase tracking-wider text-[#b8a89d] mb-1.5"
              >
                Admin Password
              </label>
              <div className="relative">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLocked ? 'Portal temporarily locked...' : 'Enter admin password...'}
                  required
                  disabled={isLocked || loading}
                  autoFocus={!isLocked}
                  className="w-full px-4 py-3 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.15)] text-[#f5ece2] placeholder-[#b8a89d]/40 focus:outline-none focus:border-[#e2417e] transition-colors text-sm pr-11 disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8a89d] hover:text-[#f5ece2] transition-colors p-1 disabled:opacity-40"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={loading || isLocked}
              className="w-full py-3.5 rounded-xl bg-[#e2417e] hover:bg-[#c92e6c] text-white font-semibold text-sm transition-all shadow-lg shadow-[#e2417e]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isLocked ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Locked ({formatCountdown(remainingSeconds)})</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                </>
              )}
            </button>
          </form>

          {/* Development / Preview Access Credentials Hint */}
          <div className="mt-6 pt-5 border-t border-[rgba(245,236,226,0.08)]">
            <div className="p-3 rounded-xl bg-[#1f1a15]/60 border border-[rgba(245,236,226,0.08)] text-[11px] text-[#b8a89d] flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#e2417e] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#f5ece2] font-medium">Default Password:</span>{' '}
                <code className="px-1.5 py-0.5 bg-[#0e0c0b] text-[#e2417e] rounded font-mono">
                  rachytreats2024
                </code>
                <p className="mt-1 text-[10px] text-[#b8a89d]/75">
                  Access URL: <code className="text-[#f5ece2]">/admin</code> or <code className="text-[#f5ece2]">/admin/login</code>
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
