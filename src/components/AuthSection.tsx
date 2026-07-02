import { useState, FormEvent } from 'react';
import { Mail, Lock, Shield, Sparkles, UserPlus, LogIn } from 'lucide-react';

interface AuthSectionProps {
  onLogin: (email: string, username: string) => void;
  theme: 'light' | 'dark' | 'glass';
}

export default function AuthSection({ onLogin, theme }: AuthSectionProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showVerificationMsg, setShowVerificationMsg] = useState(false);
  const [showPasswordResetMsg, setShowPasswordResetMsg] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simulate verification check on register
    if (isRegister) {
      setShowVerificationMsg(true);
      setTimeout(() => {
        onLogin(email, username || 'New Creator');
      }, 2000);
    } else {
      onLogin(email, username || 'New Creator');
    }
  };

  const handleGoogleSignIn = () => {
    onLogin('google.user@pulse.social', 'Pulse Creator');
  };

  const handleResetPassword = () => {
    if (!email) {
      alert('Please enter your email address to reset your password.');
      return;
    }
    setShowPasswordResetMsg(true);
    setTimeout(() => setShowPasswordResetMsg(false), 5000);
  };

  const containerStyle = theme === 'glass'
    ? 'bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-white/20 dark:border-zinc-800/20 shadow-2xl'
    : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl';

  const inputStyle = 'w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-sm';

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900">
      
      {/* Visual background ambient circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-gradient-to-tr from-pink-500/10 to-transparent blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl" />

      <div className={`w-full max-w-md p-8 rounded-3xl border relative z-10 transition-colors duration-300 ${containerStyle}`}>
        
        {/* App Logo & Greeting */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4 animate-pulse">
            <span className="text-white font-display font-extrabold text-2xl tracking-tight">P</span>
          </div>
          <h2 className="font-display font-black text-3xl tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Pulse Social
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-xs font-semibold uppercase tracking-wider">
            {isRegister ? 'Join the creative waves' : 'Welcome back to the loop'}
          </p>
        </div>

        {/* Dynamic status feedback lines */}
        {showVerificationMsg && (
          <div id="verification-notice" className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center font-bold animate-pulse">
            ✓ Registration successful! Sending user verification email...
          </div>
        )}

        {showPasswordResetMsg && (
          <div id="password-reset-notice" className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs text-center font-bold">
            ⚡️ Security link sent! Check your inbox to securely reset password keys.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4.5 h-4.5" />
              <input
                id="auth-email-input"
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputStyle}
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <div className="relative">
                <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4.5 h-4.5" />
                <input
                  id="auth-username-input"
                  type="text"
                  placeholder="Choose Username"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className={inputStyle}
                />
              </div>
            </div>
          )}

          <div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4.5 h-4.5" />
              <input
                id="auth-password-input"
                type="password"
                placeholder="Secure Password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputStyle}
              />
            </div>
          </div>

          {/* Actions */}
          {!isRegister && (
            <div className="text-right">
              <button
                id="btn-forgot-password"
                type="button"
                onClick={handleResetPassword}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline active:scale-95 transition-transform"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            id="btn-auth-submit"
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-2xl hover:opacity-95 shadow-lg shadow-purple-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{isRegister ? 'Create Creative Account' : 'Sign In Now'}</span>
          </button>
        </form>

        {/* Google Sign-In Option */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200 dark:border-zinc-800" /></div>
          <span className="relative px-3 bg-white dark:bg-zinc-950 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Or</span>
        </div>

        <button
          id="btn-google-signin"
          onClick={handleGoogleSignIn}
          className="w-full py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all flex items-center justify-center gap-2 text-sm active:scale-98"
        >
          {/* Custom minimal Google logo */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.5 15 1 12 1 7.3 1 3.3 3.7 1.4 7.7l3.9 3C6.2 7.7 8.9 5.04 12 5.04z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.1-2 3.7-4.9 3.7-8.7z"/>
            <path fill="#FBBC05" d="M5.3 14.3c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L1.4 7.3C.5 9.1 0 11.1 0 13.2c0 2.1.5 4.1 1.4 5.9l3.9-3.1z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1.1.7-2.5 1.2-4.2 1.2-3.1 0-5.8-2.6-6.7-5.7L1.4 15.8C3.3 19.8 7.3 23 12 23z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Switch Mode Toggle */}
        <div className="mt-8 text-center text-xs text-zinc-500">
          <span>{isRegister ? 'Already have an account?' : 'New explorer of Pulse?'}</span>
          <button
            id="btn-auth-mode-toggle"
            onClick={() => setIsRegister(!isRegister)}
            className="ml-1 text-purple-600 dark:text-purple-400 font-bold hover:underline"
          >
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </div>

      </div>

    </div>
  );
}
