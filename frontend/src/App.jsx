import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Seasons from './pages/Seasons';
import Matchups from './pages/Matchups';
import HeadToHead from './pages/HeadToHead';
import Teams from './pages/Teams';
import Records from './pages/Records';
import Draft from './pages/Draft';
import Rosters from './pages/Rosters';

function NavLink({ to, children, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-white/20 text-white shadow-lg'
          : 'text-white/80 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation */}
        <nav className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-lg shadow-2xl sticky top-0 z-50 border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-200">🏈</div>
                <div>
                  <div className="text-base sm:text-xl font-bold text-white tracking-tight">
                    Valley Natives
                  </div>
                  <div className="text-xs text-white/70 font-medium hidden sm:block">Fantasy Football</div>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-2">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/seasons">Seasons</NavLink>
                <NavLink to="/records">Records</NavLink>
                <NavLink to="/draft">Draft</NavLink>
                <NavLink to="/matchups">Matchups</NavLink>
                <NavLink to="/head-to-head">H2H</NavLink>
                <NavLink to="/rosters">Rosters</NavLink>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden pb-4 space-y-2">
                <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
                <NavLink to="/seasons" onClick={() => setMobileMenuOpen(false)}>Seasons</NavLink>
                <NavLink to="/records" onClick={() => setMobileMenuOpen(false)}>Records</NavLink>
                <NavLink to="/draft" onClick={() => setMobileMenuOpen(false)}>Draft</NavLink>
                <NavLink to="/matchups" onClick={() => setMobileMenuOpen(false)}>Matchups</NavLink>
                <NavLink to="/head-to-head" onClick={() => setMobileMenuOpen(false)}>H2H</NavLink>
                <NavLink to="/rosters" onClick={() => setMobileMenuOpen(false)}>Rosters</NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/seasons" element={<Seasons />} />
            <Route path="/matchups" element={<Matchups />} />
            <Route path="/head-to-head" element={<HeadToHead />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/records" element={<Records />} />
            <Route path="/draft" element={<Draft />} />
            <Route path="/rosters" element={<Rosters />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900/50 backdrop-blur-lg border-t border-white/10 py-8 mt-20">
          <div className="container mx-auto px-6 text-center">
            <p className="text-white/80 font-medium">Valley Natives Fantasy Football</p>
            <p className="text-sm text-white/50 mt-2">Historical Data Explorer • 2007-2024</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
