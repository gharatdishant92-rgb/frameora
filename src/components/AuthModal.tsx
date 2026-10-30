import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { UserRole } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, demoLogin } = useAuth();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      // Simulate standard email/pass login or demo login
      await demoLogin('customer');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError('Google Sign-In was cancelled or failed. You can use the Quick Demo Login buttons below.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleQuickLogin = async (role: UserRole) => {
    setIsSubmitting(true);
    try {
      await demoLogin(role);
      onClose();
    } catch (err: any) {
      setError('Quick login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <span className="font-serif text-2xl tracking-[0.2em] text-white font-medium block">
            FRAMEORA
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 block font-semibold">
            {isSignUp ? 'Client Registration' : 'Client Concierge Access'}
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {forgotSent ? (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs rounded-lg text-center space-y-2">
            <p className="font-medium">Password Reset Instructions Dispatched</p>
            <p className="text-zinc-400">If an account exists with this email, reset instructions have been forwarded.</p>
            <button
              onClick={() => setForgotSent(false)}
              className="text-amber-400 underline pt-2 text-xs"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-400 text-sm"
                  />
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-400 text-sm"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-zinc-400 block font-medium">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setForgotSent(true)}
                    className="text-[11px] text-zinc-400 hover:text-amber-400 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-400 text-sm"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-amber-400 text-zinc-950 font-semibold text-xs uppercase tracking-widest hover:bg-amber-300 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSignUp ? 'Create Atelier Account' : 'Sign In to Portal'}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-zinc-950 px-3 text-[11px] text-zinc-500 uppercase tracking-wider">or continue with</span>
          <div className="border-t border-zinc-800 w-full" />
        </div>

        {/* Google OAuth Login */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500 flex items-center justify-center gap-3 text-xs uppercase tracking-wider font-medium cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google Sign In</span>
        </button>

        {/* Quick Demo Switcher */}
        <div className="pt-2 border-t border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block text-center mb-2">
            Instant Demo Logins (One-Click)
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleRoleQuickLogin('admin')}
              className="px-2.5 py-1.5 rounded bg-amber-400/10 border border-amber-400/40 text-amber-300 hover:bg-amber-400/20 text-[11px] font-medium"
            >
              Director (Admin)
            </button>
            <button
              onClick={() => handleRoleQuickLogin('customer')}
              className="px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-[11px] font-medium"
            >
              Client (Priya)
            </button>
          </div>
        </div>

        {/* Toggle sign in / sign up */}
        <div className="text-center pt-2 text-xs text-zinc-400">
          {isSignUp ? (
            <span>
              Already have an atelier account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-amber-400 hover:underline font-medium cursor-pointer"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to FRAMEORA?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-amber-400 hover:underline font-medium cursor-pointer"
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
