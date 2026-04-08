import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '', username: '', name: '',
    password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setErrors({ submit: "Passwords don't match" });
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:8080/api/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setErrors({ submit: data.message || 'Registration failed' });
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrors({ submit: 'Connection error. Make sure backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className={`font-bold text-lg tracking-tight ${scrolled ? "text-gray-900" : "text-black"}`}>
                Smart Campus
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: "Home", href: "/" },
                { label: "Features", href: "#features" },
                { label: "About", href: "#about" },
                { label: "Contact", href: "#contact" },
              ].map(link => (
                <a key={link.label} href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-teal-500 ${
                    scrolled ? "text-gray-600" : "text-black/90"
                  }`}>
                  {link.label}
                </a>
              ))}
            </div>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login"
                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
                  scrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-black hover:bg-white/10"
                }`}>
                Sign In
              </Link>
              <Link to="/register"
                className="text-sm font-semibold px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors shadow-sm">
                Sign Up
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-lg ${scrolled ? "text-gray-700" : "text-white"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden bg-white rounded-2xl shadow-xl border border-gray-100 mb-4 p-4">
              <div className="space-y-1 mb-4">
                {["Home", "Features", "About", "Contact"].map(item => (
                  <a key={item} href={item === "Home" ? "/" : `#${item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg">
                    {item}
                  </a>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold text-white bg-teal-500 rounded-lg hover:bg-teal-600">
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {/* Register Form */}
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Create Account</h1>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              Account created! Redirecting to login...
            </div>
          )}

          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (use @sliit.lk or @students.sliit.lk)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ITXXXXXXXX@sliit.lk"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="john_doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-500 font-semibold hover:text-teal-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}