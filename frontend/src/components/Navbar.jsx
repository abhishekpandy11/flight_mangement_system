import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage OR system preference on first load
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // Apply dark mode on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-white font-semibold border-b-2 border-white pb-0.5"
      : "text-blue-100 hover:text-white transition-colors duration-150";

  return (
    <nav
      className="sticky top-0 z-50 text-white px-6 py-0 shadow-lg"
      style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)",
        boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-extrabold tracking-wide group"
        >
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center text-blue-700 text-lg font-black shadow-md group-hover:scale-110 transition-transform duration-200"
            style={{ background: "white" }}
          >
            ✈
          </span>
          <span className="text-white">SkyRoute</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-7">
          <Link to="/" className={`text-sm flex items-center gap-1.5 ${isActive("/")}`}>
            <span>🔍</span> Search Flights
          </Link>
          <Link to="/hotels" className={`text-sm flex items-center gap-1.5 ${isActive("/hotels")}`}>
            <span>🏨</span> Hotels
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className={`text-sm flex items-center gap-1.5 ${isActive("/dashboard")}`}
            >
              <span>🗂️</span> My Bookings
            </Link>
          )}
        </div>

        {/* Right section: auth & dark mode */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
            title="Toggle Dark Mode"
          >
            {isDark ? (
              <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.708a1 1 0 01-1.414 1.414l-.708-.708a1 1 0 010-1.414zM16 10a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-4.22 4.22a1 1 0 011.415 1.414l-.707.708a1 1 0 01-1.414-1.414l.707-.708zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-4.22a1 1 0 010-1.414l-.708-.707a1 1 0 011.414-1.414l.708.707a1 1 0 01-1.414 1.414zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zm4.22-4.22A1 1 0 018.22 4.364l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 01-.22 1.415zM10 6a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-5 h-5 text-blue-100" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>

          {user ? (
            <>
              {/* My Bookings button — prominent CTA */}
              <Link
                to="/dashboard"
                className="hidden md:flex items-center gap-2 bg-white bg-opacity-15 hover:bg-opacity-25 border border-white border-opacity-30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                My Bookings
              </Link>

              {/* User avatar + name */}
              <div className="hidden md:flex items-center gap-2 bg-white bg-opacity-10 px-3 py-1.5 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-blue-700 font-bold text-sm shadow">
                  {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-blue-100">
                  {user?.username || user?.email?.split("@")[0] || "User"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-sm font-semibold px-4 py-2 rounded-xl text-blue-700 bg-white hover:bg-blue-50 transition-all duration-200 shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-blue-100 hover:text-white transition-colors duration-150 font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-white text-blue-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-sm"
              >
                Sign Up Free
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white text-2xl ml-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden pb-4 flex flex-col gap-3 border-t border-blue-500 border-opacity-40 pt-3">
          <Link to="/" className="text-sm text-blue-100 hover:text-white px-1" onClick={() => setMenuOpen(false)}>
            🔍 Search Flights
          </Link>
          <Link to="/hotels" className="text-sm text-blue-100 hover:text-white px-1" onClick={() => setMenuOpen(false)}>
            🏨 Hotels
          </Link>
          {user && (
            <Link to="/dashboard" className="text-sm text-white font-semibold px-1" onClick={() => setMenuOpen(false)}>
              🗂️ My Bookings
            </Link>
          )}
          {user ? (
            <button onClick={handleLogout} className="text-left text-sm text-red-300 hover:text-red-100 px-1">
              ⎋ Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm text-blue-100 hover:text-white px-1" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="text-sm font-bold text-white px-1" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
