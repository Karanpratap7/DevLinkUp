import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Redirect to the attempted page or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-opacity duration-500 ease-in-out">
      {/* Background Elements - Removed as body has background */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black"></div>
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-red-600 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-20 w-2 h-2 bg-white rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-8">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-netflix-white">Dev</span>
              <span className="text-netflix-red">LinkUp</span>
            </h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-netflix-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-netflix-light-gray">
            Sign in to your developer account
          </p>
        </div>

        {/* Login Form Container */}
        <div className="bg-netflix-dark-gray py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-900/50 text-red-200 p-4 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-netflix-light-gray mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-netflix-black border border-netflix-dark-gray rounded-md placeholder-gray-500 text-netflix-white focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-netflix-red transition-all duration-200"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-netflix-light-gray mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-netflix-black border border-netflix-dark-gray rounded-md placeholder-gray-500 text-netflix-white focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-netflix-red transition-all duration-200"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-netflix-white bg-netflix-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-netflix-red disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-netflix-red group-hover:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Sign In
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-netflix-dark-gray"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-netflix-dark-gray text-netflix-light-gray">New to DevLinkUp?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link
                to="/register"
                className="group inline-flex items-center font-medium text-netflix-red hover:text-red-400 transition-colors duration-200"
              >
                Create your account
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-netflix-light-gray">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-netflix-red hover:text-red-500 transition-colors duration-200">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-netflix-red hover:text-red-500 transition-colors duration-200">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}