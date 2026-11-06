'use client';

import { useState } from 'react';
import { X, Sparkles, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthModal() {
  const isOpen = useAuthStore((s) => s.isAuthModalOpen);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, phone, password });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const fillDemoAdmin = () => {
    setTab('login');
    setEmail('admin@artisticfusion.com');
    setPassword('Admin@12345');
    setError(null);
  };

  const fillDemoCustomer = () => {
    setTab('login');
    setEmail('customer@artisticfusion.com');
    setPassword('Customer@123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-sm shadow-2xl border border-brand-border overflow-hidden">
        {/* Header */}
        <div className="relative bg-brand-blush px-6 py-5 text-center border-b border-brand-border">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-brand-gold/50 text-brand-gold mb-2">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-serif uppercase tracking-widest text-lg text-brand-charcoal">
            Welcome to Artistic Fusion
          </h3>
          <p className="font-serif italic text-xs text-brand-gold mt-0.5">
            something handmade is so much more beautiful
          </p>
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute right-4 top-4 p-1 text-brand-muted hover:text-brand-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 border-b border-brand-border text-xs font-semibold uppercase tracking-widest">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`py-3.5 transition-colors ${
              tab === 'login'
                ? 'bg-white text-brand-crimson border-b-2 border-brand-crimson'
                : 'bg-brand-surface text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`py-3.5 transition-colors ${
              tab === 'register'
                ? 'bg-white text-brand-crimson border-b-2 border-brand-crimson'
                : 'bg-brand-surface text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-brand-crimson">
              {error}
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="w-full text-sm border-brand-border focus:border-brand-gold focus:ring-brand-gold"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full text-sm border-brand-border focus:border-brand-gold focus:ring-brand-gold"
            />
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Mobile Number (for Delivery Updates)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full text-sm border-brand-border focus:border-brand-gold focus:ring-brand-gold"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full text-sm border-brand-border focus:border-brand-gold focus:ring-brand-gold"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-brand-charcoal text-white hover:bg-brand-gold text-xs font-semibold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>
              {isLoading
                ? 'Please wait...'
                : tab === 'login'
                ? 'Sign In to Continue'
                : 'Create Account'}
            </span>
          </button>

          {/* Quick Demo Credentials Fill for Instant Evaluation */}
          <div className="pt-3 border-t border-brand-border flex items-center justify-between text-[11px] text-brand-muted">
            <span>Quick Test Fill:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fillDemoCustomer}
                className="px-2 py-1 bg-brand-blush hover:bg-brand-petal text-brand-charcoal rounded-xs transition-colors"
              >
                Demo Customer
              </button>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="px-2 py-1 bg-brand-gold-light hover:bg-brand-gold hover:text-white text-brand-charcoal rounded-xs transition-colors"
              >
                Default Admin
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
