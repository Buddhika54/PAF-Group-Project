import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin/dashboard' : '/dashboard');
    }
  }, [isAuthenticated]);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.endsWith("@sliit.lk") &&
      !email.endsWith("@students.sliit.lk")) {
      setError("Only @sliit.lk email addresses are allowed");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setError("Invalid email or password");
        } else if (response.status === 403) {
          setError("Your account has been disabled. Contact admin.");
        } else {
          setError("Something went wrong. Try again.");
        }
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);

      if (data.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (data.role === "TECHNICIAN") {
        navigate("/technician/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT SIDE — Image ─────────────────────────── */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">

        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
          className="w-full h-full object-cover"
          alt="Smart Campus Students"
        />

        {/* Teal overlay */}
        <div className="absolute inset-0 bg-teal-600/75 flex flex-col justify-between p-12">

          {/* Top logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-white font-bold text-sm tracking-widest uppercase">
              Smart Campus
            </span>
          </div>

          {/* Bottom text */}
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Let's Grow Up<br />
              Your Future<br />
              With Smart Campus
            </h2>
            <p className="text-white/75 text-sm leading-relaxed">
              Manage facilities, discover resources,<br />
              and handle incidents seamlessly.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE — Form ─────────────────────────── */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-sm">

          {/* Top right logo */}
          <div className="flex justify-end mb-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-teal-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-teal-600 font-bold text-xs tracking-widest uppercase">
                Smart Campus
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-8">
            Sign in to your account
          </h1>

          {/* Error message */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Email input */}
          <div className="mb-5">
            <label className="block text-xs text-gray-500 mb-1 font-medium">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@sliit.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="w-full border-b border-gray-300 focus:border-teal-500 focus:outline-none py-2 text-sm text-gray-800 bg-transparent placeholder-gray-400 transition-colors duration-200"
            />
          </div>

          {/* Forgot password link */}
          <div className="flex justify-end mb-1">
            <a
              href="/forgot-password"
              className="text-xs text-teal-500 hover:text-teal-600 transition-colors"
            >
              Forgot Password?
            </a>
          </div>

          {/* Password input */}
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-1 font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="w-full border-b border-gray-300 focus:border-teal-500 focus:outline-none py-2 text-sm text-gray-800 bg-transparent placeholder-gray-400 pr-8 transition-colors duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Keep me logged in */}
          <div className="flex items-center gap-2 mb-8">
            <input
              type="checkbox"
              id="keepLoggedIn"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500 cursor-pointer"
            />
            <label
              htmlFor="keepLoggedIn"
              className="text-sm text-gray-500 cursor-pointer select-none"
            >
              Keep me logged in
            </label>
          </div>

          {/* Sign In button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          {/* OR divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Login button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-3 hover:bg-gray-50 transition-colors duration-200 group"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-gray-600 font-medium text-sm group-hover:text-gray-800 transition-colors">
              Continue with Google
            </span>
          </button>

          {/* Request Access link */}
          <p className="text-center mt-6 text-xs text-gray-400">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-teal-500 font-medium hover:text-teal-600 transition-colors"
            >
              Request Access →
            </a>
          </p>

          {/* Footer */}
          <p className="text-center mt-8 pt-6 border-t border-gray-100 text-xs text-gray-300">
            SLIIT Faculty of Computing
          </p>

        </div>
      </div>
    </div>
  );
}
