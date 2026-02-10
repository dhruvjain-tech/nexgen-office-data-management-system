
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError('Please enter both User ID and password.');
      return;
    }

    // Specific Admin Credentials Check
    const isAdmin = 
      trimmedUsername.toLowerCase() === 'dhruv jain' && 
      trimmedPassword === 'admindhruv1234';

    const selectedRole = isAdmin ? UserRole.ADMIN : UserRole.USER;

    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      username: trimmedUsername,
      role: selectedRole,
      email: `${trimmedUsername.toLowerCase().replace(/\s+/g, '.')}@nexgen.com`
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      {/* Background Polish */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-slate-800/10">
        <div className="bg-slate-50 p-8 border-b border-slate-200 text-center">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg shadow-blue-500/30">
            N
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">NexGen Systems</h1>
          <p className="text-slate-500 text-sm mt-1">Enterprise Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs py-2 px-3 rounded-lg font-medium text-center animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">User ID / Name</label>
            <input
              required
              type="text"
              placeholder="Enter your ID"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Security Password</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Secure Login</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center items-center gap-2 pt-4">
            <div className="h-px bg-slate-200 flex-grow"></div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest px-2">Protected Environment</span>
            <div className="h-px bg-slate-200 flex-grow"></div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
