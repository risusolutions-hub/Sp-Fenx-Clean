import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import api, { setCSRFToken } from '../api';

export default function Login({ onLogin }){
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setError(null);
    setLoading(true);
    try{
      const res = await api.post('/auth/login', { identifier, password });
      // Store CSRF token
      if (res.data.csrfToken) {
        setCSRFToken(res.data.csrfToken);
        localStorage.setItem('csrfToken', res.data.csrfToken);
      }
      onLogin(res.data);
    }catch(err){
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center px-4">
      {/* Background Accent - subtle professional touch */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50/30 rounded-full -mr-48 -mt-48 pointer-events-none"></div>
      
      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-md flex items-center justify-center">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">LaserService</h1>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Enterprise System</p>
              </div>
            </div>
            <p className="text-sm text-neutral-600">Sign in to your account to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-error-50 border border-error-200 rounded-md flex gap-3">
              <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-error-900">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {/* Email/Name Field */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                placeholder="john@example.com"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                disabled={loading}
                required
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:bg-primary-800"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <p className="text-center text-xs text-neutral-500">
              Service Complaint Management System
            </p>
            <p className="text-center text-xs text-neutral-400 mt-2">
              © 2026 Risu Solutions. All rights reserved.
            </p>
          </div>
        </div>

        {/* Info Box */}
        {/* <div className="mt-4 p-4 bg-primary-50 rounded-md border border-primary-200"> */}
          {/* <p className="text-xs text-primary-800 font-medium mb-2"></p> */}
          {/* <p className="text-xs text-primary-700">Sparkle Leaser LLP</p> */}
        {/* </div> */}
      </div>
    </div>
  );
}
